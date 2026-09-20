import mongoose from 'mongoose';
import { env } from '../config/env';
import { createOrResetAdmin } from '../config/bootstrap';
import {
  User, Vehicle, Service, Booking, Appointment, JobCard, Inspection, Estimate,
  ServiceRecord, Part, InventoryTransaction, Supplier, PurchaseOrder, Employee,
  Invoice, Payment, Notification, Review, Reminder, Settings,
} from '../models';
import { SETTINGS_DEFAULT } from '../constants';

const ALL_MODELS = [
  User, Vehicle, Service, Booking, Appointment, JobCard, Inspection, Estimate,
  ServiceRecord, Part, InventoryTransaction, Supplier, PurchaseOrder, Employee,
  Invoice, Payment, Notification, Review, Reminder, Settings,
];

/**
 * Database "factory reset" utility.
 *
 * WARNING: deletes every document from every collection.
 *
 * This is the ONLY seed entry point. It intentionally does NOT create any
 * sample customers, bookings, invoices or demo passwords. After the reset it
 * recreates the default business settings and the initial administrator from
 * the environment (ADMIN_EMAIL / ADMIN_PASSWORD).
 *
 *   npm run seed
 */
async function main(): Promise<void> {
  await mongoose.connect(env.MONGO_URI);
  console.log('[seed] connected.');

  for (const m of ALL_MODELS) await m.deleteMany({});
  await mongoose.connection.dropCollection('counters').catch(() => {});

  const settings = await Settings.findOne({ key: 'default' });
  if (!settings) await Settings.create({ ...SETTINGS_DEFAULT, key: 'default' });
  console.log('[seed] default settings ready');

  const email = await createOrResetAdmin();
  console.log(`[seed] administrator ready: ${email}`);
  console.log('[seed] done. Point your browser at the API/docs or start the client.');
  console.log('[seed] no demo data was created — add clients and records through the app.');
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('[seed] failed', err);
  process.exit(1);
});