import bcrypt from 'bcryptjs';
import { User, Settings } from '../models';
import { env } from './env';
import { SETTINGS_DEFAULT } from '../constants';

/**
 * First-run bootstrap for production deployments.
 *
 * - Ensures the default business Settings document exists.
 * - Creates the initial administrator account from environment variables
 *   (ADMIN_EMAIL / ADMIN_PASSWORD). This replaces the old hard-coded demo
 *   seed so no sample users, fake bookings or default "Demo@1234" passwords
 *   are ever shipped.
 *
 * Once an admin user exists it is never recreated or modified, and every
 * additional user has to be created through the app itself.
 */
export async function bootstrap(): Promise<void> {
  const settings = await Settings.findOne({ key: 'default' });
  if (!settings) {
    await Settings.create({ ...SETTINGS_DEFAULT, key: 'default' });
    console.log('[bootstrap] default settings created');
  }

  const adminExists = await User.exists({ role: { $in: ['super_admin', 'admin'] } });
  if (adminExists) return;

  if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) {
    console.warn(
      '[bootstrap] no admin user exists and ADMIN_EMAIL/ADMIN_PASSWORD are not set. ' +
        'Create one via the admin bootstrap env vars or the "npm run seed -- --admin" script.',
    );
    return;
  }
  if (env.ADMIN_PASSWORD.length < 8) {
    throw new Error('[bootstrap] ADMIN_PASSWORD must be at least 8 characters long.');
  }

  const hash = await bcrypt.hash(env.ADMIN_PASSWORD, 10);
  await User.create({
    name: env.ADMIN_NAME,
    email: env.ADMIN_EMAIL,
    phone: env.ADMIN_PHONE || '+91 80000 00000',
    password: hash,
    role: 'admin',
    address: '',
    isEmailVerified: true,
    emailVerifiedAt: new Date(),
    status: 'active',
  });
  console.log(`[bootstrap] administrator created: ${env.ADMIN_EMAIL}`);
}

export async function createOrResetAdmin(): Promise<string> {
  if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in the environment.');
  }
  if (env.ADMIN_PASSWORD.length < 8) {
    throw new Error('ADMIN_PASSWORD must be at least 8 characters long.');
  }
  const hash = await bcrypt.hash(env.ADMIN_PASSWORD, 10);
  await User.updateOne(
    { email: env.ADMIN_EMAIL },
    {
      $set: {
        name: env.ADMIN_NAME,
        phone: env.ADMIN_PHONE || '+91 80000 00000',
        password: hash,
        role: 'admin',
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
        status: 'active',
      },
      $setOnInsert: { address: '' },
    },
    { upsert: true },
  );
  return env.ADMIN_EMAIL;
}