import { Router } from 'express';
import { listVehicles, getVehicle, createVehicle, updateVehicle, deleteVehicle } from '../controllers/vehicle.controller';
import { protect } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { vehicleSchema, idParams } from '../validators';

const router = Router();
router.use(protect);

router.get('/', listVehicles);
router.post('/', validate(vehicleSchema), createVehicle);
router.get('/:id', updateValidator, getVehicle);
router.put('/:id', updateValidator, validate(vehicleSchema), updateVehicle);
router.delete('/:id', updateValidator, deleteVehicle);

function updateValidator(req: any, res: any, next: any) {
  const r = idParams.safeParse(req.params);
  if (!r.success) return res.status(400).json({ success: false, message: 'Invalid vehicle id' });
  req.params.id = r.data.id;
  next();
}

export default router;