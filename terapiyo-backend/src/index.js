import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';
import morgan from 'morgan';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import { errorHandler } from './middleware/error.middleware.js';
import dotenv from 'dotenv';
import { connectMongoDB } from './config/database.js';
import { initializeSocket } from './utils/socket.js';
import { createServer } from 'http';

// Load environment variables
dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const httpServer = createServer(app);

// Initialize Socket.IO
import('./utils/socket.js').then(({ initializeSocket }) => {
  initializeSocket(httpServer);
});

// Middleware
app.use(cors());
app.use(helmet({
  crossOriginResourcePolicy: false
}));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Morgan logger ayarları
app.use(morgan('dev'));

// Statik dosyaları servis et
const publicDir = path.join(process.cwd(), 'public');
console.log('Public directory:', publicDir);
app.use(express.static(publicDir));

// API Documentation
import specs from './config/swagger.js';
import swaggerUi from 'swagger-ui-express';
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Terapiyo API',
    version: '1.0.0'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Not found'
  });
});

// Error handling
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
const start = async () => {
  try {
    await connectMongoDB();
    httpServer.listen(PORT, () => {
      console.info(`Server running on port ${PORT}`);
      console.info(`API Documentation: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();
