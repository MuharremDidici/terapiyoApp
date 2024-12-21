import logger from '../../config/logger.js';

/**
 * Measure performance metrics
 */
export function measurePerformance(req, res, next) {
  const start = process.hrtime();

  // Add response hook to measure TTFB and total time
  const oldWrite = res.write;
  const oldEnd = res.end;
  const chunks = [];

  res.write = (...args) => {
    chunks.push(Buffer.from(args[0]));
    oldWrite.apply(res, args);
  };

  res.end = (...args) => {
    if (args[0]) {
      chunks.push(Buffer.from(args[0]));
    }

    const responseBody = Buffer.concat(chunks).toString('utf8');
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = seconds * 1000 + nanoseconds / 1000000;

    // Record metrics
    const metrics = {
      route: req.path,
      timestamp: new Date(),
      metrics: {
        ttfb: duration, // Time to First Byte
        ttl: duration, // Total Time to Load
        size: {
          total: Buffer.byteLength(responseBody, 'utf8')
        }
      },
      userAgent: req.get('user-agent'),
      device: detectDevice(req),
      connection: req.get('connection-type') || '4g'
    };

    // Log metrics asynchronously
    logMetrics(metrics).catch(error => {
      logger.error('Metrics logging failed:', error);
    });

    oldEnd.apply(res, args);
  };

  next();
}

/**
 * Log performance metrics
 */
async function logMetrics(metrics) {
  try {
    // Add additional metrics from client
    if (metrics.clientMetrics) {
      metrics.metrics = {
        ...metrics.metrics,
        fcp: metrics.clientMetrics.firstContentfulPaint,
        lcp: metrics.clientMetrics.largestContentfulPaint,
        fid: metrics.clientMetrics.firstInputDelay,
        cls: metrics.clientMetrics.cumulativeLayoutShift
      };
    }

    // Log metrics to database or monitoring service
    logger.info('Performance metrics:', metrics);

    return metrics;
  } catch (error) {
    logger.error('Metrics logging failed:', error);
    throw error;
  }
}

/**
 * Detect device type from user agent
 */
function detectDevice(req) {
  const userAgent = req.get('user-agent').toLowerCase();

  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(userAgent)) {
    return 'tablet';
  }
  
  if (
    /Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
      userAgent
    )
  ) {
    return 'mobile';
  }
  
  return 'desktop';
}

/**
 * Calculate Core Web Vitals score
 */
export function calculateWebVitalsScore(metrics) {
  try {
    const scores = {
      lcp: scoreLCP(metrics.lcp),
      fid: scoreFID(metrics.fid),
      cls: scoreCLS(metrics.cls)
    };

    return {
      scores,
      overall: calculateOverallScore(scores)
    };
  } catch (error) {
    logger.error('Web Vitals score calculation failed:', error);
    throw error;
  }
}

/**
 * Score LCP (Largest Contentful Paint)
 */
function scoreLCP(lcp) {
  if (lcp <= 2500) return 1; // Good
  if (lcp <= 4000) return 0.5; // Needs Improvement
  return 0; // Poor
}

/**
 * Score FID (First Input Delay)
 */
function scoreFID(fid) {
  if (fid <= 100) return 1; // Good
  if (fid <= 300) return 0.5; // Needs Improvement
  return 0; // Poor
}

/**
 * Score CLS (Cumulative Layout Shift)
 */
function scoreCLS(cls) {
  if (cls <= 0.1) return 1; // Good
  if (cls <= 0.25) return 0.5; // Needs Improvement
  return 0; // Poor
}

/**
 * Calculate overall Web Vitals score
 */
function calculateOverallScore(scores) {
  const weights = {
    lcp: 0.4,
    fid: 0.3,
    cls: 0.3
  };

  return (
    scores.lcp * weights.lcp +
    scores.fid * weights.fid +
    scores.cls * weights.cls
  );
}

/**
 * Generate performance report
 */
export function generatePerformanceReport(metrics) {
  try {
    const webVitals = calculateWebVitalsScore(metrics.metrics);
    const deviceDistribution = calculateDeviceDistribution(metrics);
    const timeDistribution = calculateTimeDistribution(metrics);

    return {
      summary: {
        score: webVitals.overall,
        grade: getPerformanceGrade(webVitals.overall),
        metrics: webVitals.scores
      },
      details: {
        devices: deviceDistribution,
        timing: timeDistribution,
        size: metrics.metrics.size
      },
      recommendations: generateRecommendations(metrics, webVitals)
    };
  } catch (error) {
    logger.error('Performance report generation failed:', error);
    throw error;
  }
}

/**
 * Calculate device distribution
 */
function calculateDeviceDistribution(metrics) {
  const devices = {
    mobile: 0,
    tablet: 0,
    desktop: 0
  };

  metrics.forEach(metric => {
    devices[metric.device]++;
  });

  const total = Object.values(devices).reduce((a, b) => a + b, 0);

  return Object.entries(devices).map(([device, count]) => ({
    device,
    percentage: (count / total) * 100
  }));
}

/**
 * Calculate time distribution
 */
function calculateTimeDistribution(metrics) {
  const times = metrics.map(m => m.metrics.ttl).sort((a, b) => a - b);
  const total = times.length;

  return {
    p50: times[Math.floor(total * 0.5)],
    p75: times[Math.floor(total * 0.75)],
    p90: times[Math.floor(total * 0.9)],
    p95: times[Math.floor(total * 0.95)],
    p99: times[Math.floor(total * 0.99)]
  };
}

/**
 * Get performance grade
 */
function getPerformanceGrade(score) {
  if (score >= 0.9) return 'A';
  if (score >= 0.8) return 'B';
  if (score >= 0.7) return 'C';
  if (score >= 0.6) return 'D';
  return 'F';
}

/**
 * Generate performance recommendations
 */
function generateRecommendations(metrics, webVitals) {
  const recommendations = [];

  // LCP recommendations
  if (webVitals.scores.lcp < 1) {
    recommendations.push({
      metric: 'LCP',
      priority: webVitals.scores.lcp === 0 ? 'high' : 'medium',
      suggestions: [
        'Optimize largest contentful paint element',
        'Implement lazy loading for images',
        'Use CDN for static assets'
      ]
    });
  }

  // FID recommendations
  if (webVitals.scores.fid < 1) {
    recommendations.push({
      metric: 'FID',
      priority: webVitals.scores.fid === 0 ? 'high' : 'medium',
      suggestions: [
        'Minimize long tasks',
        'Optimize JavaScript execution',
        'Remove unused JavaScript'
      ]
    });
  }

  // CLS recommendations
  if (webVitals.scores.cls < 1) {
    recommendations.push({
      metric: 'CLS',
      priority: webVitals.scores.cls === 0 ? 'high' : 'medium',
      suggestions: [
        'Set explicit dimensions for images',
        'Avoid inserting content above existing content',
        'Use transform animations instead of properties that trigger layout changes'
      ]
    });
  }

  return recommendations;
}
