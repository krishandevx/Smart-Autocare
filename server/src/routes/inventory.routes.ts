import { Router } from 'express';
import {
  listParts, getPart, createPart, updatePart, deletePart, adjustStock, partTransactions,
  listSuppliers, getSupplier, createSupplier, updateSupplier, deleteSupplier,
  listPurchases, getPurchase, createPurchase, updatePurchase, receivePurchase, deletePurchase,
} from '../controllers/inventory.controller';
import { protect } from '../middlewares/auth';
import { authorize, MANAGER, STAFF } from '../middlewares/role';
import { validate } from '../middlewares/validate';
import { partSchema, stockSchema, supplierSchema, purchaseSchema } from '../validators';

const router = Router();
router.use(protect, authorize(...STAFF));
const manager = authorize(...MANAGER);

router.get('/parts', listParts);
router.post('/parts', validate(partSchema), createPart);
router.get('/parts/:id', getPart);
router.put('/parts/:id', validate(partSchema), updatePart);
router.delete('/parts/:id', manager, deletePart);
router.post('/parts/:id/stock', validate(stockSchema), adjustStock);
router.get('/parts/:id/transactions', partTransactions);

router.get('/suppliers', listSuppliers);
router.get('/suppliers/:id', getSupplier);
router.post('/suppliers', validate(supplierSchema), createSupplier);
router.put('/suppliers/:id', validate(supplierSchema), updateSupplier);
router.delete('/suppliers/:id', manager, deleteSupplier);

router.get('/purchases', listPurchases);
router.post('/purchases', manager, validate(purchaseSchema), createPurchase);
router.get('/purchases/:id', getPurchase);
router.put('/purchases/:id', manager, updatePurchase);
router.post('/purchases/:id/receive', manager, receivePurchase);
router.delete('/purchases/:id', manager, deletePurchase);

export default router;