import { Schema, model } from 'mongoose';

const supplierSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    contactPerson: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    address: { type: String, default: '' },
    gstin: { type: String, default: '' },
    partsSupplied: { type: [String], default: [] },
    outstandingAmount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

supplierSchema.index({ name: 1, phone: 1 });

export const Supplier = model<any>('Supplier', supplierSchema);