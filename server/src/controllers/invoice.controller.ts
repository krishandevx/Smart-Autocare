import { Request, Response } from 'express';
import { Invoice, Payment, JobCard, Booking, Settings } from '../models';
import { nextId } from '../utils/idGenerator';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { parsePagination, paginate, sortOptions } from '../utils/pagination';
import { assertOwnOrStaff, isStaffRole } from '../utils/access';
import { pushNotification } from '../services/notification';
import { sendEmail } from '../services/email';
import { buildInvoicePdf, money } from '../utils/pdf';

const pop = [
  { path: 'customer', select: 'name email phone address' },
  { path: 'vehicle', select: 'regNumber brand model type category' },
  { path: 'jobCard', select: 'jobCardId status' },
  { path: 'booking', select: 'bookingId status' },
];

export function computeInvoice(doc: any): void {
  const subtotal = (doc.items || []).reduce((s: number, it: any) => s + (it.amount || 0), 0);
  doc.subtotal = subtotal;
  doc.tax = Math.round((subtotal * (doc.taxRate || 0)) / 100);
  doc.grandTotal = Math.max(0, subtotal - (doc.discount || 0)) + doc.tax;
  doc.remaining = Math.max(0, doc.grandTotal - (doc.paidAmount || 0));
  doc.paymentStatus =
    doc.remaining <= 0 && doc.grandTotal > 0 ? 'Paid' : doc.paidAmount > 0 ? 'Partially Paid' : 'Pending';
}

export const listInvoices = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter: any = {};
  if (!isStaffRole(req.user?.role)) filter.customer = req.user?._id;
  if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;
  if (req.query.customer) filter.customer = req.query.customer;
  if (req.query.vehicle) filter.vehicle = req.query.vehicle;
  if (req.query.q) filter.$or = [{ invoiceNumber: new RegExp(String(req.query.q), 'i') }, { jobCardId: new RegExp(String(req.query.q), 'i') }];
  if (req.query.from || req.query.to) {
    filter.issuedDate = {};
    if (req.query.from) filter.issuedDate.$gte = new Date(req.query.from as string);
    if (req.query.to) filter.issuedDate.$lte = new Date(req.query.to as string);
  }
  const [docs, total] = await Promise.all([
    Invoice.find(filter).sort(sortOptions(req.query, '-issuedDate')).skip(skip).limit(limit).populate(pop),
    Invoice.countDocuments(filter),
  ]);
  res.json({ success: true, data: paginate(docs, total, page, limit) });
});

export const getInvoice = asyncHandler(async (req: Request, res: Response) => {
  const inv = await Invoice.findById(req.params.id).populate(pop).populate('jobCard booking');
  if (!inv) throw new ApiError(404, 'Invoice not found');
  assertOwnOrStaff(req, String(inv.customer), 'invoice');
  res.json({ success: true, data: inv });
});

export const createInvoice = asyncHandler(async (req: Request, res: Response) => {
  const isFromJobCard = !!req.body.jobCard;
  if (!isFromJobCard && (!req.body.items?.length || !req.body.vehicle)) {
    throw new ApiError(400, 'Provide line items and a vehicle, or a job card to invoice');
  }
  let items = req.body.items;
  let customer = req.body.customer;
  let vehicle = req.body.vehicle;

  if (isFromJobCard) {
    const jc = await JobCard.findById(req.body.jobCard).populate('booking');
    if (!jc) throw new ApiError(404, 'Job card not found');
    customer = jc.customer;
    vehicle = jc.vehicle;
    items = [];
    for (const p of jc.parts || []) {
      items.push({ type: 'Part', description: `${p.name}${p.qty > 1 ? ` × ${p.qty}` : ''}`, qty: p.qty, rate: p.price, amount: p.amount });
    }
    if (jc.laborCharges > 0) {
      items.push({ type: 'Labour', description: 'Labour charges', qty: 1, rate: jc.laborCharges, amount: jc.laborCharges });
    }
    if (jc.booking) {
      const b = await Booking.findById(jc.booking);
      if (b?.serviceName) items.push({ type: 'Service', description: b.serviceName, qty: 1, rate: 0, amount: 0 });
    }
    req.body.booking = jc.booking;
    if (!req.body.taxRate) req.body.taxRate = jc.taxRate || 0;
  }

  const inv = new Invoice({
    invoiceNumber: await nextId('invoice'),
    booking: req.body.booking || null,
    jobCard: req.body.jobCard || null,
    customer,
    vehicle,
    items: items.map((it: any) => ({ ...it, amount: (it.qty || 1) * it.rate })),
    discount: req.body.discount || 0,
    taxRate: req.body.taxRate ?? 0,
    issuedDate: new Date(),
    dueDate: req.body.dueDate || new Date(Date.now() + 15 * 24 * 3600 * 1000),
    notes: req.body.notes || '',
  });
  computeInvoice(inv);
  await inv.save();

  if (inv.jobCard) {
    const jc = await JobCard.findById(inv.jobCard);
    if (jc) {
      jc.status = 'Invoiced';
      jc.statusHistory = [...(jc.statusHistory || []), { status: 'Invoiced', at: new Date() }];
      await jc.save();
    }
  }

  pushNotification({
    user: String(customer),
    type: 'invoice_generated',
    title: 'Invoice Generated',
    message: `Invoice ${inv.invoiceNumber} for ${`\u20B9`}${inv.grandTotal.toLocaleString('en-IN')} is ready.`,
    link: '/account/invoices',
    data: { invoiceId: inv._id },
  });

  res.status(201).json({ success: true, message: 'Invoice created', data: inv });
});

export const recordPayment = asyncHandler(async (req: Request, res: Response) => {
  const { amount, method, reference, notes, date } = req.body;
  const inv = await Invoice.findById(req.body.invoice || req.params.id);
  if (!inv) throw new ApiError(404, 'Invoice not found');
  if (inv.paymentStatus === 'Paid') throw new ApiError(400, 'Invoice is already fully paid');
  if (amount > inv.remaining + 0.001) throw new ApiError(400, `Amount exceeds remaining balance of ${inv.remaining}`);

  const payment = await Payment.create({
    invoice: inv._id,
    booking: inv.booking,
    customer: inv.customer,
    amount,
    method,
    reference: reference || '',
    status: 'Completed',
    date: date || new Date(),
    recordedBy: req.user?._id,
    notes: notes || '',
  });

  inv.paidAmount = (inv.paidAmount || 0) + amount;
  computeInvoice(inv);
  await inv.save();

  pushNotification({
    user: String(inv.customer),
    type: 'payment_received',
    title: 'Payment Received',
    message: `Payment of ${`\u20B9`}${amount.toLocaleString('en-IN')} received for invoice ${inv.invoiceNumber}.`,
    link: '/account/invoices',
    data: { invoiceId: inv._id },
  });

  const c = await inv.populate('customer');
  sendEmail({
    to: (c.customer as any).email,
    subject: `Payment Confirmed — ${inv.invoiceNumber}`,
    template: 'paymentConfirmation',
    data: {
      subject: 'Payment received',
      name: (c.customer as any).name,
      message: `We received ${`\u20B9`}${amount.toLocaleString('en-IN')} for invoice ${inv.invoiceNumber}.`,
      cta: 'View Invoice',
      link: `${req.protocol}://${req.get('host')}/account/invoices`,
    },
  });

  res.status(201).json({ success: true, message: 'Payment recorded', data: { payment, invoice: inv } });
});

export const updateInvoiceStatus = asyncHandler(async (req: Request, res: Response) => {
  const inv = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!inv) throw new ApiError(404, 'Invoice not found');
  res.json({ success: true, message: 'Invoice updated', data: inv });
});

export const invoicePdf = asyncHandler(async (req: Request, res: Response) => {
  const inv = await Invoice.findById(req.params.id).populate('customer', 'name email phone address').populate('vehicle', 'brand model regNumber');
  if (!inv) throw new ApiError(404, 'Invoice not found');
  assertOwnOrStaff(req, String(inv.customer), 'invoice');

  const settings = (await Settings.findOne({ key: 'default' })) ?? { companyName: 'Smart AutoCare', tagline: '', address: '', gstin: '', email: '', phone: '' };
  const c = inv.customer as any;
  const v = inv.vehicle as any;
  const cur = 'Rs.';

  const lines: Object[] = [
    { text: settings.companyName || 'Smart AutoCare', font: '/F2', size: 16 },
    { text: settings.tagline || '', font: '/F1', size: 9 },
    { text: `${settings.address || ''}${settings.email ? `  |  ${settings.email}` : ''}`, size: 8 },
    { text: `GSTIN: ${settings.gstin || '—'}   |   ${settings.phone || ''}`, size: 8 },
    { margin: 0 },
    { text: 'TAX INVOICE', font: '/F2', size: 13 },
    { row: [{ text: `Invoice No: ${inv.invoiceNumber}`, font: '/F2', x: 240 }, { text: `Date: ${inv.issuedDate.toLocaleDateString('en-IN')}`, font: '/F2', x: 100 }], size: 9 },
    { row: [{ text: `Bill To: ${c?.name || ''}`, font: '/F2', x: 240 }, { text: `Vehicle: ${v?.brand || ''} ${v?.model || ''} ${v?.regNumber || ''}`, x: 110 }], size: 9 },
    { text: `${c?.phone || ''}  ${c?.email || ''}`, size: 8 },
    { margin: 0 },
    { rule: true },
    { row: [{ text: 'Description', font: '/F2', x: 240 }, { text: 'Qty', font: '/F2', x: 60 }, { text: 'Rate', font: '/F2', x: 90 }, { text: 'Amount', font: '/F2', x: 105 }], size: 9 },
    { rule: true },
    ...inv.items.map((it: any) => ({
      row: [
        { text: String(it.description).slice(0, 80), x: 240 },
        { text: String(it.qty ?? 1), x: 60 },
        { text: money(it.rate ?? 0), x: 90 },
        { text: money(it.amount ?? 0), x: 105 },
      ],
      size: 9,
    })),
    { margin: 0 },
    { rule: true },
    { row: [{ text: 'Subtotal', font: '/F2', x: 300 }, { text: money(inv.subtotal || 0), font: '/F2', x: 195 }], size: 10 },
    { row: [{ text: `Tax (${inv.taxRate || 0}%)`, x: 300 }, { text: money(inv.tax || 0), x: 195 }], size: 10 },
    ...(inv.discount ? [{ row: [{ text: 'Discount', x: 300 }, { text: `- ${money(inv.discount)}`, x: 195 }], size: 10 }] : []),
    { row: [{ text: 'GRAND TOTAL', font: '/F2', size: 12, x: 300 }, { text: `${cur} ${money(inv.grandTotal || 0)}`, font: '/F2', size: 12, x: 195 }], size: 12 },
    { row: [{ text: `Paid: ${money(inv.paidAmount || 0)}   Balance Due: ${money(inv.remaining || 0)}`, font: '/F2', x: 300 }], size: 9 },
    { margin: 0 },
    { text: inv.notes || '', size: 8 },
  ];

  const buf = buildInvoicePdf(lines as any);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${inv.invoiceNumber}.pdf"`);
  res.send(buf);
});

export const listPayments = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter: any = {};
  if (!isStaffRole(req.user?.role)) filter.customer = req.user?._id;
  if (req.query.invoice) filter.invoice = req.query.invoice;
  const [docs, total] = await Promise.all([
    Payment.find(filter).sort(sortOptions(req.query, '-date')).skip(skip).limit(limit)
      .populate('invoice', 'invoiceNumber grandTotal paymentStatus')
      .populate('customer', 'name email phone'),
    Payment.countDocuments(filter),
  ]);
  res.json({ success: true, data: paginate(docs, total, page, limit) });
});