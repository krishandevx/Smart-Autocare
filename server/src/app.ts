import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { apiLimiter } from './middlewares/rateLimit';
import { notFoundHandler, errorHandler } from './middlewares/error';
import { UPLOAD_DIR } from './middlewares/upload';
import apiRoutes from './routes';

const app = express();

app.set('trust proxy', 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
  cors({
    origin: [env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:4173'],
    credentials: true,
  }),
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/uploads', express.static(UPLOAD_DIR));

app.use((req, res, next) => {
  if (req.method !== 'GET') {
    console.log(`[req] ${req.method} ${req.originalUrl}${req.user ? ` (user:${req.user?._id})` : ''}`);
  }
  next();
});

app.get('/', (_req, res) => res.json({ success: true, message: 'Smart AutoCare API', docs: '/api/health' }));
app.use('/api', apiLimiter, apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler as (err: any, req: Request, res: Response, next: NextFunction) => void);

export default app;