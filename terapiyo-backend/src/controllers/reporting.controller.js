import { validationResult } from 'express-validator';
import reportingService from '../services/reporting.service.js';
import { ApiError } from '../utils/api-error.js';
import { catchAsync } from '../utils/catch-async.js';

class ReportingController {
  /**
   * Platform genel bakış raporu
   */
  getPlatformOverview = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Doğrulama hatası', errors.array());
    }

    const period = {
      start: new Date(req.query.startDate),
      end: new Date(req.query.endDate)
    };

    const report = await reportingService.generatePlatformOverview(period);

    res.json({
      status: 'success',
      data: report
    });
  });

  /**
   * Terapist performans raporu
   */
  getTherapistReport = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Doğrulama hatası', errors.array());
    }

    const period = {
      start: new Date(req.query.startDate),
      end: new Date(req.query.endDate)
    };

    const report = await reportingService.generateTherapistReport(
      req.params.therapistId,
      period
    );

    res.json({
      status: 'success',
      data: report
    });
  });

  /**
   * Finansal rapor
   */
  getFinancialReport = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Doğrulama hatası', errors.array());
    }

    const period = {
      start: new Date(req.query.startDate),
      end: new Date(req.query.endDate)
    };

    const report = await reportingService.generateFinancialReport(period);

    res.json({
      status: 'success',
      data: report
    });
  });

  /**
   * Özel rapor
   */
  generateCustomReport = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Doğrulama hatası', errors.array());
    }

    const config = {
      period: {
        start: new Date(req.body.startDate),
        end: new Date(req.body.endDate)
      },
      metrics: req.body.metrics,
      charts: req.body.charts
    };

    const report = await reportingService.generateCustomReport(config);

    res.json({
      status: 'success',
      data: report
    });
  });

  /**
   * Dashboard güncelleme
   */
  updateDashboard = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Doğrulama hatası', errors.array());
    }

    const dashboard = await reportingService.updateDashboard(
      req.user.id,
      req.body
    );

    res.json({
      status: 'success',
      data: dashboard
    });
  });

  /**
   * Dashboard getirme
   */
  getDashboard = catchAsync(async (req, res) => {
    const dashboard = await reportingService.getDashboard(req.user.id);

    if (!dashboard) {
      throw new ApiError(404, 'Dashboard bulunamadı');
    }

    // Dashboard verilerini yenile
    await dashboard.refresh();

    res.json({
      status: 'success',
      data: dashboard
    });
  });

  /**
   * Rapor indirme
   */
  downloadReport = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Doğrulama hatası', errors.array());
    }

    const { reportId, format } = req.query;
    const report = await reportingService.getReportForDownload(reportId, format);

    // Format'a göre dosya tipini ayarla
    const contentType = format === 'pdf' ? 'application/pdf' : 'text/csv';
    const filename = `report-${reportId}.${format}`;

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(report);
  });
}

export default new ReportingController();
