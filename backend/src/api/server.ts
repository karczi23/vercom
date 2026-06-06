import { createApp } from './app.js';
import { loadConfig } from '../common/config.js';
import { createDatabase } from '../db/client.js';
import { logger } from '../common/logger.js';

const config = loadConfig();
const db = createDatabase(config.databaseUrl);
const app = createApp({ config, db });

app.listen(config.port, () => {
  logger.info(`Backend listening on port ${config.port}`);
});
