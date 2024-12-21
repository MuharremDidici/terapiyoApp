import VideoSession from '../models/video.model.js';
import { ApiError } from '../utils/api-error.js';
import logger from '../config/logger.js';
import { redis } from '../config/database.js';
import socketService from '../utils/socket.js';
import { uploadToS3, deleteFromS3 } from '../utils/storage.js';
import { sendNotification } from '../utils/notification.js';
import { generateToken } from '../utils/token.js';
import { 
  initializeWebRTC,
  createMediaServer,
  generateIceServers
} from '../utils/webrtc.js';

class VideoService {
  /**
   * Session Management
   */
  async createSession(appointmentId, therapistId, clientId, options = {}) {
    try {
      const roomId = await this.#generateUniqueRoomId();
      const iceServers = await generateIceServers();

      const session = await VideoSession.create({
        appointment: appointmentId,
        therapist: therapistId,
        client: clientId,
        roomId,
        startTime: options.startTime,
        endTime: options.endTime,
        features: options.features,
        settings: options.settings,
        meta: {
          iceServers,
          platform: options.platform,
          sdkVersion: options.sdkVersion,
          region: options.region
        }
      });

      // Initialize WebRTC resources
      await initializeWebRTC(roomId, {
        maxParticipants: session.settings.maxParticipants,
        videoQuality: session.settings.videoQuality,
        audioQuality: session.settings.audioQuality
      });

      // Create media server instance
      await createMediaServer(roomId);

      // Schedule session reminders
      if (session.settings.notifications.reminder.enabled) {
        await this.#scheduleSessionReminders(session);
      }

      return session;
    } catch (error) {
      logger.error('Video session creation failed:', error);
      throw error;
    }
  }

  async joinSession(sessionId, userId, deviceInfo) {
    try {
      const session = await VideoSession.findById(sessionId);
      if (!session) {
        throw new ApiError(404, 'Session not found');
      }

      if (session.status !== 'scheduled' && session.status !== 'in_progress') {
        throw new ApiError(400, 'Session is not available for joining');
      }

      // Validate participant
      if (!session.therapist.equals(userId) && !session.client.equals(userId)) {
        throw new ApiError(403, 'Not authorized to join this session');
      }

      // Add participant
      const role = session.therapist.equals(userId) ? 'host' : 'participant';
      await session.addParticipant(userId, role);

      // Update session status if first participant
      if (session.status === 'scheduled') {
        await session.updateStatus('in_progress');
      }

      // Generate access token
      const token = await this.#generateSessionToken(session, userId, role);

      // Notify other participants
      this.#notifyParticipants(session.roomId, 'participant:joined', {
        userId,
        role,
        deviceInfo
      });

      return {
        session,
        token,
        iceServers: session.meta.iceServers
      };
    } catch (error) {
      logger.error('Session join failed:', error);
      throw error;
    }
  }

  async leaveSession(sessionId, userId) {
    try {
      const session = await VideoSession.findById(sessionId);
      if (!session) {
        throw new ApiError(404, 'Session not found');
      }

      await session.removeParticipant(userId);

      // Check if all participants have left
      const activeParticipants = session.participants.filter(p => !p.leftAt);
      if (activeParticipants.length === 0) {
        await session.updateStatus('completed');

        // Cleanup resources
        await this.#cleanupSession(session);
      }

      // Notify other participants
      this.#notifyParticipants(session.roomId, 'participant:left', {
        userId
      });

      return session;
    } catch (error) {
      logger.error('Session leave failed:', error);
      throw error;
    }
  }

  /**
   * Recording Management
   */
  async startRecording(sessionId, userId) {
    try {
      const session = await VideoSession.findById(sessionId);
      if (!session) {
        throw new ApiError(404, 'Session not found');
      }

      if (!session.features.recording) {
        throw new ApiError(400, 'Recording is not enabled for this session');
      }

      if (session.recording.enabled) {
        throw new ApiError(400, 'Recording is already in progress');
      }

      // Start recording on media server
      const recordingId = await this.startMediaRecording(session.roomId);

      // Update session
      session.recording = {
        enabled: true,
        startTime: new Date(),
        status: 'processing'
      };
      await session.save();

      // Notify participants
      this.#notifyParticipants(session.roomId, 'recording:started', {
        startedBy: userId
      });

      return session;
    } catch (error) {
      logger.error('Recording start failed:', error);
      throw error;
    }
  }

  async stopRecording(sessionId, userId) {
    try {
      const session = await VideoSession.findById(sessionId);
      if (!session) {
        throw new ApiError(404, 'Session not found');
      }

      if (!session.recording.enabled) {
        throw new ApiError(400, 'No recording in progress');
      }

      // Stop recording on media server
      const recordingData = await this.stopMediaRecording(session.roomId);

      // Upload recording to storage
      const fileUrl = await uploadToS3(recordingData.file, 'session-recordings');

      // Update session
      session.recording = {
        ...session.recording,
        enabled: false,
        url: fileUrl,
        endTime: new Date(),
        duration: Math.round((new Date() - session.recording.startTime) / 1000),
        size: recordingData.size,
        format: recordingData.format,
        status: 'completed'
      };
      await session.save();

      // Notify participants
      this.#notifyParticipants(session.roomId, 'recording:stopped', {
        stoppedBy: userId,
        duration: session.recording.duration
      });

      return session;
    } catch (error) {
      logger.error('Recording stop failed:', error);
      throw error;
    }
  }

  /**
   * Feature Management
   */
  async toggleFeature(sessionId, userId, feature, enabled) {
    try {
      const session = await VideoSession.findById(sessionId);
      if (!session) {
        throw new ApiError(404, 'Session not found');
      }

      if (!(feature in session.features)) {
        throw new ApiError(400, 'Invalid feature');
      }

      session.features[feature] = enabled;
      await session.save();

      // Notify participants
      this.#notifyParticipants(session.roomId, 'feature:updated', {
        feature,
        enabled,
        updatedBy: userId
      });

      return session;
    } catch (error) {
      logger.error('Feature toggle failed:', error);
      throw error;
    }
  }

  async updateSettings(sessionId, userId, settings) {
    try {
      const session = await VideoSession.findById(sessionId);
      if (!session) {
        throw new ApiError(404, 'Session not found');
      }

      if (!session.therapist.equals(userId)) {
        throw new ApiError(403, 'Only therapist can update settings');
      }

      session.settings = {
        ...session.settings,
        ...settings
      };
      await session.save();

      // Update media server settings
      await this.updateMediaServerSettings(session.roomId, settings);

      // Notify participants
      this.#notifyParticipants(session.roomId, 'settings:updated', {
        settings,
        updatedBy: userId
      });

      return session;
    } catch (error) {
      logger.error('Settings update failed:', error);
      throw error;
    }
  }

  /**
   * Chat Management
   */
  async sendChatMessage(sessionId, userId, content, type = 'text', file = null) {
    try {
      const session = await VideoSession.findById(sessionId);
      if (!session) {
        throw new ApiError(404, 'Session not found');
      }

      let fileUrl = null;
      if (file) {
        fileUrl = await uploadToS3(file, 'session-chat-files');
      }

      await session.addChatMessage(userId, content, type, fileUrl);

      // Notify participants
      this.#notifyParticipants(session.roomId, 'chat:message', {
        sender: userId,
        content,
        type,
        fileUrl
      });

      return session;
    } catch (error) {
      logger.error('Chat message send failed:', error);
      throw error;
    }
  }

  /**
   * Quality Management
   */
  async updateQualityMetrics(sessionId, metrics) {
    try {
      const session = await VideoSession.findById(sessionId);
      if (!session) {
        throw new ApiError(404, 'Session not found');
      }

      await session.updateQuality(metrics);

      // Notify participants if quality is poor
      if (this.#isQualityPoor(metrics)) {
        this.#notifyParticipants(session.roomId, 'quality:poor', {
          metrics
        });
      }

      return session;
    } catch (error) {
      logger.error('Quality metrics update failed:', error);
      throw error;
    }
  }

  /**
   * Helper Methods
   */
  async #generateUniqueRoomId() {
    const roomId = generateToken(12);
    const exists = await VideoSession.findOne({ roomId });
    if (exists) {
      return this.#generateUniqueRoomId();
    }
    return roomId;
  }

  async #generateSessionToken(session, userId, role) {
    const token = generateToken(32);
    await redis.set(
      `session:token:${token}`,
      JSON.stringify({
        sessionId: session._id,
        userId,
        role
      }),
      'EX',
      session.settings.tokenExpiry || 3600
    );
    return token;
  }

  async #scheduleSessionReminders(session) {
    // Hatırlatıcı planla
  }

  async #cleanupSession(session) {
    // Oturum temizleme
  }

  #notifyParticipants(roomId, event, data) {
    socketService.io.to(roomId).emit(event, data);
  }

  #isQualityPoor(metrics) {
    return (
      metrics.packetLoss > 5 ||
      metrics.jitter > 100 ||
      metrics.latency > 300
    );
  }
}

export default new VideoService();
