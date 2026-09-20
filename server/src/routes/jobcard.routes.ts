import { Router } from 'express';
import {
  listJobCards, getJobCard, getJobCardEstimate, createJobCard, updateJobCardStatus, assignStaff, addNote, addPart, removePart, setLabor, closeJobCard,
  sendForInspection, startJob, markQualityCheck,
} from '../controllers/jobcard.controller';
import { getInspection, saveInspection, completeInspection, vehicleHealth } from '../controllers/inspection.controller';
import { createEstimate } from '../controllers/estimate.controller';
import { protect } from '../middlewares/auth';
import { authorize, STAFF } from '../middlewares/role';
import { validate } from '../middlewares/validate';
import {
  jobCardSchema, jobCardStatusSchema, addJobNoteSchema, addJobPartSchema, jobLaborSchema,
  inspectionSchema, estimateSchema,
} from '../validators';

const router = Router();
router.use(protect);

router.get('/', listJobCards);
router.get('/:id', getJobCard);

const staff = authorize(...STAFF);

router.post('/', staff, validate(jobCardSchema), createJobCard);
router.put('/:id/status', staff, validate(jobCardStatusSchema), updateJobCardStatus);
router.put('/:id/assign', staff, assignStaff);
router.post('/:id/notes', staff, validate(addJobNoteSchema), addNote);
router.post('/:id/parts', staff, validate(addJobPartSchema), addPart);
router.delete('/:id/parts/:index', staff, removePart);
router.put('/:id/labor', staff, validate(jobLaborSchema), setLabor);
router.post('/:id/close', staff, closeJobCard);
router.post('/:id/send-inspection', staff, sendForInspection);
router.post('/:id/start', staff, startJob);
router.post('/:id/quality', staff, markQualityCheck);
router.get('/:id/estimate', getJobCardEstimate);

router.get('/:id/inspection', getInspection);
router.post('/:id/inspection', staff, validate(inspectionSchema), saveInspection);
router.post('/:id/inspection/complete', staff, completeInspection);

router.post('/:id/estimate', staff, validate(estimateSchema), createEstimate);

export default router;