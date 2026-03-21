import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  smallint,
  integer,
  timestamp,
  pgEnum,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['worker', 'employer']);
export const workTypeEnum = pgEnum('work_type', ['full_day', 'half_day', 'hourly']);
export const preferredWorkTypeEnum = pgEnum('preferred_work_type', ['full_day', 'half_day', 'hourly', 'any']);
export const swipeDirectionEnum = pgEnum('swipe_direction', ['like', 'pass']);
export const swipeTargetTypeEnum = pgEnum('swipe_target_type', ['job', 'worker']);
export const matchStatusEnum = pgEnum('match_status', ['active', 'completed', 'cancelled']);
export const payPeriodEnum = pgEnum('pay_period', ['per_hour', 'per_day', 'per_month']);

// Users
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  phone: varchar('phone', { length: 15 }).notNull().unique(),
  role: userRoleEnum('role'),
  isOnboarded: boolean('is_onboarded').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Worker Profiles
export const workerProfiles = pgTable('worker_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id).unique(),
  name: varchar('name', { length: 100 }).notNull(),
  photoUrl: text('photo_url'),
  skills: text('skills').array().notNull().default(sql`'{}'::text[]`),
  categoryIds: uuid('category_ids').array().notNull().default(sql`'{}'::uuid[]`),
  experienceYears: smallint('experience_years').notNull().default(0),
  preferredWorkType: preferredWorkTypeEnum('preferred_work_type').notNull().default('any'),
  bio: text('bio'),
  locationLat: integer('location_lat'), // stored as lat * 1e6 for precision without float
  locationLng: integer('location_lng'),
  locationText: varchar('location_text', { length: 200 }),
  isAvailable: boolean('is_available').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Employer Profiles
export const employerProfiles = pgTable('employer_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id).unique(),
  businessName: varchar('business_name', { length: 200 }).notNull(),
  contactPerson: varchar('contact_person', { length: 100 }).notNull(),
  photoUrl: text('photo_url'),
  businessType: varchar('business_type', { length: 100 }),
  locationLat: integer('location_lat'),
  locationLng: integer('location_lng'),
  locationText: varchar('location_text', { length: 200 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Categories
export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  nameEn: varchar('name_en', { length: 100 }).notNull(),
  nameHi: varchar('name_hi', { length: 100 }).notNull(),
  icon: varchar('icon', { length: 50 }).notNull(),
});

// Job Listings
export const jobListings = pgTable('job_listings', {
  id: uuid('id').primaryKey().defaultRandom(),
  employerId: uuid('employer_id').notNull().references(() => employerProfiles.id),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  categoryId: uuid('category_id').references(() => categories.id),
  requiredSkills: text('required_skills').array().notNull().default(sql`'{}'::text[]`),
  workType: workTypeEnum('work_type').notNull(),
  payMin: integer('pay_min').notNull(),
  payMax: integer('pay_max').notNull(),
  payPeriod: payPeriodEnum('pay_period').notNull(),
  locationLat: integer('location_lat'),
  locationLng: integer('location_lng'),
  locationText: varchar('location_text', { length: 200 }),
  maxDistanceKm: integer('max_distance_km').notNull().default(25),
  slots: smallint('slots').notNull().default(1),
  isActive: boolean('is_active').notNull().default(true),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('idx_job_listings_employer').on(table.employerId),
  index('idx_job_listings_category').on(table.categoryId),
  index('idx_job_listings_active').on(table.isActive),
]);

// Swipes
export const swipes = pgTable('swipes', {
  id: uuid('id').primaryKey().defaultRandom(),
  swiperId: uuid('swiper_id').notNull().references(() => users.id),
  targetType: swipeTargetTypeEnum('target_type').notNull(),
  targetId: uuid('target_id').notNull(),
  contextJobId: uuid('context_job_id').references(() => jobListings.id),
  direction: swipeDirectionEnum('direction').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex('idx_swipes_unique').on(table.swiperId, table.targetType, table.targetId),
  index('idx_swipes_target').on(table.targetId, table.direction),
]);

// Matches
export const matches = pgTable('matches', {
  id: uuid('id').primaryKey().defaultRandom(),
  jobId: uuid('job_id').notNull().references(() => jobListings.id),
  workerId: uuid('worker_id').notNull().references(() => users.id),
  employerId: uuid('employer_id').notNull().references(() => users.id),
  status: matchStatusEnum('status').notNull().default('active'),
  matchedAt: timestamp('matched_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('idx_matches_worker').on(table.workerId),
  index('idx_matches_employer').on(table.employerId),
]);

// Messages
export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  matchId: uuid('match_id').notNull().references(() => matches.id),
  senderId: uuid('sender_id').notNull().references(() => users.id),
  body: text('body').notNull(),
  isRead: boolean('is_read').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('idx_messages_match').on(table.matchId, table.createdAt),
]);
