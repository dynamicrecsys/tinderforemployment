import { eq, and, desc } from 'drizzle-orm';
import { db } from '../../config/db';
import { jobListings, employerProfiles } from '../../db/schema';
import { toStoredCoord } from '../../utils/geo';

interface CreateJobInput {
  employerUserId: string;
  title: string;
  description?: string;
  categoryId?: string;
  requiredSkills: string[];
  workType: 'full_day' | 'half_day' | 'hourly';
  payMin: number;
  payMax: number;
  payPeriod: 'per_hour' | 'per_day' | 'per_month';
  locationLat: number;
  locationLng: number;
  locationText: string;
  maxDistanceKm?: number;
  slots?: number;
  expiresAt?: string;
}

export async function createJob(input: CreateJobInput) {
  // Get employer profile ID
  const [employer] = await db.select().from(employerProfiles)
    .where(eq(employerProfiles.userId, input.employerUserId));
  if (!employer) throw new Error('Employer profile not found');

  const [job] = await db.insert(jobListings).values({
    employerId: employer.id,
    title: input.title,
    description: input.description || null,
    categoryId: input.categoryId || null,
    requiredSkills: input.requiredSkills,
    workType: input.workType,
    payMin: input.payMin,
    payMax: input.payMax,
    payPeriod: input.payPeriod,
    locationLat: toStoredCoord(input.locationLat),
    locationLng: toStoredCoord(input.locationLng),
    locationText: input.locationText,
    maxDistanceKm: input.maxDistanceKm || 25,
    slots: input.slots || 1,
    expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
  }).returning();

  return job;
}

export async function getJobsByEmployer(employerUserId: string) {
  const [employer] = await db.select().from(employerProfiles)
    .where(eq(employerProfiles.userId, employerUserId));
  if (!employer) return [];

  return db.select().from(jobListings)
    .where(eq(jobListings.employerId, employer.id))
    .orderBy(desc(jobListings.createdAt));
}

export async function getJobById(jobId: string) {
  const [job] = await db.select().from(jobListings).where(eq(jobListings.id, jobId));
  return job || null;
}

export async function updateJob(jobId: string, employerUserId: string, updates: Partial<CreateJobInput>) {
  const [employer] = await db.select().from(employerProfiles)
    .where(eq(employerProfiles.userId, employerUserId));
  if (!employer) throw new Error('Employer profile not found');

  const data: Record<string, unknown> = { updatedAt: new Date() };
  if (updates.title) data.title = updates.title;
  if (updates.description !== undefined) data.description = updates.description;
  if (updates.categoryId) data.categoryId = updates.categoryId;
  if (updates.requiredSkills) data.requiredSkills = updates.requiredSkills;
  if (updates.workType) data.workType = updates.workType;
  if (updates.payMin !== undefined) data.payMin = updates.payMin;
  if (updates.payMax !== undefined) data.payMax = updates.payMax;
  if (updates.payPeriod) data.payPeriod = updates.payPeriod;
  if (updates.locationLat !== undefined) data.locationLat = toStoredCoord(updates.locationLat);
  if (updates.locationLng !== undefined) data.locationLng = toStoredCoord(updates.locationLng);
  if (updates.locationText) data.locationText = updates.locationText;
  if (updates.maxDistanceKm !== undefined) data.maxDistanceKm = updates.maxDistanceKm;
  if (updates.slots !== undefined) data.slots = updates.slots;

  const [job] = await db.update(jobListings).set(data)
    .where(and(eq(jobListings.id, jobId), eq(jobListings.employerId, employer.id)))
    .returning();
  return job;
}

export async function deactivateJob(jobId: string, employerUserId: string) {
  const [employer] = await db.select().from(employerProfiles)
    .where(eq(employerProfiles.userId, employerUserId));
  if (!employer) throw new Error('Employer profile not found');

  await db.update(jobListings).set({ isActive: false, updatedAt: new Date() })
    .where(and(eq(jobListings.id, jobId), eq(jobListings.employerId, employer.id)));
}
