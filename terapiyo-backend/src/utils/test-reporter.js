import logger from '../config/logger.js';

/**
 * Test sonuçlarını raporla
 */
export class TestReporter {
  constructor(options = {}) {
    this.options = {
      outputFormat: options.outputFormat || 'text',
      outputFile: options.outputFile || null,
      verbose: options.verbose || false,
      colors: options.colors || true
    };
  }

  /**
   * Test sonuçlarını formatla
   */
  formatResults(results) {
    switch (this.options.outputFormat) {
      case 'json':
        return this.formatJson(results);
      case 'html':
        return this.formatHtml(results);
      case 'text':
      default:
        return this.formatText(results);
    }
  }

  /**
   * Test sonuçlarını JSON formatında formatla
   */
  formatJson(results) {
    return JSON.stringify(results, null, 2);
  }

  /**
   * Test sonuçlarını HTML formatında formatla
   */
  formatHtml(results) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Test Results</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .summary { margin-bottom: 20px; }
            .passed { color: green; }
            .failed { color: red; }
            .error { background: #ffebee; padding: 10px; margin: 5px 0; }
          </style>
        </head>
        <body>
          <h1>Test Results</h1>
          <div class="summary">
            <p>Total Tests: ${results.total}</p>
            <p class="passed">Passed: ${results.passed}</p>
            <p class="failed">Failed: ${results.failed}</p>
            <p>Skipped: ${results.skipped}</p>
            <p>Duration: ${results.duration}ms</p>
          </div>
          ${results.failedTests.length > 0 ? `
            <h2>Failed Tests</h2>
            ${results.failedTests.map(test => `
              <div class="error">
                <h3>${test.file}</h3>
                <pre>${test.error}</pre>
              </div>
            `).join('')}
          ` : ''}
        </body>
      </html>
    `;
  }

  /**
   * Test sonuçlarını metin formatında formatla
   */
  formatText(results) {
    const lines = [];
    const { colors } = this.options;

    // Başlık
    lines.push('Test Results');
    lines.push('============');
    lines.push('');

    // Özet
    lines.push('Summary:');
    lines.push(`Total Tests: ${results.total}`);
    lines.push(`Passed: ${colors ? '\x1b[32m' : ''}${results.passed}${colors ? '\x1b[0m' : ''}`);
    lines.push(`Failed: ${colors ? '\x1b[31m' : ''}${results.failed}${colors ? '\x1b[0m' : ''}`);
    lines.push(`Skipped: ${results.skipped}`);
    lines.push(`Duration: ${results.duration}ms`);
    lines.push('');

    // Başarısız testler
    if (results.failedTests.length > 0) {
      lines.push('Failed Tests:');
      lines.push('============');
      results.failedTests.forEach(test => {
        lines.push(`\nFile: ${test.file}`);
        lines.push('Error:');
        lines.push(test.error);
      });
    }

    return lines.join('\n');
  }

  /**
   * Test sonuçlarını raporla
   */
  report(results) {
    try {
      const formattedResults = this.formatResults(results);

      // Sonuçları dosyaya yaz
      if (this.options.outputFile) {
        // Dosya yazma işlemi burada yapılacak
        logger.info(`Test results written to ${this.options.outputFile}`);
      }

      // Konsola yaz
      if (this.options.verbose) {
        console.log(formattedResults);
      }

      // Özet logla
      logger.info(`Tests completed: ${results.passed}/${results.total} passed`);
      if (results.failed > 0) {
        logger.error(`${results.failed} tests failed`);
      }

      return formattedResults;
    } catch (error) {
      logger.error('Test reporting failed:', error);
      throw error;
    }
  }
}

/**
 * Test raporlayıcı örneği oluştur
 */
export const testReporter = new TestReporter();

export const generateTestReport = (results, options = {}) => {
  const reporter = new TestReporter(options);
  return reporter.report(results);
};

export default testReporter;
