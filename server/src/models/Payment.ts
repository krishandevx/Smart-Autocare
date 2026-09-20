import { Schema, model } from 'mongoose';
import { PAYMENT_METHODS, PAYMENT_STATUSES } from '../constants';

const paymentSchema = new Schema(
  {
    invoice: { type: Schema.Types.ObjectId, ref: 'Invoice', required: true, index: true },
    booking: { type: Schema.Types.ObjectId, ref: 'Booking', default: null },
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true, min: 1 },
    method: { type: String, enum: PAYMENT_METHODS, required: true },
    reference: { type: String, default: '' },
    status: { type: String, enum: PAYMENT_STATUSES, default: 'Completed' },
    date: { type: Date, default: Date.now },
    recordedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    notes: { type: String, default: '' },
  },
  { timestamps: true },
);

export const Payment = model<any>('Payment', paymentSchema);