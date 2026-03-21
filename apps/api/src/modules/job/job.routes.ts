import { Router } from 'express';
import { authMiddleware, requireRole } from '../../middleware/auth.middleware';
import {
  createJobController,
  listJobsController,
  getJobController,
  updateJobController,
  deleteJobController,
} from './job.controller';

const router = Router();

router.use(authMiddleware);
router.post('/', requireRole('employer'), createJobController);
router.get('/', requireRole('employer'), listJobsController);
router.get('/:jobId', getJobController);
router.patch('/:jobId', requireRole('employer'), updateJobController);
router.delete('/:jobId', requireRole('employer'), deleteJobController);

export default router;
