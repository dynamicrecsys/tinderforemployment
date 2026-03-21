import { eq } from 'drizzle-orm';
import { db } from '../../config/db';
import { users, workerProfiles, employerProfiles, categories } from '../../db/schema';
import { toStoredCoord } from '../../utils/geo';

interface CreateWorkerInput {
  userId: string;
  name: string;
  photoUrl?: string;
  skills: string[];
  categoryIds: string[];
  experienceYears: number;
  preferredWorkType: 'full_day' | 'half_day' | 'hourly' | 'any';
  bio?: string;
  locationLat: number;
  locationLng: number;
  locationText: string;
}

interface CreateEmployerInput {
  userId: string;
  businessName: string;
  contactPerson: string;
  photoUrl?: string;
  businessType?: string;
  locationLat: number;
  locationLng: number;
  locationText: string;
}

export async function createWorkerProfile(input: CreateWorkerInput) {
  const [profile] = await db.insert(workerProfiles).values({
    userId: input.userId,
    name: input.name,
    photoUrl: input.photoUrl || null,
    skills: input.skills,
    categoryIds: input.categoryIds,
    experienceYears: input.experienceYears,
    preferredWorkType: input.preferredWorkType,
    bio: input.bio || null,
    locationLat: toStoredCoord(input.locationLat),
    locationLng: toStoredCoord(input.locationLng),
    locationText: input.locationText,
  }).returning();

  await db.update(users).set({ role: 'worker', isOnboarded: true }).where(eq(users.id, input.userId));

  return profile;
}

export async function createEmployerProfile(input: CreateEmployerInput) {
  const [profile] = await db.insert(employerProfiles).values({
    userId: input.userId,
    businessName: input.businessName,
    contactPerson: input.contactPerson,
    photoUrl: input.photoUrl || null,
    businessType: input.businessType || null,
    locationLat: toStoredCoord(input.locationLat),
    locationLng: toStoredCoord(input.locationLng),
    locationText: input.locationText,
  }).returning();

  await db.update(users).set({ role: 'employer', isOnboarded: true }).where(eq(users.id, input.userId));

  return profile;
}

export async function getProfile(userId: string) {
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user) return null;

  if (user.role === 'worker') {
    const [profile] = await db.select().from(workerProfiles).where(eq(workerProfiles.userId, userId));
    return { user, profile, role: 'worker' as const };
  }

  if (user.role === 'employer') {
    const [profile] = await db.select().from(employerProfiles).where(eq(employerProfiles.userId, userId));
    return { user, profile, role: 'employer' as const };
  }

  return { user, profile: null, role: null };
}

export async function updateWorkerProfile(userId: string, updates: Partial<CreateWorkerInput>) {
  const data: Record<string, unknown> = { updatedAt: new Date() };
  if (updates.name) data.name = updates.name;
  if (updates.photoUrl) data.photoUrl = updates.photoUrl;
  if (updates.skills) data.skills = updates.skills;
  if (updates.categoryIds) data.categoryIds = updates.categoryIds;
  if (updates.experienceYears !== undefined) data.experienceYears = updates.experienceYears;
  if (updates.preferredWorkType) data.preferredWorkType = updates.preferredWorkType;
  if (updates.bio !== undefined) data.bio = updates.bio;
  if (updates.locationLat !== undefined) data.locationLat = toStoredCoord(updates.locationLat);
  if (updates.locationLng !== undefined) data.locationLng = toStoredCoord(updates.locationLng);
  if (updates.locationText) data.locationText = updates.locationText;

  const [profile] = await db.update(workerProfiles).set(data).where(eq(workerProfiles.userId, userId)).returning();
  return profile;
}

export async function updateEmployerProfile(userId: string, updates: Partial<CreateEmployerInput>) {
  const data: Record<string, unknown> = { updatedAt: new Date() };
  if (updates.businessName) data.businessName = updates.businessName;
  if (updates.contactPerson) data.contactPerson = updates.contactPerson;
  if (updates.photoUrl) data.photoUrl = updates.photoUrl;
  if (updates.businessType) data.businessType = updates.businessType;
  if (updates.locationLat !== undefined) data.locationLat = toStoredCoord(updates.locationLat);
  if (updates.locationLng !== undefined) data.locationLng = toStoredCoord(updates.locationLng);
  if (updates.locationText) data.locationText = updates.locationText;

  const [profile] = await db.update(employerProfiles).set(data).where(eq(employerProfiles.userId, userId)).returning();
  return profile;
}

export async function updateLocation(userId: string, role: string, lat: number, lng: number, text?: string) {
  const storedLat = toStoredCoord(lat);
  const storedLng = toStoredCoord(lng);

  if (role === 'worker') {
    await db.update(workerProfiles).set({
      locationLat: storedLat,
      locationLng: storedLng,
      ...(text ? { locationText: text } : {}),
      updatedAt: new Date(),
    }).where(eq(workerProfiles.userId, userId));
  } else {
    await db.update(employerProfiles).set({
      locationLat: storedLat,
      locationLng: storedLng,
      ...(text ? { locationText: text } : {}),
      updatedAt: new Date(),
    }).where(eq(employerProfiles.userId, userId));
  }
}

export async function getAllCategories() {
  return db.select().from(categories);
}
