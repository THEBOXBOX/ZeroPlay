import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Routes
import travelRoutes from './routes/travel';
import benefitRoutes from './routes/benefit';
import testRoutes from './routes/test';
import photoRouter from './routes/photo';
import aiRoutes from './routes/ai';

// Supabase 연결 테스트
import { testSupabaseConnection } from './config/supabase';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001; // 🔧 통일된 포트

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL?.split(',') || []
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes (🔧 통일된 경로)
app.use('/api/travel', travelRoutes);
app.use('/api/benefits', benefitRoutes);  // 복수형으로 통일
app.use('/api/test', testRoutes);
app.use('/api', photoRouter);
app.use('/api/ai', aiRoutes);

// Health check (강화된 버전)
app.get('/api/health', async (req, res) => {
  const dbConnected = await testSupabaseConnection();
  
  res.status(200).json({
    status: 'OK',
    message: 'Travel Recommendation Service Backend is running',
    timestamp: new Date().toISOString(),
    port: PORT,
    env: process.env.NODE_ENV || 'development',
    database: dbConnected ? 'connected' : 'disconnected',
    services: {
      supabase: dbConnected,
      googleMaps: !!process.env.GOOGLE_MAPS_API_KEY,
      kakao: !!process.env.KAKAO_REST_API_KEY
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
    availableRoutes: [
      'GET /api/health',
      'GET /api/benefits',
      'POST /api/travel/recommend',
      'GET /api/travel/local-experiences/:region',
      'GET /api/travel/destination/:id',
      'POST /api/ai/chat',
      'POST /api/ai/generate-routes', 
      'GET /api/ai/search-places'
    ]
  });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('🔴 Server Error:', err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { error: err.message, stack: err.stack })
  });
});

// 서버 시작
app.listen(PORT, async () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
  
  // DB 연결 상태 확인
  const dbStatus = await testSupabaseConnection();
  console.log(`💾 Database: ${dbStatus ? '✅ Connected' : '❌ Disconnected'}`);
});

export default app;