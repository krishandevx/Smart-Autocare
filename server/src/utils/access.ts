import { Request } from 'express';
import { ApiError } from './ApiError';

const STAFF = ['super_admin', 'admin', 'workshop_manager', 'service_advisor', 'mechanic', 'inventory_manager', 'accountant'];

export function isStaffRole(role?: string): boolean {
  return !!role && STAFF.includes(role);
}

export function assertOwnOrStaff(req: Request, owner: string | null | undefined, label = 'resource'): void {
  if (isStaffRole(req.user?.role)) return;
  if (String(owner) !== String(req.user?._id)) {
    throw new ApiError(403, `You do not have access to this ${label}`);
  }
}