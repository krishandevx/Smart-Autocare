import { Schema, model } from 'mongoose';

const settingsSchema = new Schema(
  {
    key: { type: String, default: 'default', unique: true },
    companyName: { type: String, default: 'Smart AutoCare' },
    tagline: { type: String, default: 'Smart Service. Smarter Vehicle Care.' },
    email: { type: String, default: 'support@smartautocare.com' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    gstin: { type: String, default: '' },
    invoicePrefix: { type: String, default: 'SAC-INV' },
    bookingPrefix: { type: String, default: 'SAC-BK' },
    jobCardPrefix: { type: String, default: 'SAC-JC' },
    estimatePrefix: { type: String, default: 'SAC-EST' },
    taxRate: { type: Number, default: 18 },
    currency: { type: String, default: '₹' },
    businessHours: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '19:00' },
      days: { type: [Number], default: [1, 2, 3, 4, 5, 6] },
      slotDuration: { type: Number, default: 60 },
    },
    holidays: { type: [Date], default: [] },
    notificationSettings: { email: { type: Boolean, default: true }, sms: { type: Boolean, default: false }, inApp: { type: Boolean, default: true } },
    pickupFee: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const Settings = model<any>('Settings', settingsSchema);