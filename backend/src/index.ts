/**
 * Vercel / serverless entry — exports Express app without listening.
 */
import { createApp } from './app';
import { prisma } from './prisma';

const app = createApp();

export { prisma };
export default app;
