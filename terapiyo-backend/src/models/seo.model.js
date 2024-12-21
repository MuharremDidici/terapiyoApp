import mongoose from 'mongoose';

const metaTagSchema = new mongoose.Schema({
  name: String,
  content: String,
  property: String,
  type: {
    type: String,
    enum: ['name', 'property', 'http-equiv']
  }
});

const structuredDataSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  }
});

const seoSettingSchema = new mongoose.Schema({
  route: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  keywords: [String],
  metaTags: [metaTagSchema],
  canonicalUrl: String,
  structuredData: [structuredDataSchema],
  robots: {
    type: String,
    enum: [
      'index,follow',
      'noindex,follow',
      'index,nofollow',
      'noindex,nofollow'
    ],
    default: 'index,follow'
  },
  priority: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.5
  },
  changefreq: {
    type: String,
    enum: [
      'always',
      'hourly',
      'daily',
      'weekly',
      'monthly',
      'yearly',
      'never'
    ],
    default: 'weekly'
  },
  lastmod: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const performanceMetricSchema = new mongoose.Schema({
  route: {
    type: String,
    required: true,
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  metrics: {
    ttfb: Number, // Time to First Byte
    fcp: Number, // First Contentful Paint
    lcp: Number, // Largest Contentful Paint
    fid: Number, // First Input Delay
    cls: Number, // Cumulative Layout Shift
    ttl: Number, // Time to Load
    size: {
      html: Number,
      css: Number,
      js: Number,
      images: Number,
      other: Number,
      total: Number
    },
    requests: {
      count: Number,
      types: {
        html: Number,
        css: Number,
        js: Number,
        images: Number,
        other: Number
      }
    }
  },
  userAgent: String,
  device: {
    type: String,
    enum: ['mobile', 'tablet', 'desktop']
  },
  connection: {
    type: String,
    enum: ['4g', '3g', '2g', 'slow-2g', 'offline']
  },
  location: String
});

const cacheConfigSchema = new mongoose.Schema({
  route: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  headers: [{
    name: String,
    value: String
  }],
  ttl: {
    type: Number,
    default: 3600 // 1 hour in seconds
  },
  strategy: {
    type: String,
    enum: ['network-first', 'cache-first', 'stale-while-revalidate'],
    default: 'network-first'
  },
  conditions: {
    methods: [{
      type: String,
      enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']
    }],
    query: Boolean,
    auth: Boolean
  }
}, {
  timestamps: true
});

const compressionConfigSchema = new mongoose.Schema({
  route: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  enabled: {
    type: Boolean,
    default: true
  },
  level: {
    type: Number,
    min: 1,
    max: 9,
    default: 6
  },
  threshold: {
    type: Number,
    default: 1024 // bytes
  },
  mimeTypes: [{
    type: String
  }]
}, {
  timestamps: true
});

const imageOptimizationSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  optimizedVersions: [{
    width: Number,
    height: Number,
    format: {
      type: String,
      enum: ['jpeg', 'png', 'webp', 'avif']
    },
    quality: {
      type: Number,
      min: 1,
      max: 100
    },
    url: String,
    size: Number
  }],
  metadata: {
    originalSize: Number,
    dimensions: {
      width: Number,
      height: Number
    },
    format: String,
    hasAlpha: Boolean
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Indexes
seoSettingSchema.index({ route: 1, priority: -1 });
performanceMetricSchema.index({ route: 1, timestamp: -1 });
performanceMetricSchema.index({ 'metrics.ttfb': 1 });
performanceMetricSchema.index({ 'metrics.lcp': 1 });
cacheConfigSchema.index({ route: 1, 'conditions.methods': 1 });
imageOptimizationSchema.index({ status: 1 });

// Models
const SeoSetting = mongoose.model('SeoSetting', seoSettingSchema);
const SeoPerformanceMetric = mongoose.model('SeoPerformanceMetric', performanceMetricSchema);
const CacheConfig = mongoose.model('CacheConfig', cacheConfigSchema);
const CompressionConfig = mongoose.model('CompressionConfig', compressionConfigSchema);
const ImageOptimization = mongoose.model('ImageOptimization', imageOptimizationSchema);

export {
  SeoSetting,
  SeoPerformanceMetric,
  CacheConfig,
  CompressionConfig,
  ImageOptimization
};
