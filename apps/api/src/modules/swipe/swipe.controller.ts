import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { getJobFeed, getWorkerFeed, recordSwipe, getUserMatches } from './swipe.service';

const swipeSchema = z.object({
  targetType: z.enum(['job', 'worker']),
  targetId: z.string().uuid(),
  contextJobId: z.string().uuid().optional(),
  direction: z.enum(['like', 'pass']),
});

export async function jobFeedController(req: Request, res: Response, next: NextFunction) {
  try {
    const radius = Number(req.query.radius) || 25;
    const page = Number(req.query.page) || 0;
    const feed = await getJobFeed(req.userId!, radius, page);
    res.json(feed);
  } catch (err) {
    next(err);
  }
}

export async function workerFeedController(req: Request, res: Response, next: NextFunction) {
  try {
    const jobId = req.query.jobId as string;
    if (!jobId) {
      res.status(400).json({ error: 'jobId query parameter required' });
      return;
    }
    const page = Number(req.query.page) || 0;
    const feed = await getWorkerFeed(req.userId!, jobId, page);
    res.json(feed);
  } catch (err) {
    next(err);
  }
}

export async function swipeController(req: Request, res: Response, next: NextFunction) {
  try {
    const data = swipeSchema.parse(req.body);
    const result = await recordSwipe(
      req.userId!, data.targetType, data.targetId, data.direction, data.contextJobId
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function matchesController(req: Request, res: Response, next: NextFunction) {
  try {
    const userMatches = await getUserMatches(req.userId!);
    res.json(userMatches);
  } catch (err) {
    next(err);
  }
}
