import {
  TestSuite,
  TestCase,
  TestRun,
  TestMetric
} from '../models/test.model.js';
import { ApiError } from '../utils/api-error.js';
import logger from '../config/logger.js';
import { redis } from '../config/database.js';
import { runAutomatedTests } from '../utils/test-runner.js';
import { generateTestReport } from '../utils/test-reporter.js';

class TestService {
  /**
   * Test Suite işlemleri
   */
  async createTestSuite(data) {
    try {
      const suite = new TestSuite(data);
      await suite.save();

      return suite;
    } catch (error) {
      logger.error('Test suite oluşturma hatası:', error);
      throw error;
    }
  }

  async getTestSuite(suiteId) {
    try {
      const suite = await TestSuite.findById(suiteId)
        .populate('createdBy', 'name email');

      if (!suite) {
        throw new ApiError(404, 'Test suite bulunamadı');
      }

      return suite;
    } catch (error) {
      logger.error('Test suite getirme hatası:', error);
      throw error;
    }
  }

  async updateTestSuite(suiteId, updates) {
    try {
      const suite = await TestSuite.findByIdAndUpdate(
        suiteId,
        updates,
        { new: true }
      );

      if (!suite) {
        throw new ApiError(404, 'Test suite bulunamadı');
      }

      return suite;
    } catch (error) {
      logger.error('Test suite güncelleme hatası:', error);
      throw error;
    }
  }

  /**
   * Test Case işlemleri
   */
  async createTestCase(data) {
    try {
      const testCase = new TestCase(data);
      await testCase.save();

      return testCase;
    } catch (error) {
      logger.error('Test case oluşturma hatası:', error);
      throw error;
    }
  }

  async getTestCases(filters) {
    try {
      const query = {};

      if (filters.suite) query.suite = filters.suite;
      if (filters.status) query.status = filters.status;
      if (filters.priority) query.priority = filters.priority;
      if (filters.automated !== undefined) query.automated = filters.automated;
      if (filters.tags) query.tags = { $all: filters.tags };

      return TestCase.find(query)
        .populate('suite', 'name type')
        .sort({ priority: -1, createdAt: -1 });
    } catch (error) {
      logger.error('Test case getirme hatası:', error);
      throw error;
    }
  }

  async updateTestCase(caseId, updates) {
    try {
      const testCase = await TestCase.findByIdAndUpdate(
        caseId,
        updates,
        { new: true }
      );

      if (!testCase) {
        throw new ApiError(404, 'Test case bulunamadı');
      }

      return testCase;
    } catch (error) {
      logger.error('Test case güncelleme hatası:', error);
      throw error;
    }
  }

  /**
   * Test Run işlemleri
   */
  async startTestRun(suiteId, environment, user) {
    try {
      // Test suite'i kontrol et
      const suite = await TestSuite.findById(suiteId);
      if (!suite) {
        throw new ApiError(404, 'Test suite bulunamadı');
      }

      // Test cases'leri getir
      const cases = await TestCase.find({
        suite: suiteId,
        status: 'active'
      });

      // Test run oluştur
      const testRun = new TestRun({
        suite: suiteId,
        environment,
        status: 'queued',
        triggeredBy: user._id,
        startTime: new Date()
      });

      await testRun.save();

      // Otomatik testleri başlat
      if (suite.type !== 'manual') {
        this.runAutomatedTests(testRun._id, cases);
      }

      return testRun;
    } catch (error) {
      logger.error('Test run başlatma hatası:', error);
      throw error;
    }
  }

  async getTestRun(runId) {
    try {
      const run = await TestRun.findById(runId)
        .populate('suite', 'name type')
        .populate('triggeredBy', 'name email')
        .populate('results.case', 'name');

      if (!run) {
        throw new ApiError(404, 'Test run bulunamadı');
      }

      return run;
    } catch (error) {
      logger.error('Test run getirme hatası:', error);
      throw error;
    }
  }

  async updateTestRunStatus(runId, status, result) {
    try {
      const run = await TestRun.findById(runId);
      if (!run) {
        throw new ApiError(404, 'Test run bulunamadı');
      }

      run.status = status;
      
      if (result) {
        await run.addResult(result);
      }

      if (status === 'completed' || status === 'failed') {
        run.endTime = new Date();
        await this.updateTestMetrics(run);
      }

      await run.save();
      return run;
    } catch (error) {
      logger.error('Test run durumu güncelleme hatası:', error);
      throw error;
    }
  }

  /**
   * Test Metric işlemleri
   */
  async updateTestMetrics(testRun) {
    try {
      const metrics = [
        {
          suite: testRun.suite,
          type: 'reliability',
          value: (testRun.summary.passed / testRun.summary.total) * 100,
          metadata: {
            total: testRun.summary.total,
            passed: testRun.summary.passed,
            failed: testRun.summary.failed
          }
        },
        {
          suite: testRun.suite,
          type: 'performance',
          value: testRun.summary.duration,
          metadata: {
            averageTestDuration: testRun.summary.duration / testRun.summary.total
          }
        }
      ];

      // Test kapsamını hesapla
      const coverage = await TestMetric.calculateCoverage(testRun.suite);
      if (coverage) {
        metrics.push({
          suite: testRun.suite,
          type: 'coverage',
          value: coverage.percentage,
          metadata: coverage.details
        });
      }

      await TestMetric.insertMany(metrics);
    } catch (error) {
      logger.error('Test metrikleri güncelleme hatası:', error);
      throw error;
    }
  }

  async getTestMetrics(suiteId, type, period) {
    try {
      const query = {};

      if (suiteId) query.suite = suiteId;
      if (type) query.type = type;
      if (period) {
        query.timestamp = {
          $gte: new Date(Date.now() - period)
        };
      }

      return TestMetric.find(query)
        .sort({ timestamp: -1 })
        .limit(100);
    } catch (error) {
      logger.error('Test metrikleri getirme hatası:', error);
      throw error;
    }
  }

  /**
   * Test Raporu işlemleri
   */
  async generateTestReport(runId) {
    try {
      const run = await this.getTestRun(runId);
      if (!run) {
        throw new ApiError(404, 'Test run bulunamadı');
      }

      const metrics = await this.getTestMetrics(run.suite);
      return generateTestReport(run, metrics);
    } catch (error) {
      logger.error('Test raporu oluşturma hatası:', error);
      throw error;
    }
  }

  /**
   * Yardımcı metodlar
   */
  async runAutomatedTests(runId, cases) {
    try {
      // Test koşucuyu başlat
      runAutomatedTests(runId, cases)
        .then(results => {
          // Test sonuçlarını güncelle
          this.updateTestRunStatus(runId, 'completed', results);
        })
        .catch(error => {
          logger.error('Otomatik test hatası:', error);
          this.updateTestRunStatus(runId, 'failed', {
            error: {
              message: error.message,
              stack: error.stack
            }
          });
        });
    } catch (error) {
      logger.error('Otomatik test başlatma hatası:', error);
      throw error;
    }
  }
}

export default new TestService();
