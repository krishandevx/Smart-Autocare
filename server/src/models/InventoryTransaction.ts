import { Schema, model } from 'mongoose';

const inventoryTransactionSchema = new Schema(
  {
    part: { type: Schema.Types.ObjectId, ref: 'Part', required: true, index: true },
    type: {
      type: String,
      enum: ['IN', 'OUT', 'ADJUSTMENT', 'PURCHASE', 'RETURN', 'USED'],
      required: true,
    },
    qty: { type: Number, required: true },
    before: { type: Number, default: 0 },
    after: { type: Number, default: 0 },
    reason: { type: String, default: '' },
    reference: { type: String, default: '' },
    user: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true },
);

inventoryTransactionSchema.index({ part: 1, createdAt: -1 });

export const InventoryTransaction = model<any>('InventoryTransaction', inventoryTransactionSchema);