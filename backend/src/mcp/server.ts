import { logger } from '../common/logger.js';
export { createContactTools } from './contactTools.js';
export { createCampaignTools } from './campaignTools.js';
export { createCampaignEditorTools } from './campaignEditorTools.js';
export { createSendTools } from './sendTools.js';

logger.info('MCP server started');

setInterval(() => {
  logger.info('MCP server heartbeat');
}, 60_000);
