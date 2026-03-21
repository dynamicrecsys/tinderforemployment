import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { createJob, getJobsByEmployer, getJobById, updateJob, deactivateJob } from './job.service';

const createJobSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  categoryId: z.string().uuid().optional(),
  requiredSkills: z.array(z.string()).default([]),
  workType: z.enum(['full_day', 'half_day', 'hourly']),
  payMin: z.number().int().positive(),
  payMax: z.number().int().positive(),
  payPeriod: z.enum(['per_hour', 'per_day', 'per_month']),
  locationLat: z.number().min(-90).max(90),
  locationLng: z.number().min(-180).max(180),
  locationText: z.string().min(1).max(200),
  maxDistanceKm: z.number().int().min(1).max(100).optional(),
  slots: z.number().int().min(1).max(100).optional(),
  expiresAt: z.string().optional(),
});

export async function createJobController(req: Request, res: Response, next: NextFunction) {
  try {
    const data = createJobSchema.parse(req.body);
    const job = await createJob({ ...data, employerUserId: req.userId! });
    res.status(201).json(job);
  } catch (err) {
    next(err);
  }
}

export async function listJobsController(req: Request, res: Response, next: NextFunction) {
  try {
    const jobs = await getJobsByEmployer(req.userId!);
    res.json(jobs);
  } catch (err) {
    next(err);
  }
}

export async function getJobController(req: Request, res: Response, next: NextFunction) {
  try {
    const job = await getJobById(req.params.jobId as string);
    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }
    res.json(job);
  } catch (err) {
    next(err);
  }
}

export async function updateJobController(req: Request, res: Response, next: NextFunction) {
  try {
    const job = await updateJob(req.params.jobId as string, req.userId!, req.body);
    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }
    res.json(job);
  } catch (err) {
    next(err);
  }
}

export async function deleteJobController(req: Request, res: Response, next: NextFunction) {
  try {
    await deactivateJob(req.params.jobId as string, req.userId!);
    res.json({ deleted: true });
  } catch (err) {
    next(err);
  }
}
