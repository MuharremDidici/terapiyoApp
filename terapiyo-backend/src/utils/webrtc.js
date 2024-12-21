// Import mediasoup and its components using dynamic import
let mediasoup;
let Worker;
let Router;
let WebRtcTransport;
let Producer;
let Consumer;

// Initialize mediasoup imports
async function initializeMediasoup() {
  const mediasoupModule = await import('mediasoup');
  mediasoup = mediasoupModule.default;
  Worker = mediasoupModule.Worker;
  Router = mediasoupModule.Router;
  WebRtcTransport = mediasoupModule.WebRtcTransport;
  Producer = mediasoupModule.Producer;
  Consumer = mediasoupModule.Consumer;
}

// Initialize mediasoup when module loads
await initializeMediasoup();

import { redis } from '../config/database.js';
import logger from '../config/logger.js';
import config from '../config/config.js';

// MediaSoup workers and routers
const workers = new Map();
const routers = new Map();

// WebRTC configurations
const webrtcConfig = {
  mediaCodecs: [
    {
      kind: 'audio',
      mimeType: 'audio/opus',
      clockRate: 48000,
      channels: 2
    },
    {
      kind: 'video',
      mimeType: 'video/VP8',
      clockRate: 90000,
      parameters: {
        'x-google-start-bitrate': 1000
      }
    },
    {
      kind: 'video',
      mimeType: 'video/VP9',
      clockRate: 90000,
      parameters: {
        'profile-id': 2,
        'x-google-start-bitrate': 1000
      }
    },
    {
      kind: 'video',
      mimeType: 'video/h264',
      clockRate: 90000,
      parameters: {
        'packetization-mode': 1,
        'profile-level-id': '4d0032',
        'level-asymmetry-allowed': 1,
        'x-google-start-bitrate': 1000
      }
    }
  ],
  webRtcTransport: {
    listenIps: [
      {
        ip: config.mediasoup.listenIp,
        announcedIp: config.mediasoup.announcedIp
      }
    ],
    initialAvailableOutgoingBitrate: 1000000,
    minimumAvailableOutgoingBitrate: 600000,
    maxSctpMessageSize: 262144,
    maxIncomingBitrate: 1500000
  }
};

/**
 * Initialize WebRTC resources for a session
 */
export async function initializeWebRTC(roomId, options = {}) {
  try {
    // Create worker if not exists
    let worker = workers.get(roomId);
    if (!worker) {
      worker = await mediasoup.createWorker({
        logLevel: config.env === 'development' ? 'debug' : 'error',
        logTags: ['info', 'ice', 'dtls', 'rtp', 'srtp', 'rtcp'],
        rtcMinPort: config.mediasoup.rtcMinPort,
        rtcMaxPort: config.mediasoup.rtcMaxPort
      });

      worker.on('died', () => {
        logger.error(`Worker died, roomId: ${roomId}`);
        workers.delete(roomId);
      });

      workers.set(roomId, worker);
    }

    // Create router if not exists
    let router = routers.get(roomId);
    if (!router) {
      router = await worker.createRouter({ mediaCodecs: webrtcConfig.mediaCodecs });
      routers.set(roomId, router);
    }

    // Store room settings in Redis
    await redis.hset(`room:${roomId}`, {
      maxParticipants: options.maxParticipants || 2,
      videoQuality: options.videoQuality || 'high',
      audioQuality: options.audioQuality || 'high'
    });

    return {
      routerId: router.id,
      rtpCapabilities: router.rtpCapabilities
    };
  } catch (error) {
    logger.error('WebRTC initialization failed:', error);
    throw error;
  }
}

/**
 * Create transport for a participant
 */
export async function createTransport(roomId, participantId, direction = 'send') {
  try {
    const router = routers.get(roomId);
    if (!router) {
      throw new Error('Router not found');
    }

    const transport = await router.createWebRtcTransport({
      ...webrtcConfig.webRtcTransport,
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
      enableSctp: true
    });

    transport.on('dtlsstatechange', (dtlsState) => {
      if (dtlsState === 'failed' || dtlsState === 'closed') {
        logger.error(`Transport dtls failed, roomId: ${roomId}, participantId: ${participantId}`);
      }
    });

    // Store transport info in Redis
    await redis.hset(`transport:${transport.id}`, {
      roomId,
      participantId,
      direction
    });

    return {
      id: transport.id,
      iceParameters: transport.iceParameters,
      iceCandidates: transport.iceCandidates,
      dtlsParameters: transport.dtlsParameters,
      sctpParameters: transport.sctpParameters
    };
  } catch (error) {
    logger.error('Transport creation failed:', error);
    throw error;
  }
}

/**
 * Connect transport
 */
export async function connectTransport(transportId, dtlsParameters) {
  try {
    const router = await getRouterByTransportId(transportId);
    const transport = await router.transport(transportId);

    await transport.connect({ dtlsParameters });
    return true;
  } catch (error) {
    logger.error('Transport connection failed:', error);
    throw error;
  }
}

/**
 * Create producer for a participant
 */
export async function createProducer(transportId, kind, rtpParameters, appData = {}) {
  try {
    const router = await getRouterByTransportId(transportId);
    const transport = await router.transport(transportId);

    const producer = await transport.produce({
      kind,
      rtpParameters,
      appData
    });

    producer.on('score', (score) => {
      // Handle producer score changes
    });

    producer.on('videoorientationchange', (videoOrientation) => {
      // Handle video orientation changes
    });

    // Store producer info in Redis
    const transportInfo = await redis.hgetall(`transport:${transportId}`);
    await redis.hset(`producer:${producer.id}`, {
      roomId: transportInfo.roomId,
      participantId: transportInfo.participantId,
      kind,
      appData: JSON.stringify(appData)
    });

    return {
      id: producer.id,
      kind: producer.kind,
      rtpParameters: producer.rtpParameters,
      type: producer.type
    };
  } catch (error) {
    logger.error('Producer creation failed:', error);
    throw error;
  }
}

/**
 * Create consumer for a participant
 */
export async function createConsumer(transportId, producerId, rtpCapabilities) {
  try {
    const router = await getRouterByTransportId(transportId);
    const transport = await router.transport(transportId);

    // Check if consumer can consume the producer
    if (!router.canConsume({ producerId, rtpCapabilities })) {
      throw new Error('Cannot consume producer');
    }

    const consumer = await transport.consume({
      producerId,
      rtpCapabilities,
      paused: true // Start paused
    });

    consumer.on('score', (score) => {
      // Handle consumer score changes
    });

    consumer.on('layerschange', (layers) => {
      // Handle consumer layers changes
    });

    // Store consumer info in Redis
    const transportInfo = await redis.hgetall(`transport:${transportId}`);
    await redis.hset(`consumer:${consumer.id}`, {
      roomId: transportInfo.roomId,
      participantId: transportInfo.participantId,
      producerId
    });

    return {
      id: consumer.id,
      kind: consumer.kind,
      rtpParameters: consumer.rtpParameters,
      type: consumer.type,
      producerPaused: consumer.producerPaused
    };
  } catch (error) {
    logger.error('Consumer creation failed:', error);
    throw error;
  }
}

/**
 * Generate ICE servers configuration
 */
export async function generateIceServers() {
  return [
    {
      urls: [
        'stun:stun1.l.google.com:19302',
        'stun:stun2.l.google.com:19302'
      ]
    },
    {
      urls: `turn:${config.turnServer.host}:${config.turnServer.port}`,
      username: config.turnServer.username,
      credential: config.turnServer.credential
    }
  ];
}

/**
 * Create media server instance
 */
export async function createMediaServer(roomId) {
  // Implementation depends on your media server setup
  logger.info(`Creating media server for room: ${roomId}`);
  return true;
}

/**
 * Remove media server instance
 */
export async function removeMediaServer(roomId) {
  try {
    // Cleanup router
    const router = routers.get(roomId);
    if (router) {
      router.close();
      routers.delete(roomId);
    }

    // Cleanup worker
    const worker = workers.get(roomId);
    if (worker) {
      worker.close();
      workers.delete(roomId);
    }

    // Cleanup Redis data
    const keys = await redis.keys(`*:${roomId}*`);
    if (keys.length > 0) {
      await redis.del(keys);
    }

    return true;
  } catch (error) {
    logger.error('Media server cleanup failed:', error);
    throw error;
  }
}

/**
 * Helper function to get router by transport ID
 */
async function getRouterByTransportId(transportId) {
  const transportInfo = await redis.hgetall(`transport:${transportId}`);
  if (!transportInfo || !transportInfo.roomId) {
    throw new Error('Transport not found');
  }

  const router = routers.get(transportInfo.roomId);
  if (!router) {
    throw new Error('Router not found');
  }

  return router;
}

/**
 * Update media server settings
 */
export async function updateMediaServerSettings(roomId, settings) {
  try {
    await redis.hset(`room:${roomId}`, settings);
    return true;
  } catch (error) {
    logger.error('Media server settings update failed:', error);
    throw error;
  }
}
