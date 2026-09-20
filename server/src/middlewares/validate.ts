import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';
import { ApiError } from '../utils/ApiError';

export const validate =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const first = result.error.errors[0];
      next(new ApiError(400, first?.message || 'Validation failed', result.error.flatten()));
      return;
    }
    req.body = result.data;
    next();
  };