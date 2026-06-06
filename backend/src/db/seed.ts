import { users } from './schema.js';
import { createDatabase } from './client.js';
import { loadConfig } from '../common/config.js';
import { hashPassword } from '../auth/passwordHash.js';
import { logger } from '../common/logger.js';

const config = loadConfig();
const db = createDatabase(config.databaseUrl);

async function seed() {
  await db.insert(users).values([
    { username: 'admin', passwordHash: await hashPassword('admin-password'), role: 'admin' },
    { username: 'operator-a', passwordHash: await hashPassword('operator-a-password'), role: 'operator' },
    { username: 'operator-b', passwordHash: await hashPassword('operator-b-password'), role: 'operator' }
  ]).onConflictDoNothing();
  logger.info('Seeded admin and operators');
}

await seed();
