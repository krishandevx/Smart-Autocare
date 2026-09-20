import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/ApiError';

export const authorize =
  (...roles: string[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) return next(new ApiError(401, 'Not authenticated'));
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'You do not have permission to perform this action'));
    }
    next();
  };

export const STAFF = ['super_admin', 'admin', 'workshop_manager', 'service_advisor', 'mechanic', 'inventory_manager', 'accountant'];

export const MANAGER = ['super_admin', 'admin', 'workshop_manager'];