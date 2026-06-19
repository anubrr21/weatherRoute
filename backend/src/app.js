// backend/src/app.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import errorHandler from './middleware/errorHandler.js';
import AppError from './utils/AppError.js';

// Import routes
import authRoutes from './routes/auth.js';
import weatherRoutes from './routes/weather.js';
import userRoutes from './routes/user.js';
import historyRoutes from './routes/history.js';
import geocodeRoutes from './routes/geocode.js';
import advancedAIRoutes from './routes/advancedAI.js';
import transportRoutes from './routes/transport.js';
import alertRoutes from './routes/alerts.js';
import shareRoutes from './routes/share.js';
import preferencesRoutes from './routes/preferences.js';
import calendarRoutes from './routes/calendar.js';
import routeRoutes from './routes/routes.js';
import notificationRoutes from './routes/notifications.js';

//const __filename = fileURLToPath(import.meta.url);
//const __dirname = path.dirname(__filename);

// ========== CREATE APP FIRST ==========
const app = express();
console.log("APP LOADED");
console.log("routeRoutes =", routeRoutes);

app.set('trust proxy', 1);

// ========== MIDDLEWARE ==========

// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting (prevent DDoS attacks)
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 100000000,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('*', cors());

// ========== ROUTES ==========

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'WeatherRoute API is running' });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/user', userRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/geocode', geocodeRoutes);
app.use('/api/ai', advancedAIRoutes);
app.use('/api/transport', transportRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/share', shareRoutes);
app.use('/api/preferences', preferencesRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/notifications', notificationRoutes);

// ========== PRODUCTION - Serve Frontend ==========
//if (process.env.NODE_ENV === 'production') {
 // const distPath = path.join(__dirname, '../../frontend/dist');
 // console.log('📁 Serving static files from:', distPath);
  
 // app.use(express.static(distPath));
  
 // app.get('*', (req, res) => {
 //   res.sendFile(path.join(distPath, 'index.html'));
 // });
//}

// Handle undefined routes (404)
app.all('*', (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server!`, 404));
});

// Global error handling middleware
app.use(errorHandler);

export default app;