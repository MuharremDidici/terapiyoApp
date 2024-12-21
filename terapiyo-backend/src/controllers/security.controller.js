import { validationResult } from 'express-validator';
import securityService from '../services/security.service.js';
import { ApiError } from '../utils/api-error.js';
import { catchAsync } from '../utils/catch-async.js';

class SecurityController {
  /**
   * Denetim günlüğü endpoint'leri
   */
  getAuditLogs = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Doğrulama hatası', errors.array());
    }

    const logs = await securityService.getAuditLogs(req.query);

    res.json({
      status: 'success',
      data: logs
    });
  });

  /**
   * Güvenlik uyarısı endpoint'leri
   */
  getAlerts = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Doğrulama hatası', errors.array());
    }

    const alerts = await securityService.getAlerts(req.query);

    res.json({
      status: 'success',
      data: alerts
    });
  });

  updateAlertStatus = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Doğrulama hatası', errors.array());
    }

    const alert = await securityService.updateAlertStatus(
      req.params.alertId,
      req.body.status,
      req.body.resolution
    );

    res.json({
      status: 'success',
      data: alert
    });
  });

  /**
   * Güvenlik politikası endpoint'leri
   */
  getPolicy = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Doğrulama hatası', errors.array());
    }

    const policy = await securityService.getPolicy(req.params.name);

    res.json({
      status: 'success',
      data: policy
    });
  });

  updatePolicy = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Doğrulama hatası', errors.array());
    }

    const policy = await securityService.updatePolicy(
      req.params.name,
      req.body
    );

    res.json({
      status: 'success',
      data: policy
    });
  });

  /**
   * Güvenlik yapılandırması endpoint'leri
   */
  getConfig = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Doğrulama hatası', errors.array());
    }

    const config = await securityService.getConfig(req.params.key);

    res.json({
      status: 'success',
      data: config
    });
  });

  updateConfig = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Doğrulama hatası', errors.array());
    }

    const config = await securityService.updateConfig(
      req.params.key,
      req.body.value,
      req.body.description
    );

    res.json({
      status: 'success',
      data: config
    });
  });

  /**
   * Güvenlik durumu endpoint'i
   */
  getSecurityStatus = catchAsync(async (req, res) => {
    // Son 24 saatteki güvenlik durumunu getir
    const period = {
      startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
      endDate: new Date()
    };

    const [alerts, logs] = await Promise.all([
      securityService.getAlerts({ ...period, limit: 10 }),
      securityService.getAuditLogs({ ...period, limit: 10 })
    ]);

    const status = {
      activeAlerts: {
        critical: alerts.filter(a => a.severity === 'critical' && a.status === 'open').length,
        high: alerts.filter(a => a.severity === 'high' && a.status === 'open').length,
        medium: alerts.filter(a => a.severity === 'medium' && a.status === 'open').length,
        low: alerts.filter(a => a.severity === 'low' && a.status === 'open').length
      },
      recentActivity: {
        success: logs.filter(l => l.status === 'success').length,
        failure: logs.filter(l => l.status === 'failure').length
      },
      latestAlerts: alerts,
      recentLogs: logs
    };

    res.json({
      status: 'success',
      data: status
    });
  });
}

export default new SecurityController();
