import { Schema, model } from 'mongoose';

const invoiceItemSchema = new Schema(
  {
    type: { type: String, enum: ['Service', 'Part', 'Labour', 'Misc'], required: true },
    description: { type: String, required: true },
    qty: { type: Number, default: 1 },
    rate: { type: Number, default: 0 },
    amount: { type: Number, default: 0 },
  },
  { _id: false },
);

const invoiceSchema = new Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    booking: { type: Schema.Types.ObjectId, ref: 'Booking', default: null },
    jobCard: { type: Schema.Types.ObjectId, ref: 'JobCard', default: null },
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    items: { type: [invoiceItemSchema], default: [] },
    subtotal: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    taxRate: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },
    paidAmount: { type: Number, default: 0 },
    remaining: { type: Number, default: 0 },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Partially Paid', 'Paid', 'Overdue', 'Refunded', 'Void'],
      default: 'Pending',
    },
    paymentMethod: { type: String, default: '' },
    issuedDate: { type: Date, default: Date.now },
    dueDate: { type: Date, default: null },
    notes: { type: String, default: '' },
    pdfUrl: { type: String, default: '' },
  },
  { timestamps: true },
);

invoiceSchema.index({ invoiceNumber: 1 });
invoiceSchema.index({ customer: 1, paymentStatus: 1 });
invoiceSchema.index({ issuedDate: 1 });

export const Invoice = model<any>('Invoice', invoiceSchema);