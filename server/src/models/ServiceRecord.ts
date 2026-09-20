import { Schema, model } from 'mongoose';

const serviceRecordSchema = new Schema(
  {
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true, index: true },
    booking: { type: Schema.Types.ObjectId, ref: 'Booking', default: null },
    jobCard: { type: Schema.Types.ObjectId, ref: 'JobCard', default: null },
    invoice: { type: Schema.Types.ObjectId, ref: 'Invoice', default: null },
    services: [{ type: Schema.Types.ObjectId, ref: 'Service' }],
    serviceName: { type: String, default: '' },
    date: { type: Date, default: Date.now },
    mileage: { type: Number, default: 0 },
    parts: [{ name: String, partNumber: String, qty: Number, price: Number, amount: Number }],
    laborCharges: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    invoiceNumber: { type: String, default: '' },
    technician: { type: String, default: '' },
    notes: { type: String, default: '' },
  },
  { timestamps: true },
);

serviceRecordSchema.index({ customer: 1, date: -1 });

export const ServiceRecord = model<any>('ServiceRecord', serviceRecordSchema);