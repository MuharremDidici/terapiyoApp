import dotenv from 'dotenv';

dotenv.config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/terapiyo',
  jwt: {
    accessTokenSecret: process.env.JWT_SECRET || 'your-secret-key',
    accessTokenExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshTokenSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-token-secret',
    refreshTokenExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://89.213.56.250:6379',
    password: process.env.REDIS_PASSWORD
  },
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    allowedOrigins: [process.env.FRONTEND_URL || 'http://localhost:5173']
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100
  },
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    auth: {
      user: process.env.SMTP_USER || 'your_email@gmail.com',
      pass: process.env.SMTP_PASS || 'your_app_password'
    }
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || 'your_stripe_secret_key',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || 'your_stripe_webhook_secret'
  },
  logging: {
    level: process.env.LOG_LEVEL || 'debug',
    filePath: process.env.LOG_FILE_PATH || 'logs/app.log'
  },
  elasticsearch: {
    node: process.env.ELASTICSEARCH_NODE,
    username: process.env.ELASTICSEARCH_USERNAME,
    password: process.env.ELASTICSEARCH_PASSWORD
  },
  mediasoup: {
    listenIp: process.env.MEDIASOUP_LISTEN_IP || '0.0.0.0',
    announcedIp: process.env.MEDIASOUP_ANNOUNCED_IP || '127.0.0.1',
    rtcMinPort: parseInt(process.env.MEDIASOUP_RTC_MIN_PORT) || 40000,
    rtcMaxPort: parseInt(process.env.MEDIASOUP_RTC_MAX_PORT) || 49999,
    workerPool: parseInt(process.env.MEDIASOUP_WORKER_POOL) || 1,
    logLevel: process.env.MEDIASOUP_LOG_LEVEL || 'warn',
    logTags: ['info', 'ice', 'dtls', 'rtp', 'srtp', 'rtcp']
  }
};

export default config;
