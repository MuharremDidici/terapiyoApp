import { Metric, Event, Report, Dashboard } from '../models/analytics.model.js';
import User from '../models/user.model.js';
import Appointment from '../models/appointment.model.js';
import Payment from '../models/payment.model.js';
import { redis } from '../config/database.js';
import logger from '../config/logger.js';

class AnalyticsService {
  /**
   * Track metric
   */
  async trackMetric(name, value, unit = null, metadata = {}) {
    try {
      const metric = await Metric.create({
        name,
        value,
        unit,
        metadata
      });

      // Update cache for real-time dashboards
      const cacheKey = `metric:${name}:latest`;
      await redis.set(cacheKey, JSON.stringify({
        value,
        timestamp: new Date()
      }), 'EX', 300); // 5 minutes

      return metric;
    } catch (error) {
      logger.error('Metric tracking failed:', error);
      throw error;
    }
  }

  /**
   * Track event
   */
  async trackEvent(type, userId, action, target, targetId = null, value = null, metadata = {}) {
    try {
      return await Event.create({
        type,
        user: userId,
        action,
        target,
        targetId,
        value,
        metadata
      });
    } catch (error) {
      logger.error('Event tracking failed:', error);
      throw error;
    }
  }

  /**
   * Generate report
   */
  async generateReport(type, period, filters = {}) {
    try {
      const report = new Report({
        type,
        period,
        metadata: {
          generatedBy: 'system',
          filters,
          version: '1.0'
        }
      });

      switch (type) {
        case 'platform_overview':
          await this.#generatePlatformOverview(report, period);
          break;
        case 'user_activity':
          await this.#generateUserActivity(report, period);
          break;
        case 'therapist_performance':
          await this.#generateTherapistPerformance(report, period, filters.therapistId);
          break;
        case 'financial':
          await this.#generateFinancialReport(report, period);
          break;
        case 'satisfaction':
          await this.#generateSatisfactionReport(report, period);
          break;
        default:
          throw new Error('Invalid report type');
      }

      await report.save();
      return report;
    } catch (error) {
      logger.error('Report generation failed:', error);
      throw error;
    }
  }

  /**
   * Create dashboard
   */
  async createDashboard(userId, data) {
    try {
      return await Dashboard.create({
        ...data,
        user: userId
      });
    } catch (error) {
      logger.error('Dashboard creation failed:', error);
      throw error;
    }
  }

  /**
   * Get dashboard
   */
  async getDashboard(dashboardId, userId) {
    try {
      const dashboard = await Dashboard.findOne({
        _id: dashboardId,
        $or: [
          { user: userId },
          { isPublic: true }
        ]
      });

      if (!dashboard) {
        throw new Error('Dashboard not found');
      }

      // Refresh dashboard data
      await this.#refreshDashboard(dashboard);

      return dashboard;
    } catch (error) {
      logger.error('Dashboard retrieval failed:', error);
      throw error;
    }
  }

  /**
   * Update dashboard
   */
  async updateDashboard(dashboardId, userId, data) {
    try {
      const dashboard = await Dashboard.findOne({
        _id: dashboardId,
        user: userId
      });

      if (!dashboard) {
        throw new Error('Dashboard not found');
      }

      Object.assign(dashboard, data);
      await dashboard.save();

      return dashboard;
    } catch (error) {
      logger.error('Dashboard update failed:', error);
      throw error;
    }
  }

  /**
   * Delete dashboard
   */
  async deleteDashboard(dashboardId, userId) {
    try {
      const result = await Dashboard.deleteOne({
        _id: dashboardId,
        user: userId,
        type: 'custom' // System dashboards cannot be deleted
      });

      return result.deletedCount > 0;
    } catch (error) {
      logger.error('Dashboard deletion failed:', error);
      throw error;
    }
  }

  /**
   * Get analytics data
   */
  async getAnalyticsData(metric, period, filters = {}) {
    try {
      const cacheKey = `analytics:${metric}:${period.start}:${period.end}:${JSON.stringify(filters)}`;
      let data = await redis.get(cacheKey);

      if (!data) {
        data = await this.#calculateAnalyticsData(metric, period, filters);
        await redis.set(cacheKey, JSON.stringify(data), 'EX', 3600); // 1 hour
      } else {
        data = JSON.parse(data);
      }

      return data;
    } catch (error) {
      logger.error('Analytics data retrieval failed:', error);
      throw error;
    }
  }

  /**
   * Private: Generate platform overview
   */
  async #generatePlatformOverview(report, period) {
    const [
      userMetrics,
      appointmentMetrics,
      financialMetrics,
      satisfactionMetrics
    ] = await Promise.all([
      this.#calculateUserMetrics(period),
      this.#calculateAppointmentMetrics(period),
      this.#calculateFinancialMetrics(period),
      this.#calculateSatisfactionMetrics(period)
    ]);

    // Add metrics
    report.metrics.push(...userMetrics, ...appointmentMetrics, ...financialMetrics, ...satisfactionMetrics);

    // Add charts
    report.charts.push(
      {
        type: 'line',
        title: 'User Growth',
        data: await this.#getUserGrowthData(period)
      },
      {
        type: 'bar',
        title: 'Appointment Distribution',
        data: await this.#getAppointmentDistribution(period)
      },
      {
        type: 'pie',
        title: 'Revenue Sources',
        data: await this.#getRevenueSources(period)
      }
    );

    // Add insights
    const insights = await this.#generateInsights(report.metrics);
    report.insights.push(...insights);
  }

  /**
   * Private: Generate user activity
   */
  async #generateUserActivity(report, period) {
    // User activity raporu oluşturma mantığı
  }

  /**
   * Private: Generate therapist performance
   */
  async #generateTherapistPerformance(report, period, therapistId) {
    // Terapist performans raporu oluşturma mantığı
  }

  /**
   * Private: Generate financial report
   */
  async #generateFinancialReport(report, period) {
    // Finansal rapor oluşturma mantığı
  }

  /**
   * Private: Generate satisfaction report
   */
  async #generateSatisfactionReport(report, period) {
    // Memnuniyet raporu oluşturma mantığı
  }

  /**
   * Private: Calculate user metrics
   */
  async #calculateUserMetrics(period) {
    const metrics = [];
    const { start, end } = period;

    // Total users
    const totalUsers = await User.countDocuments({
      createdAt: { $lte: end }
    });

    // New users in period
    const newUsers = await User.countDocuments({
      createdAt: { $gte: start, $lte: end }
    });

    // Active users in period
    const activeUsers = await Event.distinct('user', {
      timestamp: { $gte: start, $lte: end }
    }).count();

    metrics.push(
      {
        name: 'total_users',
        value: totalUsers,
        unit: 'users'
      },
      {
        name: 'new_users',
        value: newUsers,
        unit: 'users'
      },
      {
        name: 'active_users',
        value: activeUsers,
        unit: 'users'
      }
    );

    return metrics;
  }

  /**
   * Private: Calculate appointment metrics
   */
  async #calculateAppointmentMetrics(period) {
    const metrics = [];
    const { start, end } = period;

    // Total appointments
    const totalAppointments = await Appointment.countDocuments({
      createdAt: { $lte: end }
    });

    // Completed appointments
    const completedAppointments = await Appointment.countDocuments({
      status: 'completed',
      completedAt: { $gte: start, $lte: end }
    });

    // Cancellation rate
    const cancelledAppointments = await Appointment.countDocuments({
      status: 'cancelled',
      updatedAt: { $gte: start, $lte: end }
    });

    const totalInPeriod = await Appointment.countDocuments({
      createdAt: { $gte: start, $lte: end }
    });

    const cancellationRate = totalInPeriod > 0 ? (cancelledAppointments / totalInPeriod) * 100 : 0;

    metrics.push(
      {
        name: 'total_appointments',
        value: totalAppointments,
        unit: 'appointments'
      },
      {
        name: 'completed_appointments',
        value: completedAppointments,
        unit: 'appointments'
      },
      {
        name: 'cancellation_rate',
        value: cancellationRate,
        unit: 'percentage'
      }
    );

    return metrics;
  }

  /**
   * Private: Calculate financial metrics
   */
  async #calculateFinancialMetrics(period) {
    const metrics = [];
    const { start, end } = period;

    // Total revenue
    const revenue = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Average transaction value
    const avgTransaction = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: null,
          avg: { $avg: '$amount' }
        }
      }
    ]);

    metrics.push(
      {
        name: 'total_revenue',
        value: revenue[0]?.total || 0,
        unit: 'TRY'
      },
      {
        name: 'avg_transaction',
        value: avgTransaction[0]?.avg || 0,
        unit: 'TRY'
      }
    );

    return metrics;
  }

  /**
   * Private: Calculate satisfaction metrics
   */
  async #calculateSatisfactionMetrics(period) {
    const metrics = [];
    const { start, end } = period;

    // Average rating
    const ratings = await Event.aggregate([
      {
        $match: {
          type: 'review',
          timestamp: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: null,
          avg: { $avg: '$value' }
        }
      }
    ]);

    // NPS score
    const npsEvents = await Event.find({
      type: 'nps',
      timestamp: { $gte: start, $lte: end }
    });

    const npsScore = this.#calculateNPS(npsEvents);

    metrics.push(
      {
        name: 'avg_rating',
        value: ratings[0]?.avg || 0,
        unit: 'stars'
      },
      {
        name: 'nps_score',
        value: npsScore,
        unit: 'points'
      }
    );

    return metrics;
  }

  /**
   * Private: Calculate NPS
   */
  #calculateNPS(events) {
    if (events.length === 0) return 0;

    const promoters = events.filter(e => e.value >= 9).length;
    const detractors = events.filter(e => e.value <= 6).length;

    return Math.round(((promoters - detractors) / events.length) * 100);
  }

  /**
   * Private: Generate insights
   */
  async #generateInsights(metrics) {
    const insights = [];

    // Example insights generation logic
    const userGrowth = metrics.find(m => m.name === 'new_users')?.value || 0;
    if (userGrowth > 100) {
      insights.push({
        type: 'highlight',
        title: 'Strong User Growth',
        description: `Added ${userGrowth} new users in this period`,
        importance: 'high'
      });
    }

    const cancellationRate = metrics.find(m => m.name === 'cancellation_rate')?.value || 0;
    if (cancellationRate > 20) {
      insights.push({
        type: 'anomaly',
        title: 'High Cancellation Rate',
        description: 'Cancellation rate is above normal threshold',
        importance: 'high'
      });
    }

    return insights;
  }

  /**
   * Private: Refresh dashboard
   */
  async #refreshDashboard(dashboard) {
    const now = new Date();
    const needsRefresh = !dashboard.lastRefreshed ||
      (now - dashboard.lastRefreshed) > (dashboard.refreshInterval || 300000); // 5 minutes default

    if (needsRefresh) {
      // Refresh each widget's data
      for (const widget of dashboard.layout) {
        widget.data = await this.#getWidgetData(widget, dashboard.filters);
      }

      dashboard.lastRefreshed = now;
      await dashboard.save();
    }
  }

  /**
   * Private: Get widget data
   */
  async #getWidgetData(widget, filters) {
    const period = filters.dateRange || {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      end: new Date()
    };

    return await this.getAnalyticsData(widget.dataSource, period, filters.custom);
  }

  /**
   * Private: Calculate analytics data
   */
  async #calculateAnalyticsData(metric, period, filters) {
    // Analitik veri hesaplama mantığı
  }

  /**
   * Private: Get user growth data
   */
  async #getUserGrowthData(period) {
    // Kullanıcı büyüme verisi alma mantığı
  }

  /**
   * Private: Get appointment distribution
   */
  async #getAppointmentDistribution(period) {
    // Randevu dağılımı verisi alma mantığı
  }

  /**
   * Private: Get revenue sources
   */
  async #getRevenueSources(period) {
    // Gelir kaynakları verisi alma mantığı
  }
}

export default new AnalyticsService();
