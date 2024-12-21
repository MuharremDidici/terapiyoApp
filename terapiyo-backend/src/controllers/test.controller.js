import { validationResult } from 'express-validator';
import testService from '../services/test.service.js';
import { ApiError } from '../utils/api-error.js';
import { catchAsync } from '../utils/catch-async.js';

class TestController {
  /**
   * Test Suite endpoint'leri
   */
  createTestSuite = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Doğrulama hatası', errors.array());
    }

    const suite = await testService.createTestSuite({
      ...req.body,
      createdBy: req.user._id
    });

    res.status(201).json({
      status: 'success',
      data: suite
    });
  });

  getTestSuite = catchAsync(async (req, res) => {
    const suite = await testService.getTestSuite(req.params.suiteId);

    res.json({
      status: 'success',
      data: suite
    });
  });

  updateTestSuite = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Doğrulama hatası', errors.array());
    }

    const suite = await testService.updateTestSuite(
      req.params.suiteId,
      req.body
    );

    res.json({
      status: 'success',
      data: suite
    });
  });

  /**
   * Test Case endpoint'leri
   */
  createTestCase = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Doğrulama hatası', errors.array());
    }

    const testCase = await testService.createTestCase(req.body);

    res.status(201).json({
      status: 'success',
      data: testCase
    });
  });

  getTestCases = catchAsync(async (req, res) => {
    const cases = await testService.getTestCases(req.query);

    res.json({
      status: 'success',
      data: cases
    });
  });

  updateTestCase = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Doğrulama hatası', errors.array());
    }

    const testCase = await testService.updateTestCase(
      req.params.caseId,
      req.body
    );

    res.json({
      status: 'success',
      data: testCase
    });
  });

  /**
   * Test Run endpoint'leri
   */
  startTestRun = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Doğrulama hatası', errors.array());
    }

    const run = await testService.startTestRun(
      req.params.suiteId,
      req.body.environment,
      req.user
    );

    res.status(201).json({
      status: 'success',
      data: run
    });
  });

  getTestRun = catchAsync(async (req, res) => {
    const run = await testService.getTestRun(req.params.runId);

    res.json({
      status: 'success',
      data: run
    });
  });

  updateTestRunStatus = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Doğrulama hatası', errors.array());
    }

    const run = await testService.updateTestRunStatus(
      req.params.runId,
      req.body.status,
      req.body.result
    );

    res.json({
      status: 'success',
      data: run
    });
  });

  /**
   * Test Metric endpoint'leri
   */
  getTestMetrics = catchAsync(async (req, res) => {
    const metrics = await testService.getTestMetrics(
      req.query.suiteId,
      req.query.type,
      req.query.period
    );

    res.json({
      status: 'success',
      data: metrics
    });
  });

  /**
   * Test Report endpoint'leri
   */
  generateTestReport = catchAsync(async (req, res) => {
    const report = await testService.generateTestReport(req.params.runId);

    // Format'a göre yanıt döndür
    if (req.query.format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=test-report-${req.params.runId}.pdf`);
    } else {
      res.setHeader('Content-Type', 'application/json');
    }

    res.send(report);
  });

  /**
   * Test Dashboard endpoint'i
   */
  getTestDashboard = catchAsync(async (req, res) => {
    // Son 24 saatteki test durumunu getir
    const period = 24 * 60 * 60 * 1000; // 24 saat

    const [
      recentRuns,
      metrics,
      activeSuites
    ] = await Promise.all([
      testService.getRecentTestRuns(period),
      testService.getTestMetrics(null, null, period),
      testService.getActiveSuites()
    ]);

    const dashboard = {
      summary: {
        totalRuns: recentRuns.length,
        passRate: calculatePassRate(recentRuns),
        averageDuration: calculateAverageDuration(recentRuns),
        activeSuites: activeSuites.length
      },
      recentRuns,
      metrics,
      activeSuites
    };

    res.json({
      status: 'success',
      data: dashboard
    });
  });
}

// Yardımcı fonksiyonlar
function calculatePassRate(runs) {
  if (runs.length === 0) return 0;
  
  const totalPassed = runs.reduce((sum, run) => 
    sum + (run.summary.passed || 0), 0);
  
  const totalTests = runs.reduce((sum, run) => 
    sum + (run.summary.total || 0), 0);
  
  return totalTests > 0 ? (totalPassed / totalTests) * 100 : 0;
}

function calculateAverageDuration(runs) {
  if (runs.length === 0) return 0;
  
  const totalDuration = runs.reduce((sum, run) => 
    sum + (run.summary.duration || 0), 0);
  
  return totalDuration / runs.length;
}

export default new TestController();
