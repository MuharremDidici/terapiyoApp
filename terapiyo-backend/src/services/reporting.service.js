import { Metric, Event, Report, Dashboard } from '../models/analytics.model.js';
import { ApiError } from '../utils/api-error.js';
import logger from '../config/logger.js';

class ReportingService {
  /**
   * Platform genel bakış raporu oluştur
   */
  async generatePlatformOverview(period) {
    try {
      const report = await Report.generatePlatformOverview(period);
      
      // Kullanıcı aktivitesi metrikleri
      const userMetrics = await this.getUserActivityMetrics(period);
      report.addMetric({
        name: 'active_users',
        value: userMetrics.activeUsers,
        unit: 'users'
      });

      // Terapi oturumu metrikleri
      const sessionMetrics = await this.getSessionMetrics(period);
      report.addMetric({
        name: 'completed_sessions',
        value: sessionMetrics.completedSessions,
        unit: 'sessions'
      });

      // Memnuniyet metrikleri
      const satisfactionMetrics = await this.getSatisfactionMetrics(period);
      report.addMetric({
        name: 'satisfaction_score',
        value: satisfactionMetrics.averageScore,
        unit: 'score'
      });

      return report;
    } catch (error) {
      logger.error('Platform genel bakış raporu oluşturma hatası:', error);
      throw error;
    }
  }

  /**
   * Terapist performans raporu oluştur
   */
  async generateTherapistReport(therapistId, period) {
    try {
      const report = await Report.generateTherapistPerformance(therapistId, period);
      
      // Oturum metrikleri
      const sessionMetrics = await this.getTherapistSessionMetrics(therapistId, period);
      report.addMetric({
        name: 'session_completion_rate',
        value: sessionMetrics.completionRate,
        unit: 'percentage'
      });

      // Memnuniyet metrikleri
      const satisfactionMetrics = await this.getTherapistSatisfactionMetrics(therapistId, period);
      report.addMetric({
        name: 'client_satisfaction',
        value: satisfactionMetrics.averageScore,
        unit: 'score'
      });

      // Gelir metrikleri
      const revenueMetrics = await this.getTherapistRevenueMetrics(therapistId, period);
      report.addMetric({
        name: 'total_revenue',
        value: revenueMetrics.totalRevenue,
        unit: 'currency'
      });

      return report;
    } catch (error) {
      logger.error('Terapist performans raporu oluşturma hatası:', error);
      throw error;
    }
  }

  /**
   * Finansal rapor oluştur
   */
  async generateFinancialReport(period) {
    try {
      const report = await Report.generateFinancialReport(period);
      
      // Gelir metrikleri
      const revenueMetrics = await this.getRevenueMetrics(period);
      report.addMetric({
        name: 'total_revenue',
        value: revenueMetrics.totalRevenue,
        unit: 'currency'
      });

      // Ödeme metrikleri
      const paymentMetrics = await this.getPaymentMetrics(period);
      report.addMetric({
        name: 'successful_payments',
        value: paymentMetrics.successfulPayments,
        unit: 'count'
      });

      // Abonelik metrikleri
      const subscriptionMetrics = await this.getSubscriptionMetrics(period);
      report.addMetric({
        name: 'active_subscriptions',
        value: subscriptionMetrics.activeSubscriptions,
        unit: 'count'
      });

      return report;
    } catch (error) {
      logger.error('Finansal rapor oluşturma hatası:', error);
      throw error;
    }
  }

  /**
   * Özel rapor oluştur
   */
  async generateCustomReport(config) {
    try {
      const report = new Report({
        type: 'custom',
        period: config.period
      });

      // Özel metrikler ekle
      for (const metricConfig of config.metrics) {
        const metricData = await this.getCustomMetric(metricConfig);
        report.addMetric(metricData);
      }

      // Özel grafikler ekle
      for (const chartConfig of config.charts) {
        const chartData = await this.generateCustomChart(chartConfig);
        report.addChart(chartData);
      }

      return report;
    } catch (error) {
      logger.error('Özel rapor oluşturma hatası:', error);
      throw error;
    }
  }

  /**
   * Dashboard oluştur veya güncelle
   */
  async updateDashboard(userId, config) {
    try {
      let dashboard = await Dashboard.findOne({ user: userId });
      
      if (!dashboard) {
        dashboard = new Dashboard({
          user: userId,
          widgets: []
        });
      }

      // Widget'ları güncelle
      dashboard.widgets = [];
      for (const widgetConfig of config.widgets) {
        const widget = await this.createDashboardWidget(widgetConfig);
        dashboard.addWidget(widget);
      }

      // Layout'u güncelle
      if (config.layout) {
        dashboard.updateLayout(config.layout);
      }

      await dashboard.save();
      return dashboard;
    } catch (error) {
      logger.error('Dashboard güncelleme hatası:', error);
      throw error;
    }
  }

  /**
   * Yardımcı metodlar
   */
  async getUserActivityMetrics(period) {
    // Kullanıcı aktivite metriklerini hesapla
    const events = await Event.find({
      type: 'user_activity',
      timestamp: { $gte: period.start, $lte: period.end }
    });

    return {
      activeUsers: new Set(events.map(e => e.user.toString())).size,
      totalEvents: events.length
    };
  }

  async getSessionMetrics(period) {
    // Oturum metriklerini hesapla
    const events = await Event.find({
      type: 'session',
      timestamp: { $gte: period.start, $lte: period.end }
    });

    return {
      completedSessions: events.filter(e => e.action === 'completed').length,
      canceledSessions: events.filter(e => e.action === 'canceled').length
    };
  }

  async getSatisfactionMetrics(period) {
    // Memnuniyet metriklerini hesapla
    const metrics = await Metric.find({
      name: 'satisfaction_score',
      timestamp: { $gte: period.start, $lte: period.end }
    });

    const scores = metrics.map(m => m.value);
    return {
      averageScore: scores.reduce((a, b) => a + b, 0) / scores.length || 0,
      totalResponses: scores.length
    };
  }

  async getRevenueMetrics(period) {
    // Gelir metriklerini hesapla
    const events = await Event.find({
      type: 'payment',
      action: 'successful',
      timestamp: { $gte: period.start, $lte: period.end }
    });

    return {
      totalRevenue: events.reduce((sum, e) => sum + (e.value || 0), 0),
      transactionCount: events.length
    };
  }

  async createDashboardWidget(config) {
    // Widget verilerini oluştur
    const data = await this.getWidgetData(config);
    
    return {
      type: config.type,
      title: config.title,
      data: data,
      refreshInterval: config.refreshInterval,
      size: config.size
    };
  }

  async getWidgetData(config) {
    // Widget tipine göre veri getir
    switch (config.type) {
      case 'metric':
        return this.getMetricWidgetData(config);
      case 'chart':
        return this.getChartWidgetData(config);
      case 'list':
        return this.getListWidgetData(config);
      default:
        throw new ApiError(400, 'Geçersiz widget tipi');
    }
  }
}

export default new ReportingService();
