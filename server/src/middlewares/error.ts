import { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import { ApiError } from '../utils/ApiError';
import { env } from '../config/env';

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
};

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ success: false, message: err.message, details: err.details });
  }

  if (err?.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid ID format' });
  }
  if (err?.name === 'ValidationError') {
    return res.status(400).json({ success: false, message: err.message });
  }
  if (err?.name === 'MongoServerError' && err?.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({ success: false, message: `Duplicate value for ${field}` });
  }
  if (err?.statusCode === 413) {
    return res.status(413).json({ success: false, message: 'Upload too large' });
  }
if (err instanceof multer.MulterError) {
    return res.status(400).json({ success: false, message: err.message });
  }

  console.error('[error]', err);
  const message = env.NODE_ENV === 'production' ? 'Internal server error' : err?.message || 'Internal server error';
  res.status(500).json({ success: false, message });
}