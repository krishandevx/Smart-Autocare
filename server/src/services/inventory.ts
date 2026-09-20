import { Part, InventoryTransaction } from '../models';
import { ApiError } from '../utils/ApiError';

export type StockMovementType = 'IN' | 'OUT' | 'ADJUSTMENT' | 'PURCHASE' | 'RETURN' | 'USED';

export async function changeStock(opts: {
  partId: string;
  qty: number;
  type: StockMovementType;
  reason?: string;
  reference?: string;
  user?: string;
}): Promise<{ before: number; after: number }> {
  const part = await Part.findById(opts.partId);
  if (!part) throw new ApiError(404, 'Part not found');

  let delta = opts.qty;
  if (opts.type === 'OUT' || opts.type === 'USED') delta = -Math.abs(opts.qty);

  const after = part.stock + delta;
  if (after < 0) throw new ApiError(400, `Insufficient stock for ${part.name} (available: ${part.stock})`);

  part.stock = after;
  await part.save();

  await InventoryTransaction.create({
    part: part._id,
    type: opts.type,
    qty: Math.abs(opts.qty),
    before: part.stock - delta,
    after,
    reason: opts.reason || '',
    reference: opts.reference || '',
    user: opts.user || null,
  });

  return { before: part.stock - delta, after };
}