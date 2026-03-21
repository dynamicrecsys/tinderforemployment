import dotenv from 'dotenv';
import { resolve } from 'path';
dotenv.config({ path: resolve(process.cwd(), '.env') });
dotenv.config({ path: resolve(process.cwd(), '../../.env') });

import { eq } from 'drizzle-orm';
import { db, pool } from '../config/db';
import {
  categories,
  users,
  employerProfiles,
  workerProfiles,
  jobListings,
} from './schema';
import { SEED_CATEGORIES } from '@tfe/shared';
import { toStoredCoord } from '../utils/geo';

// --- Dummy data definitions ---

const DUMMY_EMPLOYERS = [
  {
    phone: '+919900000001',
    businessName: 'Sharma Construction Pvt. Ltd.',
    contactPerson: 'Rajesh Sharma',
    businessType: 'Construction Company',
    lat: 19.076090,
    lng: 72.877426,
    locationText: 'Dadar, Mumbai',
  },
  {
    phone: '+919900000002',
    businessName: 'Punjab Da Dhaba',
    contactPerson: 'Gurpreet Singh',
    businessType: 'Restaurant',
    lat: 19.054080,
    lng: 72.840570,
    locationText: 'Bandra West, Mumbai',
  },
  {
    phone: '+919900000003',
    businessName: 'Reliable Plastics Industries',
    contactPerson: 'Manoj Patel',
    businessType: 'Factory',
    lat: 19.186500,
    lng: 72.967800,
    locationText: 'Thane, Mumbai',
  },
  {
    phone: '+919900000004',
    businessName: 'SafeGuard Security Services',
    contactPerson: 'Vikram Rathore',
    businessType: 'Security Agency',
    lat: 19.017600,
    lng: 72.856100,
    locationText: 'Worli, Mumbai',
  },
  {
    phone: '+919900000005',
    businessName: 'City Link Transport Co.',
    contactPerson: 'Anil Deshmukh',
    businessType: 'Transport Company',
    lat: 19.109700,
    lng: 72.882200,
    locationText: 'Sion, Mumbai',
  },
];

const DUMMY_WORKERS = [
  {
    phone: '+919900000011',
    name: 'Ramesh Kumar',
    skills: ['Masonry', 'Plastering', 'Tile Setting'],
    categoryNames: ['Construction'],
    experienceYears: 8,
    preferredWorkType: 'full_day' as const,
    bio: 'Experienced mason with 8 years in residential construction.',
    lat: 19.065000,
    lng: 72.870000,
    locationText: 'Parel, Mumbai',
  },
  {
    phone: '+919900000012',
    name: 'Suresh Yadav',
    skills: ['Driving', 'Vehicle Maintenance', 'Navigation'],
    categoryNames: ['Driving'],
    experienceYears: 5,
    preferredWorkType: 'full_day' as const,
    bio: 'Professional driver with commercial license. Familiar with Mumbai roads.',
    lat: 19.045000,
    lng: 72.820000,
    locationText: 'Andheri East, Mumbai',
  },
  {
    phone: '+919900000013',
    name: 'Pooja Devi',
    skills: ['Cooking', 'Meal Preparation', 'Kitchen Management'],
    categoryNames: ['Cooking'],
    experienceYears: 6,
    preferredWorkType: 'any' as const,
    bio: 'Home cook experienced in North Indian and South Indian cuisines.',
    lat: 19.090000,
    lng: 72.890000,
    locationText: 'Kurla, Mumbai',
  },
  {
    phone: '+919900000014',
    name: 'Vikash Singh',
    skills: ['Welding', 'Metal Cutting', 'Fabrication'],
    categoryNames: ['Welding'],
    experienceYears: 4,
    preferredWorkType: 'full_day' as const,
    bio: 'Certified welder with experience in structural steel work.',
    lat: 19.170000,
    lng: 72.950000,
    locationText: 'Thane West, Mumbai',
  },
  {
    phone: '+919900000015',
    name: 'Lakshmi Bai',
    skills: ['House Cleaning', 'Laundry', 'Organizing'],
    categoryNames: ['Housekeeping'],
    experienceYears: 10,
    preferredWorkType: 'half_day' as const,
    bio: 'Reliable housekeeper working in Mumbai for 10 years.',
    lat: 19.030000,
    lng: 72.850000,
    locationText: 'Lower Parel, Mumbai',
  },
  {
    phone: '+919900000016',
    name: 'Raju Carpenter',
    skills: ['Furniture Making', 'Wood Polishing', 'Cabinet Installation'],
    categoryNames: ['Carpentry'],
    experienceYears: 12,
    preferredWorkType: 'full_day' as const,
    bio: 'Master carpenter specializing in custom furniture and interiors.',
    lat: 19.100000,
    lng: 72.860000,
    locationText: 'Matunga, Mumbai',
  },
  {
    phone: '+919900000017',
    name: 'Amit Electrician',
    skills: ['Wiring', 'Circuit Repair', 'Appliance Installation'],
    categoryNames: ['Electrical'],
    experienceYears: 7,
    preferredWorkType: 'any' as const,
    bio: 'Licensed electrician for residential and commercial projects.',
    lat: 19.120000,
    lng: 72.910000,
    locationText: 'Ghatkopar, Mumbai',
  },
  {
    phone: '+919900000018',
    name: 'Santosh Painter',
    skills: ['Wall Painting', 'Texture Painting', 'Waterproofing'],
    categoryNames: ['Painting'],
    experienceYears: 9,
    preferredWorkType: 'full_day' as const,
    bio: 'Professional painter for homes and offices. Expert in texture finishes.',
    lat: 19.050000,
    lng: 72.830000,
    locationText: 'Bandra East, Mumbai',
  },
  {
    phone: '+919900000019',
    name: 'Deepak Guard',
    skills: ['Security Patrol', 'CCTV Monitoring', 'Access Control'],
    categoryNames: ['Security'],
    experienceYears: 3,
    preferredWorkType: 'full_day' as const,
    bio: 'Ex-army personnel. Trained in security operations.',
    lat: 19.020000,
    lng: 72.840000,
    locationText: 'Worli, Mumbai',
  },
  {
    phone: '+919900000020',
    name: 'Meena Tailor',
    skills: ['Stitching', 'Alterations', 'Embroidery'],
    categoryNames: ['Tailoring'],
    experienceYears: 15,
    preferredWorkType: 'half_day' as const,
    bio: 'Expert tailor with 15 years of experience in ladies and gents tailoring.',
    lat: 19.080000,
    lng: 72.870000,
    locationText: 'Dadar East, Mumbai',
  },
];

// Job definitions reference employer index (0-4) and category nameEn
const DUMMY_JOBS = [
  // Employer 0: Sharma Construction
  {
    employerIdx: 0,
    title: 'Site Mason for Residential Project',
    description: 'Need experienced mason for a 3-month residential building project in Dadar.',
    categoryName: 'Construction',
    requiredSkills: ['Masonry', 'Plastering'],
    workType: 'full_day' as const,
    payMin: 700,
    payMax: 900,
    payPeriod: 'per_day' as const,
    lat: 19.076090,
    lng: 72.877426,
    locationText: 'Dadar, Mumbai',
    slots: 4,
  },
  {
    employerIdx: 0,
    title: 'Painter for Interior Work',
    description: 'Interior painting for new apartments. Must have experience with emulsion and texture.',
    categoryName: 'Painting',
    requiredSkills: ['Wall Painting', 'Texture Painting'],
    workType: 'full_day' as const,
    payMin: 600,
    payMax: 800,
    payPeriod: 'per_day' as const,
    lat: 19.078000,
    lng: 72.879000,
    locationText: 'Dadar West, Mumbai',
    slots: 2,
  },
  {
    employerIdx: 0,
    title: 'Plumber for New Building',
    description: 'Pipeline and fitting work for a newly constructed residential building.',
    categoryName: 'Plumbing',
    requiredSkills: ['Pipe Fitting', 'Plumbing'],
    workType: 'full_day' as const,
    payMin: 650,
    payMax: 850,
    payPeriod: 'per_day' as const,
    lat: 19.074000,
    lng: 72.875000,
    locationText: 'Prabhadevi, Mumbai',
    slots: 2,
  },
  // Employer 1: Punjab Da Dhaba
  {
    employerIdx: 1,
    title: 'Tandoor Chef Needed',
    description: 'Looking for experienced tandoor chef for busy restaurant in Bandra.',
    categoryName: 'Cooking',
    requiredSkills: ['Tandoor Cooking', 'North Indian Cuisine'],
    workType: 'full_day' as const,
    payMin: 18000,
    payMax: 25000,
    payPeriod: 'per_month' as const,
    lat: 19.054080,
    lng: 72.840570,
    locationText: 'Bandra West, Mumbai',
    slots: 1,
  },
  {
    employerIdx: 1,
    title: 'Kitchen Helper - Part Time',
    description: 'Part-time kitchen helper for morning shift. Washing, chopping, and cleaning duties.',
    categoryName: 'Cooking',
    requiredSkills: ['Kitchen Cleaning', 'Vegetable Preparation'],
    workType: 'half_day' as const,
    payMin: 300,
    payMax: 400,
    payPeriod: 'per_day' as const,
    lat: 19.054080,
    lng: 72.840570,
    locationText: 'Bandra West, Mumbai',
    slots: 2,
  },
  {
    employerIdx: 1,
    title: 'Delivery Boy for Food Orders',
    description: 'Deliver food orders within 5 km radius. Must have own two-wheeler.',
    categoryName: 'Delivery',
    requiredSkills: ['Two-Wheeler Driving', 'Navigation'],
    workType: 'full_day' as const,
    payMin: 12000,
    payMax: 15000,
    payPeriod: 'per_month' as const,
    lat: 19.054080,
    lng: 72.840570,
    locationText: 'Bandra West, Mumbai',
    slots: 3,
  },
  // Employer 2: Reliable Plastics Industries
  {
    employerIdx: 2,
    title: 'Factory Machine Operator',
    description: 'Operate injection molding machines. Training provided for freshers.',
    categoryName: 'Factory Work',
    requiredSkills: ['Machine Operation', 'Quality Check'],
    workType: 'full_day' as const,
    payMin: 12000,
    payMax: 16000,
    payPeriod: 'per_month' as const,
    lat: 19.186500,
    lng: 72.967800,
    locationText: 'Thane MIDC, Mumbai',
    slots: 5,
  },
  {
    employerIdx: 2,
    title: 'Warehouse Packing Staff',
    description: 'Pack finished goods for dispatch. Standing work for 8 hours.',
    categoryName: 'Warehouse',
    requiredSkills: ['Packing', 'Labeling'],
    workType: 'full_day' as const,
    payMin: 400,
    payMax: 500,
    payPeriod: 'per_day' as const,
    lat: 19.186500,
    lng: 72.967800,
    locationText: 'Thane MIDC, Mumbai',
    slots: 8,
  },
  {
    employerIdx: 2,
    title: 'Electrician for Factory Maintenance',
    description: 'Maintain electrical systems, motors, and panels in manufacturing unit.',
    categoryName: 'Electrical',
    requiredSkills: ['Industrial Wiring', 'Motor Repair'],
    workType: 'full_day' as const,
    payMin: 18000,
    payMax: 22000,
    payPeriod: 'per_month' as const,
    lat: 19.186500,
    lng: 72.967800,
    locationText: 'Thane MIDC, Mumbai',
    slots: 1,
  },
  // Employer 3: SafeGuard Security
  {
    employerIdx: 3,
    title: 'Security Guard - Day Shift',
    description: 'Security guard for corporate office building. Uniform provided.',
    categoryName: 'Security',
    requiredSkills: ['Security Patrol', 'Access Control'],
    workType: 'full_day' as const,
    payMin: 14000,
    payMax: 18000,
    payPeriod: 'per_month' as const,
    lat: 19.017600,
    lng: 72.856100,
    locationText: 'Worli, Mumbai',
    slots: 3,
  },
  {
    employerIdx: 3,
    title: 'Security Guard - Night Shift',
    description: 'Night shift security for residential society. 10 PM to 6 AM.',
    categoryName: 'Security',
    requiredSkills: ['Security Patrol', 'CCTV Monitoring'],
    workType: 'full_day' as const,
    payMin: 15000,
    payMax: 20000,
    payPeriod: 'per_month' as const,
    lat: 19.020000,
    lng: 72.850000,
    locationText: 'Lower Parel, Mumbai',
    slots: 2,
  },
  {
    employerIdx: 3,
    title: 'Housekeeping Staff for Office',
    description: 'Office cleaning and maintenance. Morning shift 7 AM to 12 PM.',
    categoryName: 'Housekeeping',
    requiredSkills: ['Office Cleaning', 'Floor Mopping'],
    workType: 'half_day' as const,
    payMin: 8000,
    payMax: 10000,
    payPeriod: 'per_month' as const,
    lat: 19.017600,
    lng: 72.856100,
    locationText: 'Worli, Mumbai',
    slots: 2,
  },
  // Employer 4: City Link Transport
  {
    employerIdx: 4,
    title: 'Heavy Vehicle Driver',
    description: 'Drive cargo trucks for inter-city delivery. Must have valid HMV license.',
    categoryName: 'Driving',
    requiredSkills: ['Heavy Vehicle Driving', 'Route Planning'],
    workType: 'full_day' as const,
    payMin: 18000,
    payMax: 25000,
    payPeriod: 'per_month' as const,
    lat: 19.109700,
    lng: 72.882200,
    locationText: 'Sion, Mumbai',
    slots: 2,
  },
  {
    employerIdx: 4,
    title: 'Auto Rickshaw Driver',
    description: 'Drive company auto for last-mile delivery service.',
    categoryName: 'Driving',
    requiredSkills: ['Auto Driving', 'Navigation'],
    workType: 'full_day' as const,
    payMin: 500,
    payMax: 700,
    payPeriod: 'per_day' as const,
    lat: 19.109700,
    lng: 72.882200,
    locationText: 'Sion, Mumbai',
    slots: 4,
  },
  {
    employerIdx: 4,
    title: 'Delivery Rider - Hourly',
    description: 'On-demand parcel delivery within Mumbai. Flexible hours.',
    categoryName: 'Delivery',
    requiredSkills: ['Two-Wheeler Driving', 'Parcel Handling'],
    workType: 'hourly' as const,
    payMin: 80,
    payMax: 120,
    payPeriod: 'per_hour' as const,
    lat: 19.109700,
    lng: 72.882200,
    locationText: 'Sion, Mumbai',
    slots: 6,
  },
];

async function seed() {
  // ---- 1. Seed categories ----
  console.log('Seeding categories...');
  for (const cat of SEED_CATEGORIES) {
    await db.insert(categories).values({
      nameEn: cat.nameEn,
      nameHi: cat.nameHi,
      icon: cat.icon,
    }).onConflictDoNothing();
  }
  console.log(`Seeded ${SEED_CATEGORIES.length} categories`);

  // Fetch all categories to get their IDs
  const allCategories = await db.select().from(categories);
  const categoryMap = new Map(allCategories.map((c) => [c.nameEn, c.id]));

  // ---- 2. Seed employers ----
  console.log('Seeding dummy employers...');
  const employerProfileIds: string[] = [];

  for (const emp of DUMMY_EMPLOYERS) {
    // Create user
    const [user] = await db
      .insert(users)
      .values({
        phone: emp.phone,
        role: 'employer',
        isOnboarded: true,
      })
      .onConflictDoNothing()
      .returning();

    // If user already existed, fetch them
    let userId: string;
    if (user) {
      userId = user.id;
    } else {
      const [existing] = await db
        .select()
        .from(users)
        .where(eq(users.phone, emp.phone));
      userId = existing.id;
    }

    // Create employer profile (upsert on userId)
    const [profile] = await db
      .insert(employerProfiles)
      .values({
        userId,
        businessName: emp.businessName,
        contactPerson: emp.contactPerson,
        businessType: emp.businessType,
        locationLat: toStoredCoord(emp.lat),
        locationLng: toStoredCoord(emp.lng),
        locationText: emp.locationText,
      })
      .onConflictDoNothing()
      .returning();

    if (profile) {
      employerProfileIds.push(profile.id);
    } else {
      // Already exists — fetch
      const [existing] = await db
        .select()
        .from(employerProfiles)
        .where(eq(employerProfiles.userId, userId));
      employerProfileIds.push(existing.id);
    }
  }
  console.log(`Seeded ${DUMMY_EMPLOYERS.length} employers with profiles`);

  // ---- 3. Seed job listings ----
  console.log('Seeding dummy job listings...');
  let jobCount = 0;

  for (const job of DUMMY_JOBS) {
    const employerProfileId = employerProfileIds[job.employerIdx];
    const categoryId = categoryMap.get(job.categoryName);

    await db
      .insert(jobListings)
      .values({
        employerId: employerProfileId,
        title: job.title,
        description: job.description,
        categoryId: categoryId ?? null,
        requiredSkills: job.requiredSkills,
        workType: job.workType,
        payMin: job.payMin,
        payMax: job.payMax,
        payPeriod: job.payPeriod,
        locationLat: toStoredCoord(job.lat),
        locationLng: toStoredCoord(job.lng),
        locationText: job.locationText,
        slots: job.slots,
        isActive: true,
      });
    jobCount++;
  }
  console.log(`Seeded ${jobCount} job listings`);

  // ---- 4. Seed workers ----
  console.log('Seeding dummy workers...');
  let workerCount = 0;

  for (const w of DUMMY_WORKERS) {
    // Create user
    const [user] = await db
      .insert(users)
      .values({
        phone: w.phone,
        role: 'worker',
        isOnboarded: true,
      })
      .onConflictDoNothing()
      .returning();

    let userId: string;
    if (user) {
      userId = user.id;
    } else {
      const [existing] = await db
        .select()
        .from(users)
        .where(eq(users.phone, w.phone));
      userId = existing.id;
    }

    // Resolve category IDs for this worker
    const workerCategoryIds = w.categoryNames
      .map((name) => categoryMap.get(name))
      .filter((id): id is string => !!id);

    await db
      .insert(workerProfiles)
      .values({
        userId,
        name: w.name,
        skills: w.skills,
        categoryIds: workerCategoryIds,
        experienceYears: w.experienceYears,
        preferredWorkType: w.preferredWorkType,
        bio: w.bio,
        locationLat: toStoredCoord(w.lat),
        locationLng: toStoredCoord(w.lng),
        locationText: w.locationText,
        isAvailable: true,
      })
      .onConflictDoNothing();

    workerCount++;
  }
  console.log(`Seeded ${workerCount} workers with profiles`);

  // ---- Summary ----
  console.log('\n--- Seed Summary ---');
  console.log(`Categories: ${SEED_CATEGORIES.length}`);
  console.log(`Employers:  ${DUMMY_EMPLOYERS.length}`);
  console.log(`Jobs:       ${jobCount}`);
  console.log(`Workers:    ${workerCount}`);
  console.log('Seed completed successfully!');

  await pool.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
