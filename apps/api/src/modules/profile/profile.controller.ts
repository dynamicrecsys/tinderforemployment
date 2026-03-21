import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  createWorkerProfile,
  createEmployerProfile,
  getProfile,
  updateWorkerProfile,
  updateEmployerProfile,
  updateLocation,
  getAllCategories,
} from './profile.service';

const workerProfileSchema = z.object({
  name: z.string().min(1).max(100),
  photoUrl: z.string().optional(),
  skills: z.array(z.string()).min(1),
  categoryIds: z.array(z.string().uuid()),
  experienceYears: z.number().int().min(0).max(50),
  preferredWorkType: z.enum(['full_day', 'half_day', 'hourly', 'any']),
  bio: z.string().max(500).optional(),
  locationLat: z.number().min(-90).max(90),
  locationLng: z.number().min(-180).max(180),
  locationText: z.string().min(1).max(200),
});

const employerProfileSchema = z.object({
  businessName: z.string().min(1).max(200),
  contactPerson: z.string().min(1).max(100),
  photoUrl: z.string().optional(),
  businessType: z.string().max(100).optional(),
  locationLat: z.number().min(-90).max(90),
  locationLng: z.number().min(-180).max(180),
  locationText: z.string().min(1).max(200),
});

const locationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  text: z.string().max(200).optional(),
});

export async function createWorkerController(req: Request, res: Response, next: NextFunction) {
  try {
    const data = workerProfileSchema.parse(req.body);
    const profile = await createWorkerProfile({ ...data, userId: req.userId! });
    res.status(201).json(profile);
  } catch (err) {
    next(err);
  }
}

export async function createEmployerController(req: Request, res: Response, next: NextFunction) {
  try {
    const data = employerProfileSchema.parse(req.body);
    const profile = await createEmployerProfile({ ...data, userId: req.userId! });
    res.status(201).json(profile);
  } catch (err) {
    next(err);
  }
}

export async function getMeController(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await getProfile(req.userId!);
    if (!result) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function updateMeController(req: Request, res: Response, next: NextFunction) {
  try {
    if (req.userRole === 'worker') {
      const profile = await updateWorkerProfile(req.userId!, req.body);
      res.json(profile);
    } else if (req.userRole === 'employer') {
      const profile = await updateEmployerProfile(req.userId!, req.body);
      res.json(profile);
    } else {
      res.status(400).json({ error: 'Profile not set up yet' });
    }
  } catch (err) {
    next(err);
  }
}

export async function updateLocationController(req: Request, res: Response, next: NextFunction) {
  try {
    const { lat, lng, text } = locationSchema.parse(req.body);
    await updateLocation(req.userId!, req.userRole!, lat, lng, text);
    res.json({ updated: true });
  } catch (err) {
    next(err);
  }
}

export async function getCategoriesController(_req: Request, res: Response, next: NextFunction) {
  try {
    const cats = await getAllCategories();
    res.json(cats);
  } catch (err) {
    next(err);
  }
}
