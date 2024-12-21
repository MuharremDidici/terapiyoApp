import {
  PerformanceMetric,
  ResourceUsage,
  ScalingEvent,
  OptimizationRule
} from '../models/performance.model.js';
import { ApiError } from '../utils/api-error.js';
import logger from '../config/logger.js';
import { redis } from '../config/database.js';
import os from 'os';
import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);

class PerformanceService {
  /**
   * Performans Metrik işlemleri
   */
  async recordMetric(data) {
    try {
      const metric = new PerformanceMetric(data);
      await metric.save();

      // Redis'te anlık metrikleri güncelle
      await this.updateLiveMetrics(data);

      // Optimizasyon kurallarını kontrol et
      await this.checkOptimizationRules();

      return metric;
    } catch (error) {
      logger.error('Performans metriği kaydetme hatası:', error);
      throw error;
    }
  }

  async getMetrics(filters) {
    try {
      const query = {};

      if (filters.type) query.type = filters.type;
      if (filters.service) query.service = filters.service;
      if (filters.endpoint) query.endpoint = filters.endpoint;
      if (filters.tags) query.tags = { $all: filters.tags };

      if (filters.startTime) {
        query.timestamp = { $gte: new Date(filters.startTime) };
      }
      if (filters.endTime) {
        query.timestamp = {
          ...query.timestamp,
          $lte: new Date(filters.endTime)
        };
      }

      return PerformanceMetric.find(query)
        .sort({ timestamp: -1 })
        .limit(filters.limit || 100);
    } catch (error) {
      logger.error('Performans metrikleri getirme hatası:', error);
      throw error;
    }
  }

  /**
   * Resource Usage işlemleri
   */
  async recordResourceUsage() {
    try {
      const usage = await this.collectSystemMetrics();
      const resourceUsage = new ResourceUsage(usage);
      
      // Durumu güncelle
      resourceUsage.updateStatus();
      await resourceUsage.save();

      // Kritik durumları kontrol et
      if (resourceUsage.status === 'critical') {
        await this.handleCriticalResource(resourceUsage);
      }

      return resourceUsage;
    } catch (error) {
      logger.error('Kaynak kullanımı kaydetme hatası:', error);
      throw error;
    }
  }

  async getResourceUsage(filters) {
    try {
      const query = {};

      if (filters.instanceId) query.instanceId = filters.instanceId;
      if (filters.type) query.type = filters.type;
      if (filters.status) query.status = filters.status;

      if (filters.startTime) {
        query.timestamp = { $gte: new Date(filters.startTime) };
      }
      if (filters.endTime) {
        query.timestamp = {
          ...query.timestamp,
          $lte: new Date(filters.endTime)
        };
      }

      return ResourceUsage.find(query)
        .sort({ timestamp: -1 })
        .limit(filters.limit || 100);
    } catch (error) {
      logger.error('Kaynak kullanımı getirme hatası:', error);
      throw error;
    }
  }

  /**
   * Scaling Event işlemleri
   */
  async createScalingEvent(data) {
    try {
      const event = new ScalingEvent(data);
      await event.save();

      // Ölçeklendirme işlemini başlat
      this.handleScaling(event);

      return event;
    } catch (error) {
      logger.error('Ölçeklendirme olayı oluşturma hatası:', error);
      throw error;
    }
  }

  async getScalingEvents(filters) {
    try {
      const query = {};

      if (filters.type) query.type = filters.type;
      if (filters.service) query.service = filters.service;
      if (filters.status) query.status = filters.status;
      if (filters.trigger) query.trigger = filters.trigger;

      return ScalingEvent.find(query)
        .sort({ createdAt: -1 })
        .limit(filters.limit || 100);
    } catch (error) {
      logger.error('Ölçeklendirme olayları getirme hatası:', error);
      throw error;
    }
  }

  /**
   * Optimization Rule işlemleri
   */
  async createOptimizationRule(data) {
    try {
      const rule = new OptimizationRule(data);
      await rule.save();

      return rule;
    } catch (error) {
      logger.error('Optimizasyon kuralı oluşturma hatası:', error);
      throw error;
    }
  }

  async updateOptimizationRule(ruleId, updates) {
    try {
      const rule = await OptimizationRule.findByIdAndUpdate(
        ruleId,
        updates,
        { new: true }
      );

      if (!rule) {
        throw new ApiError(404, 'Optimizasyon kuralı bulunamadı');
      }

      return rule;
    } catch (error) {
      logger.error('Optimizasyon kuralı güncelleme hatası:', error);
      throw error;
    }
  }

  /**
   * Performans Dashboard işlemleri
   */
  async getPerformanceDashboard(period = 24 * 60 * 60 * 1000) {
    try {
      const startTime = new Date(Date.now() - period);

      const [
        metrics,
        resourceUsage,
        scalingEvents,
        activeRules
      ] = await Promise.all([
        this.getAggregatedMetrics(startTime),
        this.getAggregatedResourceUsage(startTime),
        this.getRecentScalingEvents(),
        this.getActiveOptimizationRules()
      ]);

      return {
        metrics,
        resourceUsage,
        scalingEvents,
        activeRules,
        recommendations: await this.generateRecommendations()
      };
    } catch (error) {
      logger.error('Performans dashboard getirme hatası:', error);
      throw error;
    }
  }

  /**
   * Yardımcı metodlar
   */
  async collectSystemMetrics() {
    const metrics = {
      instanceId: process.env.INSTANCE_ID || os.hostname(),
      type: 'api',
      metrics: {
        cpu: {
          usage: 0,
          cores: os.cpus().length
        },
        memory: {
          total: os.totalmem(),
          free: os.freemem(),
          used: os.totalmem() - os.freemem()
        },
        disk: {
          total: 0,
          used: 0,
          free: 0
        },
        network: {
          bytesIn: 0,
          bytesOut: 0,
          connections: 0
        }
      }
    };

    try {
      // CPU kullanımını hesapla
      const startUsage = process.cpuUsage();
      await new Promise(resolve => setTimeout(resolve, 100));
      const endUsage = process.cpuUsage(startUsage);
      metrics.metrics.cpu.usage = 
        (endUsage.user + endUsage.system) / 1000000 * 100;

      // Disk kullanımını al
      if (process.platform === 'linux') {
        const { stdout } = await execAsync('df -k / | tail -1');
        const [, total, used, free] = stdout.split(/\s+/);
        metrics.metrics.disk = {
          total: parseInt(total) * 1024,
          used: parseInt(used) * 1024,
          free: parseInt(free) * 1024
        };
      }

      // Network istatistiklerini al
      const { stdout: netstat } = await execAsync('netstat -an | wc -l');
      metrics.metrics.network.connections = parseInt(netstat);

    } catch (error) {
      logger.warn('Sistem metrikleri toplama hatası:', error);
    }

    return metrics;
  }

  async updateLiveMetrics(metric) {
    const key = `metrics:live:${metric.type}:${metric.service}`;
    await redis.hset(key, {
      value: metric.value,
      timestamp: Date.now()
    });
    await redis.expire(key, 300); // 5 dakika
  }

  async checkOptimizationRules() {
    try {
      const rules = await OptimizationRule.find({
        status: 'active'
      }).sort({ priority: -1 });

      const metrics = await this.getLiveMetrics();

      for (const rule of rules) {
        if (rule.evaluate(metrics)) {
          await this.executeOptimizationActions(rule);
        }
      }
    } catch (error) {
      logger.error('Optimizasyon kuralları kontrol hatası:', error);
    }
  }

  async handleCriticalResource(usage) {
    try {
      // Otomatik ölçeklendirme tetikle
      if (usage.status === 'critical') {
        await this.createScalingEvent({
          type: 'auto_scale',
          service: usage.type,
          trigger: usage.metrics.cpu.usage > 90 ? 'cpu_threshold' : 'memory_threshold'
        });
      }

      // Kritik durumu bildir
      // TODO: Bildirim gönderme mantığı
    } catch (error) {
      logger.error('Kritik kaynak kullanımı işleme hatası:', error);
    }
  }

  async handleScaling(event) {
    try {
      event.status = 'in_progress';
      await event.save();

      // Ölçeklendirme mantığı
      // TODO: Kubernetes/Docker Swarm API entegrasyonu

      await event.complete(true);
    } catch (error) {
      logger.error('Ölçeklendirme işlemi hatası:', error);
      await event.complete(false, { error: error.message });
    }
  }

  async executeOptimizationActions(rule) {
    for (const action of rule.actions) {
      try {
        switch (action.type) {
          case 'scale':
            await this.createScalingEvent({
              type: 'auto_scale',
              service: rule.target.service,
              trigger: 'auto_scale',
              changes: action.parameters
            });
            break;

          case 'cache':
            // Redis önbelleğini yapılandır
            await this.configureCaching(action.parameters);
            break;

          case 'optimize':
            // Veritabanı optimizasyonları
            await this.optimizeDatabase(action.parameters);
            break;

          case 'alert':
            // Bildirim gönder
            // TODO: Bildirim gönderme mantığı
            break;

          case 'custom':
            // Özel optimizasyon mantığı
            await this.executeCustomOptimization(action.parameters);
            break;
        }
      } catch (error) {
        logger.error(`Optimizasyon eylemi hatası (${action.type}):`, error);
      }
    }
  }

  async getAggregatedMetrics(startTime) {
    return PerformanceMetric.aggregate([
      {
        $match: {
          timestamp: { $gte: startTime }
        }
      },
      {
        $group: {
          _id: {
            type: '$type',
            service: '$service'
          },
          avgValue: { $avg: '$value' },
          maxValue: { $max: '$value' },
          minValue: { $min: '$value' },
          count: { $sum: 1 }
        }
      }
    ]);
  }

  async getAggregatedResourceUsage(startTime) {
    return ResourceUsage.aggregate([
      {
        $match: {
          timestamp: { $gte: startTime }
        }
      },
      {
        $group: {
          _id: {
            instanceId: '$instanceId',
            type: '$type'
          },
          avgCpuUsage: { $avg: '$metrics.cpu.usage' },
          avgMemoryUsed: { $avg: '$metrics.memory.used' },
          status: { $last: '$status' }
        }
      }
    ]);
  }

  async generateRecommendations() {
    try {
      const metrics = await this.getMetrics({
        startTime: new Date(Date.now() - 24 * 60 * 60 * 1000)
      });

      const recommendations = [];

      // CPU kullanımı analizi
      const highCpuEndpoints = metrics
        .filter(m => m.type === 'response_time' && m.value > 1000)
        .map(m => m.endpoint);

      if (highCpuEndpoints.length > 0) {
        recommendations.push({
          type: 'performance',
          priority: 'high',
          description: 'Yüksek yanıt süreli endpoint\'ler tespit edildi',
          targets: highCpuEndpoints,
          suggestion: 'Endpoint\'leri optimize edin veya önbelleğe alın'
        });
      }

      // Bellek kullanımı analizi
      const memoryMetrics = metrics.filter(m => m.type === 'memory_usage');
      const avgMemoryUsage = memoryMetrics.reduce((sum, m) => sum + m.value, 0) / 
        (memoryMetrics.length || 1);

      if (avgMemoryUsage > 80) {
        recommendations.push({
          type: 'resource',
          priority: 'critical',
          description: 'Yüksek bellek kullanımı',
          suggestion: 'Bellek sızıntılarını kontrol edin veya ölçeklendirin'
        });
      }

      return recommendations;
    } catch (error) {
      logger.error('Öneriler oluşturma hatası:', error);
      return [];
    }
  }
}

export default new PerformanceService();
