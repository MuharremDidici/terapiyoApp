import { spawn } from 'child_process';
import path from 'path';
import logger from '../config/logger.js';

/**
 * Test çalıştırıcı
 */
export class TestRunner {
  constructor(options = {}) {
    this.options = {
      testDir: options.testDir || 'tests',
      testPattern: options.testPattern || '**/*.test.js',
      timeout: options.timeout || 5000,
      reporter: options.reporter || 'spec',
      bail: options.bail || false,
      parallel: options.parallel || false
    };
  }

  /**
   * Belirli bir test dosyasını çalıştır
   */
  async runTest(testFile) {
    return new Promise((resolve, reject) => {
      const testProcess = spawn('node', [
        '--test',
        path.resolve(testFile)
      ], {
        stdio: 'pipe'
      });

      let output = '';
      let error = '';

      testProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      testProcess.stderr.on('data', (data) => {
        error += data.toString();
      });

      testProcess.on('close', (code) => {
        if (code === 0) {
          resolve({
            file: testFile,
            success: true,
            output
          });
        } else {
          resolve({
            file: testFile,
            success: false,
            error: error || output
          });
        }
      });

      testProcess.on('error', (err) => {
        reject(err);
      });
    });
  }

  /**
   * Tüm testleri çalıştır
   */
  async runAllTests(pattern = this.options.testPattern) {
    try {
      const testFiles = await this.findTestFiles(pattern);
      logger.info(`Running ${testFiles.length} test files...`);

      const results = await Promise.all(
        testFiles.map(file => this.runTest(file))
      );

      const summary = this.generateSummary(results);
      return summary;
    } catch (error) {
      logger.error('Test execution failed:', error);
      throw error;
    }
  }

  /**
   * Test dosyalarını bul
   */
  async findTestFiles(pattern) {
    // Bu örnekte sabit bir liste döndürüyoruz
    // Gerçek uygulamada glob veya başka bir dosya arama yöntemi kullanılmalı
    return [
      'tests/unit/auth.test.js',
      'tests/unit/user.test.js',
      'tests/integration/api.test.js'
    ];
  }

  /**
   * Test sonuçlarının özetini oluştur
   */
  generateSummary(results) {
    const summary = {
      total: results.length,
      passed: 0,
      failed: 0,
      skipped: 0,
      duration: 0,
      failedTests: []
    };

    results.forEach(result => {
      if (result.success) {
        summary.passed++;
      } else {
        summary.failed++;
        summary.failedTests.push({
          file: result.file,
          error: result.error
        });
      }
    });

    return summary;
  }
}

/**
 * Test çalıştırıcı örneği oluştur
 */
export const testRunner = new TestRunner();

/**
 * Otomatik testleri çalıştır
 */
export const runAutomatedTests = async (options = {}) => {
  const runner = new TestRunner(options);
  return await runner.runAllTests();
};

export default testRunner;
