import { eq, and, sql, not, inArray, desc } from 'drizzle-orm';
import { db } from '../../config/db';
import {
  swipes, matches, jobListings, workerProfiles, employerProfiles, categories,
} from '../../db/schema';
import { distanceKm } from '../../utils/geo';
import { FEED_PAGE_SIZE } from '@tfe/shared';

// Get job feed for a worker (all active jobs, sorted by distance, excluding swiped)
export async function getJobFeed(userId: string, radiusKm: number = 25, page: number = 0) {
  const [worker] = await db.select().from(workerProfiles).where(eq(workerProfiles.userId, userId));
  if (!worker) return [];

  // Get already-swiped job IDs
  const swipedRows = await db.select({ targetId: swipes.targetId })
    .from(swipes)
    .where(and(eq(swipes.swiperId, userId), eq(swipes.targetType, 'job')));
  const swipedIds = swipedRows.map(r => r.targetId);

  // Get all active jobs (no geo filter — show everything, sorted by distance)
  const rows = await db.select({
    job: jobListings,
    employer: employerProfiles,
    category: categories,
  })
    .from(jobListings)
    .leftJoin(employerProfiles, eq(jobListings.employerId, employerProfiles.id))
    .leftJoin(categories, eq(jobListings.categoryId, categories.id))
    .where(and(
      eq(jobListings.isActive, true),
      ...(swipedIds.length > 0 ? [not(inArray(jobListings.id, swipedIds))] : []),
    ))
    .limit(50);

  // Calculate distance and sort
  return rows
    .map(row => {
      let dist = 0;
      if (worker.locationLat && worker.locationLng && row.job.locationLat && row.job.locationLng) {
        dist = distanceKm(
          worker.locationLat, worker.locationLng,
          row.job.locationLat, row.job.locationLng
        );
      }
      return {
        id: row.job.id,
        title: row.job.title,
        description: row.job.description,
        employerName: row.employer?.businessName || 'Unknown',
        employerPhoto: row.employer?.photoUrl || null,
        workType: row.job.workType,
        payMin: row.job.payMin,
        payMax: row.job.payMax,
        payPeriod: row.job.payPeriod,
        distanceKm: Math.round(dist * 10) / 10,
        categoryName: row.category?.nameEn || '',
        categoryNameHi: row.category?.nameHi || '',
      };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(page * FEED_PAGE_SIZE, (page + 1) * FEED_PAGE_SIZE);
}

// Get worker feed for an employer's specific job
export async function getWorkerFeed(userId: string, jobId: string, page: number = 0) {
  const [job] = await db.select().from(jobListings).where(eq(jobListings.id, jobId));
  if (!job) return [];

  // Verify this job belongs to this employer
  const [employer] = await db.select().from(employerProfiles).where(eq(employerProfiles.userId, userId));
  if (!employer || job.employerId !== employer.id) return [];

  // Get already-swiped worker IDs for this job
  const swipedRows = await db.select({ targetId: swipes.targetId })
    .from(swipes)
    .where(and(
      eq(swipes.swiperId, userId),
      eq(swipes.targetType, 'worker'),
      eq(swipes.contextJobId, jobId),
    ));
  const swipedIds = swipedRows.map(r => r.targetId);

  // Get all available workers (no geo filter)
  const workers = await db.select().from(workerProfiles)
    .where(and(
      eq(workerProfiles.isAvailable, true),
      ...(swipedIds.length > 0 ? [not(inArray(workerProfiles.id, swipedIds))] : []),
    ))
    .limit(50);

  return workers
    .map(w => {
      let dist = 0;
      if (job.locationLat && job.locationLng && w.locationLat && w.locationLng) {
        dist = distanceKm(
          job.locationLat, job.locationLng,
          w.locationLat, w.locationLng
        );
      }
      return {
        id: w.id,
        userId: w.userId,
        name: w.name,
        photoUrl: w.photoUrl,
        skills: w.skills,
        experienceYears: w.experienceYears,
        preferredWorkType: w.preferredWorkType,
        distanceKm: Math.round(dist * 10) / 10,
        isAvailable: w.isAvailable,
      };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(page * FEED_PAGE_SIZE, (page + 1) * FEED_PAGE_SIZE);
}

// Record a swipe and check for match
export async function recordSwipe(
  swiperId: string,
  targetType: 'job' | 'worker',
  targetId: string,
  direction: 'like' | 'pass',
  contextJobId?: string,
) {
  // Record the swipe
  await db.insert(swipes).values({
    swiperId,
    targetType,
    targetId,
    contextJobId: contextJobId || null,
    direction,
  }).onConflictDoNothing();

  if (direction !== 'like') {
    return { matched: false };
  }

  // Check for mutual match
  if (targetType === 'job') {
    // Worker liked a job. Check if employer liked this worker for this job.
    const [job] = await db.select().from(jobListings).where(eq(jobListings.id, targetId));
    if (!job) return { matched: false };

    const [employer] = await db.select().from(employerProfiles).where(eq(employerProfiles.id, job.employerId));
    if (!employer) return { matched: false };

    // Get worker profile ID
    const [workerProfile] = await db.select().from(workerProfiles).where(eq(workerProfiles.userId, swiperId));
    if (!workerProfile) return { matched: false };

    const [mutualSwipe] = await db.select().from(swipes).where(and(
      eq(swipes.swiperId, employer.userId),
      eq(swipes.targetType, 'worker'),
      eq(swipes.targetId, workerProfile.id),
      eq(swipes.contextJobId, targetId),
      eq(swipes.direction, 'like'),
    ));

    if (mutualSwipe) {
      const [match] = await db.insert(matches).values({
        jobId: targetId,
        workerId: swiperId,
        employerId: employer.userId,
      }).returning();
      return { matched: true, matchId: match.id };
    }
  } else {
    // Employer liked a worker. Check if worker liked any of employer's jobs (specifically the context job).
    if (!contextJobId) return { matched: false };

    const [workerProfile] = await db.select().from(workerProfiles).where(eq(workerProfiles.id, targetId));
    if (!workerProfile) return { matched: false };

    const [mutualSwipe] = await db.select().from(swipes).where(and(
      eq(swipes.swiperId, workerProfile.userId),
      eq(swipes.targetType, 'job'),
      eq(swipes.targetId, contextJobId),
      eq(swipes.direction, 'like'),
    ));

    if (mutualSwipe) {
      const [match] = await db.insert(matches).values({
        jobId: contextJobId,
        workerId: workerProfile.userId,
        employerId: swiperId,
      }).returning();
      return { matched: true, matchId: match.id };
    }
  }

  return { matched: false };
}

// Get matches for a user
export async function getUserMatches(userId: string) {
  const userMatches = await db.select().from(matches)
    .where(sql`${matches.workerId} = ${userId} OR ${matches.employerId} = ${userId}`)
    .orderBy(desc(matches.matchedAt));

  // Enrich with profile data
  const enriched = [];
  for (const match of userMatches) {
    const isWorker = match.workerId === userId;
    const otherUserId = isWorker ? match.employerId : match.workerId;

    let otherName = 'Unknown';
    let otherPhoto: string | null = null;

    if (isWorker) {
      const [ep] = await db.select().from(employerProfiles).where(eq(employerProfiles.userId, otherUserId));
      if (ep) { otherName = ep.businessName; otherPhoto = ep.photoUrl; }
    } else {
      const [wp] = await db.select().from(workerProfiles).where(eq(workerProfiles.userId, otherUserId));
      if (wp) { otherName = wp.name; otherPhoto = wp.photoUrl; }
    }

    const [job] = await db.select().from(jobListings).where(eq(jobListings.id, match.jobId));

    enriched.push({
      id: match.id,
      jobId: match.jobId,
      workerId: match.workerId,
      employerId: match.employerId,
      status: match.status,
      matchedAt: match.matchedAt.toISOString(),
      otherParty: { name: otherName, photoUrl: otherPhoto },
      job: { title: job?.title || 'Unknown Job' },
    });
  }

  return enriched;
}
