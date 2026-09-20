import { Schema, model } from 'mongoose';

const partSchema = new Schema(
  {
    partNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    sku: { type: String, trim: true, uppercase: true, default: '' },
    brand: { type: String, default: '' },
    category: { type: String, default: 'General' },
    compatibleVehicles: [{ type: String }],
    costPrice: { type: Number, default: 0 },
    sellingPrice: { type: Number, default: 0 },
    stock: { type: Number, default: 0, min: 0 },
    minStock: { type: Number, default: 5 },
    unit: { type: String, default: 'pcs' },
    supplier: { type: Schema.Types.ObjectId, ref: 'Supplier', default: null },
    location: { type: String, default: '' },
    warrantyMonths: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

partSchema.index({ name: 1 });
partSchema.index({ partNumber: 1 });
partSchema.index({ category: 1, stock: 1 });

export const Part = model<any>('Part', partSchema);