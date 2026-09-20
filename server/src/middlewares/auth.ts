import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';

export async function protect(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.cookies?.sac_token || req.headers.authorization?.replace('Bearer ', '');
    if (!token) throw new ApiError(401, 'Not authenticated');
    let decoded: any;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch {
      throw new ApiError(401, 'Session expired or invalid');
    }
    req.user = { _id: decoded.id, role: decoded.role, name: decoded.name, email: decoded.email };
    next();
  } catch (err) {
    next(err);
  }
}