import { test } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import type { Server } from 'node:http';
import app from '../app';
import { createOrResetAdmin } from '../config/bootstrap';
import {
  User, Vehicle, Service, Booking, JobCard, Invoice, Payment, Part,
  Supplier, PurchaseOrder, Employee, Inspection, Estimate, ServiceRecord,
  Reminder, Review, Notification, Appointment, Settings,
} from '../models';

const MONGO_URI =
  process.env.TEST_MONGO_URI || 'mongodb://127.0.0.1:27017/sac_api_test';

const ALL_MODELS = [
  User, Vehicle, Service, Booking, JobCard, Invoice, Payment, Part,
  Supplier, PurchaseOrder, Employee, Inspection, Estimate, ServiceRecord,
  Reminder, Review, Notification, Appointment, Settings,
];

async function request(
  base: string,
  path: string,
  opts: { method?: string; body?: unknown; cookie?: string } = {},
): Promise<{ status: number; json: any; cookie?: string }> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (opts.cookie) headers['Cookie'] = opts.cookie;
  const res = await fetch(base + path, {
    method: opts.method || 'GET',
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });
  const setCookie = res.headers.get('set-cookie') || '';
  const cookie = setCookie ? setCookie.split(';')[0] : undefined;
  let json: any = {};
  try {
    json = await res.json();
  } catch {
    json = {};
  }
  return { status: res.status, json, cookie };
}

test('API smoke suite', async () => {
  await mongoose.connect(MONGO_URI);
  for (const m of ALL_MODELS) await m.deleteMany({});
  await mongoose.connection.dropCollection('counters').catch(() => {});

  const adminEmail = await createOrResetAdmin();
  const server: Server = app.listen(0);
  await new Promise<void>((r) => server.once('listening', () => r()));
  const addr = server.address();
  const base = `http://localhost:${typeof addr === 'object' && addr ? addr.port : 3000}`;

  try {
    // Health
    let r = await request(base, '/api/health');
    assert.equal(r.status, 200);
    assert.equal(r.json.success, true);
    console.log('  ok: /api/health');

    // Admin login
    r = await request(base, '/api/auth/login', {
      method: 'POST',
      body: { email: adminEmail, password: process.env.ADMIN_PASSWORD || undefined },
    });
    assert.equal(r.status, 200);
    assert.equal(r.json.data.role, 'admin');
    const adminCookie = r.cookie;
    console.log('  ok: admin login (' + adminEmail + ')');

    // Customer registration -> role locked to customer
    r = await request(base, '/api/auth/register', {
      method: 'POST',
      body: { name: 'Test Customer', email: 'test.customer@example.com', phone: '+91 90000 90000', password: 'TestPass@123', confirmPassword: 'TestPass@123' },
    });
    assert.equal(r.status, 201);
    assert.equal(r.json.data.role, 'customer');
    console.log('  ok: register -> customer role');

    // Login as the new customer (register does not issue a session)
    r = await request(base, '/api/auth/login', {
      method: 'POST',
      body: { email: 'test.customer@example.com', password: 'TestPass@123' },
    });
    assert.equal(r.status, 200);
    const custCookie = r.cookie;
    assert.ok(custCookie, 'customer should receive a session cookie');
    console.log('  ok: customer login');

    // Registration cannot pick an admin role
    r = await request(base, '/api/auth/register', {
      method: 'POST',
      body: { name: 'Role Elevation', email: 'elevate@example.com', phone: '+91 90000 90001', password: 'TestPass@123', confirmPassword: 'TestPass@123', role: 'admin' },
    });
    assert.equal(r.status, 201);
    assert.equal(r.json.data.role, 'customer', 'public register must force customer role');
    console.log('  ok: role elevation blocked');

    // /me
    r = await request(base, '/api/auth/me', { cookie: custCookie });
    assert.equal(r.status, 200);
    assert.equal(r.json.data.email, 'test.customer@example.com');
    console.log('  ok: /api/auth/me');

    // A customer must NOT reach staff/admin endpoints
    r = await request(base, '/api/admin/services', { cookie: custCookie });
    assert.ok(r.status === 401 || r.status === 403, 'customer must be blocked from admin routes (got ' + r.status + ')');
    console.log('  ok: customer blocked from staff routes (' + r.status + ')');

    // Admin creates a service
    r = await request(base, '/api/admin/services', {
      method: 'POST',
      cookie: adminCookie,
      body: { name: 'Smoke Service', category: 'General Service', description: 'test', basePrice: 999, estimatedHours: 1, vehicleTypes: ['Four Wheeler'] },
    });
    assert.equal(r.status, 201);
    const serviceId = r.json.data._id;
    console.log('  ok: create service');

    // Customer adds a vehicle
    r = await request(base, '/api/vehicles', {
      method: 'POST',
      cookie: custCookie,
      body: { regNumber: 'KA-01-TE-0001', type: 'Four Wheeler', category: 'Hatchback', brand: 'Maruti Suzuki', model: 'Test', year: 2022, fuelType: 'Petrol', mileage: 1000 },
    });
    assert.equal(r.status, 201);
    const vehicleId = r.json.data._id;
    console.log('  ok: create vehicle');

    // Customer books
    const future = new Date(Date.now() + 3 * 86400000).toISOString();
    r = await request(base, '/api/bookings', {
      method: 'POST',
      cookie: custCookie,
      body: { vehicle: vehicleId, services: [serviceId], scheduledDate: future, timeSlot: '10:00 AM - 11:00 AM', issueDescription: 'smoke test booking' },
    });
    assert.equal(r.status, 201);
    assert.match(r.json.data.bookingId, /SAC-BK/);
    console.log('  ok: create booking (' + r.json.data.bookingId + ')');

    // Admin lists bookings
    r = await request(base, '/api/bookings', { cookie: adminCookie });
    assert.equal(r.status, 200);
    assert.ok(r.json.data.data.length >= 1, 'admin should see bookings');
    console.log('  ok: admin lists bookings (' + r.json.data.data.length + ')');

    // Unauthenticated access is blocked
    r = await request(base, '/api/bookings');
    assert.equal(r.status, 401);
    console.log('  ok: unauthenticated access blocked');

    console.log('API smoke suite passed.');
  } finally {
    server.close();
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
});