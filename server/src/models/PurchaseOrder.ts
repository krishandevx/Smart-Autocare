import { Schema, model } from 'mongoose';

const purchaseItemSchema = new Schema(
  {
    part: { type: Schema.Types.ObjectId, ref: 'Part', default: null },
    name: { type: String, required: true },
    partNumber: { type: String, default: '' },
    qty: { type: Number, required: true, min: 0 },
    rate: { type: Number, default: 0 },
    amount: { type: Number, default: 0 },
    received: { type: Number, default: 0 },
  },
  { _id: false },
);

const purchaseOrderSchema = new Schema(
  {
    poId: { type: String, required: true, unique: true },
    supplier: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true },
    items: { type: [purchaseItemSchema], default: [] },
    total: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['Draft', 'Sent', 'Partial', 'Received', 'Cancelled'],
      default: 'Draft',
    },
    orderDate: { type: Date, default: Date.now },
    expectedDate: { type: Date, default: null },
    receivedDate: { type: Date, default: null },
    supplierInvoice: { type: String, default: '' },
    paidAmount: { type: Number, default: 0 },
    dueAmount: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    notes: { type: String, default: '' },
  },
  { timestamps: true },
);

purchaseOrderSchema.index({ poId: 1 });
purchaseOrderSchema.index({ status: 1, supplier: 1 });

export const PurchaseOrder = model<any>('PurchaseOrder', purchaseOrderSchema);