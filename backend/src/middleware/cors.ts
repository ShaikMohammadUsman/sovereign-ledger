import cors from 'cors';
import { env } from '../config/env';

export const corsMiddleware = cors({
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }
    if (env.corsOrigins.includes(origin)) {
      return callback(null, true);
    }
    if (!env.isProduction) {
      return callback(null, true);
    }
    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Zoho-Webhook-Token'],
});
