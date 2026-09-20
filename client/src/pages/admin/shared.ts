import type { User, Vehicle, Service } from '../../types';

export function unuser(c: string | User | undefined | null): User | undefined {
  if (!c) return undefined;
  return typeof c === 'string' ? { _id: c, name: c } as User : (c as User);
}

export function unvehicle(v: string | Vehicle | undefined | null): Vehicle | undefined {
  if (!v) return undefined;
  return typeof v === 'string' ? ({ _id: v } as Vehicle) : (v as Vehicle);
}

export function serviceName(s: string | Service | undefined | null): string {
  if (!s) return '—';
  return typeof s === 'string' ? s : s.name;
}

export function isStaffRole(role: string): boolean {
  return !['customer', 'super_admin', 'admin', 'workshop_manager', 'service_advisor', 'mechanic', 'inventory_manager', 'accountant'].includes(role)
    ? false
    : role !== 'customer';
}

export function can(role: string | undefined, allowed: string[]): boolean {
  return !!role && (allowed.includes(role) || role === 'super_admin' || role === 'admin');
}