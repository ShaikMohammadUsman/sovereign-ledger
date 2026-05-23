import { createApp } from './app';
import { env } from './config/env';
import logger from './utils/logger';

const app = createApp();

app.listen(env.port, () => {
  logger.info(
    `[SOVEREIGN CORE] Running on port ${env.port} (${env.nodeEnv}) — ${env.isVercel ? 'vercel' : 'standalone'}`
  );
});
