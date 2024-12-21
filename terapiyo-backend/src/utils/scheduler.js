import { EventEmitter } from 'events';
import logger from '../config/logger.js';

/**
 * Görev zamanlayıcı
 */
export class Scheduler extends EventEmitter {
  constructor(options = {}) {
    super();

    this.options = {
      maxConcurrent: options.maxConcurrent || 10,
      retryCount: options.retryCount || 3,
      retryDelay: options.retryDelay || 1000,
      timeout: options.timeout || 30000
    };

    this.jobs = new Map();
    this.running = new Map();
    this.queue = [];
  }

  /**
   * Görev tanımla
   */
  defineJob(name, handler, options = {}) {
    if (this.jobs.has(name)) {
      throw new Error(`Job ${name} already exists`);
    }

    this.jobs.set(name, {
      name,
      handler,
      options: { ...this.options, ...options }
    });
  }

  /**
   * Görev planla
   */
  scheduleJob(name, schedule, data = {}) {
    const job = this.jobs.get(name);
    if (!job) {
      throw new Error(`Job ${name} not found`);
    }

    const jobId = this.#generateJobId();
    const scheduledJob = {
      id: jobId,
      name,
      schedule,
      data,
      status: 'scheduled',
      nextRun: this.#calculateNextRun(schedule)
    };

    this.queue.push(scheduledJob);
    this.#sortQueue();

    this.emit('jobScheduled', scheduledJob);
    return jobId;
  }

  /**
   * Görevi hemen çalıştır
   */
  async runJob(name, data = {}) {
    const job = this.jobs.get(name);
    if (!job) {
      throw new Error(`Job ${name} not found`);
    }

    const jobId = this.#generateJobId();
    const runningJob = {
      id: jobId,
      name,
      data,
      status: 'running',
      startTime: Date.now()
    };

    this.running.set(jobId, runningJob);
    this.emit('jobStart', runningJob);

    try {
      const result = await this.#executeJob(job, data);
      
      runningJob.status = 'completed';
      runningJob.endTime = Date.now();
      runningJob.duration = runningJob.endTime - runningJob.startTime;
      runningJob.result = result;

      this.emit('jobComplete', runningJob);
      return result;
    } catch (error) {
      runningJob.status = 'failed';
      runningJob.endTime = Date.now();
      runningJob.duration = runningJob.endTime - runningJob.startTime;
      runningJob.error = error;

      this.emit('jobError', runningJob);
      throw error;
    } finally {
      this.running.delete(jobId);
    }
  }

  /**
   * Görevi iptal et
   */
  cancelJob(jobId) {
    // Kuyruktaki görevi bul
    const queueIndex = this.queue.findIndex(job => job.id === jobId);
    if (queueIndex !== -1) {
      const job = this.queue[queueIndex];
      this.queue.splice(queueIndex, 1);
      job.status = 'cancelled';
      this.emit('jobCancelled', job);
      return true;
    }

    // Çalışan görevi bul
    const runningJob = this.running.get(jobId);
    if (runningJob) {
      runningJob.status = 'cancelled';
      this.running.delete(jobId);
      this.emit('jobCancelled', runningJob);
      return true;
    }

    return false;
  }

  /**
   * Görev durumunu al
   */
  getJobStatus(jobId) {
    // Kuyruktaki görevi kontrol et
    const queuedJob = this.queue.find(job => job.id === jobId);
    if (queuedJob) {
      return {
        ...queuedJob,
        position: this.queue.indexOf(queuedJob) + 1
      };
    }

    // Çalışan görevi kontrol et
    const runningJob = this.running.get(jobId);
    if (runningJob) {
      return runningJob;
    }

    return null;
  }

  /**
   * Zamanlayıcıyı başlat
   */
  start() {
    if (!this.timer) {
      this.timer = setInterval(() => this.#tick(), 1000);
      logger.info('Scheduler started');
    }
  }

  /**
   * Zamanlayıcıyı durdur
   */
  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      logger.info('Scheduler stopped');
    }
  }

  /**
   * Zamanlayıcı tiki
   */
  async #tick() {
    const now = Date.now();

    // Çalıştırılması gereken görevleri bul
    const jobsToRun = this.queue.filter(job => 
      job.status === 'scheduled' && 
      job.nextRun <= now &&
      this.running.size < this.options.maxConcurrent
    );

    // Görevleri çalıştır
    for (const job of jobsToRun) {
      try {
        await this.runJob(job.name, job.data);
        
        // Sonraki çalışma zamanını hesapla
        job.nextRun = this.#calculateNextRun(job.schedule);
        
        // Görevi tekrar kuyruğa ekle
        this.queue.push(job);
      } catch (error) {
        logger.error(`Job ${job.name} execution failed:`, error);
      }
    }

    // Kuyruğu sırala
    this.#sortQueue();
  }

  /**
   * Görevi çalıştır
   */
  async #executeJob(job, data) {
    let lastError;
    for (let attempt = 1; attempt <= job.options.retryCount; attempt++) {
      try {
        const result = await Promise.race([
          job.handler(data),
          this.#timeout(job.options.timeout)
        ]);
        return result;
      } catch (error) {
        lastError = error;
        logger.warn(`Job ${job.name} attempt ${attempt} failed:`, error);

        if (attempt < job.options.retryCount) {
          await this.#sleep(job.options.retryDelay * attempt);
        }
      }
    }

    throw lastError;
  }

  /**
   * Kuyruğu sırala
   */
  #sortQueue() {
    this.queue.sort((a, b) => a.nextRun - b.nextRun);
  }

  /**
   * Sonraki çalışma zamanını hesapla
   */
  #calculateNextRun(schedule) {
    // Basit bir implementasyon
    // Gerçek uygulamada cron ifadesi parser'ı kullanılmalı
    const interval = parseInt(schedule, 10);
    return Date.now() + interval;
  }

  /**
   * Timeout promise'i oluştur
   */
  #timeout(ms) {
    return new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Job timeout')), ms)
    );
  }

  /**
   * Belirli bir süre bekle
   */
  #sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Benzersiz görev ID'si oluştur
   */
  #generateJobId() {
    return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Zamanlayıcı örneği oluştur
 */
export const scheduler = new Scheduler();

/**
 * Görev planla
 */
export const scheduleJob = (name, schedule, data) => {
  return scheduler.scheduleJob(name, schedule, data);
};

/**
 * Görevi iptal et
 */
export const cancelJob = (jobId) => {
  return scheduler.cancelJob(jobId);
};

/**
 * Görevi hemen çalıştır
 */
export const runJob = (name, data) => {
  return scheduler.runJob(name, data);
};

/**
 * Görev durumunu al
 */
export const getJobStatus = (jobId) => {
  return scheduler.getJobStatus(jobId);
};

export default scheduler;
