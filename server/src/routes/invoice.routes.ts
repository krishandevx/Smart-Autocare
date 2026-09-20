import { Router } from 'express';
import {
  listInvoices, getInvoice, createInvoice, recordPayment, updateInvoiceStatus, listPayments, invoicePdf,
} from '../controllers/invoice.controller';
import { protect } from '../middlewares/auth';
import { authorize, STAFF } from '../middlewares/role';
import { validate } from '../middlewares/validate';
import { invoiceSchema, paymentSchema } from '../validators';

const router = Router();
router.use(protect);
const staff = authorize(...STAFF);

router.get('/', listInvoices);
router.post('/', staff, validate(invoiceSchema), createInvoice);
router.get('/:id', getInvoice);
router.get('/:id/pdf', invoicePdf);
router.put('/:id', staff, updateInvoiceStatus);
router.post('/:id/payments', validate(paymentSchema), recordPayment);
router.delete('/:id/payments/list', (_req: any, res: any) => res.status(405).json({ success: false, message: 'Use GET /api/payments' }));

export default router;
export { listPayments }; 
export const paymentsRouter = Router();
paymentsRouter.get('/', listPayments);