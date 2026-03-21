import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import {
  createWorkerController,
  createEmployerController,
  getMeController,
  updateMeController,
  updateLocationController,
  getCategoriesController,
} from './profile.controller';

const router = Router();

router.get('/categories', getCategoriesController);
router.post('/worker', authMiddleware, createWorkerController);
router.post('/employer', authMiddleware, createEmployerController);
router.get('/me', authMiddleware, getMeController);
router.patch('/me', authMiddleware, updateMeController);
router.patch('/me/location', authMiddleware, updateLocationController);

export default router;
