import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { jobFeedController, workerFeedController, swipeController, matchesController } from './swipe.controller';

const router = Router();

router.use(authMiddleware);
router.get('/feed/jobs', jobFeedController);
router.get('/feed/workers', workerFeedController);
router.post('/swipe', swipeController);
router.get('/matches', matchesController);

export default router;
