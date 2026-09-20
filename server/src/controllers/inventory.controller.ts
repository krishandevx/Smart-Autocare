import { Request, Response } from 'express';
import { Part, Supplier, PurchaseOrder, InventoryTransaction } from '../models';
import { nextId } from '../utils/idGenerator';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { parsePagination, paginate, sortOptions } from '../utils/pagination';
import { changeStock } from '../services/inventory';

export const listParts = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter: any = {};
  if (req.query.q) {
    const q = new RegExp(String(req.query.q), 'i');
    filter.$or = [{ name: q }, { partNumber: q }, { sku: q }, { brand: q }];
  }
  if (req.query.category) filter.category = req.query.category;
  if (req.query.supplier) filter.supplier = req.query.supplier;
  if (req.query.lowStock === 'true') filter.$expr = { $lte: ['$stock', '$minStock'] };
  const [docs, total] = await Promise.all([
    Part.find(filter).sort(sortOptions(req.query, '-createdAt')).skip(skip).limit(limit).populate('supplier', 'name'),
    Part.countDocuments(filter),
  ]);
  res.json({ success: true, data: paginate(docs, total, page, limit) });
});

export const getPart = asyncHandler(async (req: Request, res: Response) => {
  const p = await Part.findById(req.params.id).populate('supplier', 'name phone').lean();
  if (!p) throw new ApiError(404, 'Part not found');
  res.json({ success: true, data: p });
});

export const createPart = asyncHandler(async (req: Request, res: Response) => {
  const part = await Part.create({ ...req.body, partNumber: req.body.partNumber.toUpperCase() });
  if (part.stock > 0) {
    await changeStock({ partId: String(part._id), qty: part.stock, type: 'IN', reason: 'Opening stock', user: String(req.user?._id) });
  }
  res.status(201).json({ success: true, message: 'Part added to inventory', data: part });
});

export const updatePart = asyncHandler(async (req: Request, res: Response) => {
  const part = await Part.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!part) throw new ApiError(404, 'Part not found');
  res.json({ success: true, message: 'Part updated', data: part });
});

export const deletePart = asyncHandler(async (req: Request, res: Response) => {
  const part = await Part.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!part) throw new ApiError(404, 'Part not found');
  res.json({ success: true, message: 'Part deactivated' });
});

export const adjustStock = asyncHandler(async (req: Request, res: Response) => {
  const { qty, type, reason } = req.body;
  const result = await changeStock({
    partId: String(req.params.id),
    qty,
    type,
    reason: reason || 'Manual adjustment',
    user: String(req.user?._id),
  });
  res.json({ success: true, message: 'Stock updated', data: result });
});

export const partTransactions = asyncHandler(async (req: Request, res: Response) => {
  const txs = await InventoryTransaction.find({ part: req.params.id }).sort('-createdAt').limit(100);
  res.json({ success: true, data: txs });
});

export const listSuppliers = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter: any = {};
  if (req.query.q) filter.name = new RegExp(String(req.query.q), 'i');
  const [docs, total] = await Promise.all([
    Supplier.find(filter).sort('-createdAt').skip(skip).limit(limit),
    Supplier.countDocuments(filter),
  ]);
  res.json({ success: true, data: paginate(docs, total, page, limit), meta2: { page, limit, total } });
});

export const getSupplier = asyncHandler(async (req: Request, res: Response) => {
  const s = (await Supplier.findById(req.params.id).lean()) as any;
  if (!s) throw new ApiError(404, 'Supplier not found');
  const orders = await PurchaseOrder.find({ supplier: s._id }).sort('-orderDate').limit(20).lean();
  res.json({ success: true, data: { ...s, purchaseHistory: orders } });
});

export const createSupplier = asyncHandler(async (req: Request, res: Response) => {
  const s = await Supplier.create(req.body);
  res.status(201).json({ success: true, message: 'Supplier added', data: s });
});

export const updateSupplier = asyncHandler(async (req: Request, res: Response) => {
  const s = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!s) throw new ApiError(404, 'Supplier not found');
  res.json({ success: true, message: 'Supplier updated', data: s });
});

export const deleteSupplier = asyncHandler(async (req: Request, res: Response) => {
  await Supplier.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Supplier deleted' });
});

function poTotal(items: any[]): number {
  return items.reduce((s, it) => s + (it.qty * it.rate), 0);
}

export const listPurchases = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter: any = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.supplier) filter.supplier = req.query.supplier;
  const [docs, total] = await Promise.all([
    PurchaseOrder.find(filter).sort(sortOptions(req.query, '-createdAt')).skip(skip).limit(limit).populate('supplier', 'name'),
    PurchaseOrder.countDocuments(filter),
  ]);
  res.json({ success: true, data: paginate(docs, total, page, limit) });
});

export const getPurchase = asyncHandler(async (req: Request, res: Response) => {
  const po = await PurchaseOrder.findById(req.params.id).populate('supplier').lean();
  if (!po) throw new ApiError(404, 'Purchase order not found');
  res.json({ success: true, data: po });
});

export const createPurchase = asyncHandler(async (req: Request, res: Response) => {
  const po = new PurchaseOrder({
    poId: await nextId('purchase'),
    supplier: req.body.supplier,
    items: req.body.items.map((it: any) => ({ ...it, amount: it.qty * it.rate, received: 0 })),
    total: poTotal(req.body.items),
    expectedDate: req.body.expectedDate || null,
    supplierInvoice: req.body.supplierInvoice || '',
    notes: req.body.notes || '',
    status: 'Draft',
    createdBy: req.user?._id,
  });
  await po.save();
  res.status(201).json({ success: true, message: 'Purchase order created', data: po });
});

export const updatePurchase = asyncHandler(async (req: Request, res: Response) => {
  const po = await PurchaseOrder.findById(req.params.id);
  if (!po) throw new ApiError(404, 'Purchase order not found');
  if (req.body.status) po.status = req.body.status;
  if (req.body.items) {
    po.items = req.body.items.map((it: any) => ({ ...it, amount: it.qty * it.rate }));
    po.total = poTotal(req.body.items);
  }
  if (req.body.supplierInvoice !== undefined) po.supplierInvoice = req.body.supplierInvoice;
  if (req.body.notes !== undefined) po.notes = req.body.notes;
  await po.save();
  res.json({ success: true, message: 'Purchase order updated', data: po });
});

export const receivePurchase = asyncHandler(async (req: Request, res: Response) => {
  const po = await PurchaseOrder.findById(req.params.id);
  if (!po) throw new ApiError(404, 'Purchase order not found');
  if (po.status === 'Draft' || po.status === 'Cancelled') throw new ApiError(400, 'Receive is only allowed after the order is sent');

  for (const it of po.items) {
    const toReceive = it.qty - (it.received || 0);
    if (toReceive <= 0) continue;
    if (it.part) {
      await changeStock({ partId: String(it.part), qty: toReceive, type: 'PURCHASE', reason: `PO ${po.poId}`, reference: po.poId, user: String(req.user?._id) });
    } else {
      const existing = await Part.findOne({ partNumber: it.partNumber || it.name.toUpperCase().replace(/\s+/g, '-') });
      if (existing) {
        await changeStock({ partId: String(existing._id), qty: toReceive, type: 'PURCHASE', reason: `PO ${po.poId}`, reference: po.poId, user: String(req.user?._id) });
      }
    }
    it.received = (it.received || 0) + toReceive;
  }
  const allReceived = po.items.every((it) => it.received >= it.qty);
  po.status = allReceived ? 'Received' : 'Partial';
  po.receivedDate = new Date();
  await po.save();
  res.json({ success: true, message: 'Goods received', data: po });
});

export const deletePurchase = asyncHandler(async (req: Request, res: Response) => {
  const po = await PurchaseOrder.findById(req.params.id);
  if (!po) throw new ApiError(404, 'Purchase order not found');
  if (po.status !== 'Draft') throw new ApiError(400, 'Only draft orders can be deleted');
  await po.deleteOne();
  res.json({ success: true, message: 'Purchase order deleted' });
});