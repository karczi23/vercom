import { loadConfig } from '../common/config.js';
import { logger } from '../common/logger.js';

const config = loadConfig();
logger.info(`Worker started for ${config.emailLabsApiBaseUrl}`);
