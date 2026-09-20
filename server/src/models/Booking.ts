import { Schema, model } from 'mongoose';
import { BOOKING_STATUSES, PICKUP_STATUSES } from '../constants';

const pickupSchema = new Schema(
  {
    enabled: { type: Boolean, default: false },
    mode: { type: String, enum: ['Pickup and Drop', 'Workshop Visit'], default: 'Workshop Visit' },
    address: { type: String, default: '' },
    date: { type: Date, default: null },
    time: { type: String, default: '' },
    driver: { type: String, default: '' },
    status: { type: String, enum: PICKUP_STATUSES, default: 'Requested' },
    fee: { type: Number, default: 0 },
  },
  { _id: false },
);

const bookingSchema = new Schema(
  {
    bookingId: { type: String, required: true, unique: true },
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    services: [{ type: Schema.Types.ObjectId, ref: 'Service' }],
    serviceName: { type: String, default: '' },
    scheduledDate: { type: Date, required: true },
    timeSlot: { type: String, default: '' },
    pickup: { type: pickupSchema, default: () => ({}) },
    issueDescription: { type: String, default: '' },
    photos: [{ type: String }],
    status: { type: String, enum: BOOKING_STATUSES, default: 'Requested' },
    statusHistory: [{ status: String, at: Date, _id: false }],
    serviceAdvisor: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    source: { type: String, default: 'Website' },
    notes: { type: String, default: '' },
  },
  { timestamps: true },
);

bookingSchema.index({ bookingId: 1 });
bookingSchema.index({ customer: 1, status: 1 });
bookingSchema.index({ scheduledDate: 1 });

export const Booking = model<any>('Booking', bookingSchema);