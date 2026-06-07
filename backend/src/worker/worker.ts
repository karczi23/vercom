import { loadConfig } from '../common/config.js';
import { logger } from '../common/logger.js';
import { CampaignRecipientRepository } from '../campaigns/campaignRecipientRepository.js';
import { CampaignRepository } from '../campaigns/campaignRepository.js';
import { createDatabase } from '../db/client.js';
import { EmailLabsClient } from '../email-labs/emailLabsClient.js';
import { SendAttemptRepository } from './sendAttemptRepository.js';
import { SendJobRepository } from './sendJobRepository.js';
import { SendWorkerService } from './sendWorkerService.js';

const config = loadConfig();
logger.info(`Worker started for ${config.emailLabsApiBaseUrl}`);

const db = createDatabase(config.databaseUrl);
const service = new SendWorkerService(
  new EmailLabsClient({
    baseUrl: config.emailLabsApiBaseUrl,
    applicationKey: config.emailLabsApplicationKey,
    authorization: config.emailLabsAuthorization
  }),
  {
    smtpAccount: config.emailLabsSmtpAccount,
    from: config.emailLabsFromEmail
  },
  new CampaignRepository(db),
  new CampaignRecipientRepository(db),
  new SendJobRepository(db),
  new SendAttemptRepository(db)
);

async function tick(): Promise<void> {
  try {
    const processed = await service.processNext(`worker-${process.pid}`);
    if (!processed) {
      logger.info('Worker heartbeat');
    }
  } catch (error) {
    logger.error('Worker tick failed', error);
  }
}

setInterval(() => {
  void tick();
}, 5_000);

void tick();
