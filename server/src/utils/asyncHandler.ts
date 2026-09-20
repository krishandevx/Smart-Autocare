import { Request, Response, NextFunction } from 'express';

type Handler = (req: Request, res: Response, next?: NextFunction) => Promise<unknown>;

export const asyncHandler =
  (fn: Handler) =>
  (req: Request, res: Response, next?: NextFunction) => {
    Promise.resolve(fn(req as any, res as any, next)).catch(next as any);
  };