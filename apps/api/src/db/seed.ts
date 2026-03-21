import dotenv from 'dotenv';
import { resolve } from 'path';
dotenv.config({ path: resolve(process.cwd(), '.env') });
dotenv.config({ path: resolve(process.cwd(), '../../.env') });

import { db, pool } from '../config/db';
import { categories } from './schema';
import { SEED_CATEGORIES } from '@tfe/shared';

async function seed() {
  console.log('Seeding categories...');

  for (const cat of SEED_CATEGORIES) {
    await db.insert(categories).values({
      nameEn: cat.nameEn,
      nameHi: cat.nameHi,
      icon: cat.icon,
    }).onConflictDoNothing();
  }

  console.log(`Seeded ${SEED_CATEGORIES.length} categories`);
  await pool.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
