import express from 'express';
import helmet from 'helmet';
import { prisma } from './prisma';
import { env, validateProductionEnv } from './config/env';
import { corsMiddleware } from './middleware/cors';
import { login, register, verifyCode } from './controllers/authController';
import {
  createRequest,
  getRequests,
  getRequestDetails,
  updateRequestStatus,
  updateRequest,
  deleteRequest,
} from './controllers/requestController';
import { generatePO, getPOs, getPODetails } from './controllers/poController';
import { getAIInsights, handleAIChat, getChatHistory } from './controllers/aiController';
import {
  callback as zohoCallback,
  connect as zohoConnect,
  disconnect as zohoDisconnect,
  getStatus as zohoGetStatus,
  handleWebhook as zohoHandleWebhook,
  regenerateWebhookSecret as zohoRegenerateWebhookSecret,
  syncAllBills as zohoSyncAllBills,
  syncAllVendors as zohoSyncAllVendors,
  importVendors as zohoImportVendors,
  syncPoFinancials as zohoSyncPoFinancials,
  syncPurchaseOrderById as zohoSyncPurchaseOrderById,
  retryFailedPurchaseOrders as zohoRetryFailedPurchaseOrders,
  syncVendorById as zohoSyncVendorById,
} from './controllers/zohoController';
import { syncVendorToZohoIfConnected } from './utils/zohoSync';
import { authenticateToken, authorizeRole } from './middleware/auth';
import { apiLimiter, authLimiter } from './middleware/rateLimiter';
import logger from './utils/logger';

if (env.isProduction) {
  validateProductionEnv();
}

export function createApp() {
  const app = express();

  app.set('trust proxy', 1);

  app.use(corsMiddleware);
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: env.isProduction ? undefined : false,
    })
  );
  app.use(express.json({ limit: '1mb' }));

  app.use('/api', apiLimiter);

  app.get('/health', async (_req, res) => {
    try {
      await prisma.$runCommandRaw({ ping: 1 });
      res.json({
        status: 'ok',
        environment: env.nodeEnv,
        database: 'connected',
        timestamp: new Date().toISOString(),
      });
    } catch {
      res.status(503).json({
        status: 'degraded',
        environment: env.nodeEnv,
        database: 'disconnected',
        timestamp: new Date().toISOString(),
      });
    }
  });

  app.post('/api/auth/register', authLimiter, register);
  app.post('/api/auth/login', authLimiter, login);
  app.post('/api/auth/verify', authLimiter, verifyCode);

  app.post('/api/requests', authenticateToken, createRequest);
  app.get('/api/requests', authenticateToken, getRequests);
  app.get('/api/requests/:id', authenticateToken, getRequestDetails);
  app.patch(
    '/api/requests/:id/status',
    authenticateToken,
    authorizeRole(['ADMIN', 'MANAGER', 'FINANCE']),
    updateRequestStatus
  );
  app.put('/api/requests/:id', authenticateToken, updateRequest);
  app.delete('/api/requests/:id', authenticateToken, deleteRequest);

  app.post(
    '/api/purchase-orders/generate',
    authenticateToken,
    authorizeRole(['FINANCE', 'ADMIN', 'FINANCE_MANAGER']),
    generatePO
  );
  app.get('/api/purchase-orders', authenticateToken, getPOs);
  app.get('/api/purchase-orders/:id', authenticateToken, getPODetails);

  app.get('/api/zoho/callback', zohoCallback);
  app.post('/api/zoho/webhook/:organizationId', zohoHandleWebhook);
  app.get('/api/zoho/status', authenticateToken, zohoGetStatus);
  app.get('/api/zoho/connect', authenticateToken, authorizeRole(['ADMIN', 'FINANCE']), zohoConnect);
  app.post(
    '/api/zoho/disconnect',
    authenticateToken,
    authorizeRole(['ADMIN', 'FINANCE']),
    zohoDisconnect
  );
  app.post(
    '/api/zoho/webhook/regenerate-secret',
    authenticateToken,
    authorizeRole(['ADMIN', 'FINANCE']),
    zohoRegenerateWebhookSecret
  );
  app.post(
    '/api/zoho/sync/vendors',
    authenticateToken,
    authorizeRole(['ADMIN', 'FINANCE']),
    zohoSyncAllVendors
  );
  app.post(
    '/api/zoho/import/vendors',
    authenticateToken,
    authorizeRole(['ADMIN', 'FINANCE']),
    zohoImportVendors
  );
  app.post(
    '/api/zoho/sync/vendors/:id',
    authenticateToken,
    authorizeRole(['ADMIN', 'FINANCE']),
    zohoSyncVendorById
  );
  app.post(
    '/api/zoho/sync/purchase-orders/retry-failed',
    authenticateToken,
    authorizeRole(['ADMIN', 'FINANCE']),
    zohoRetryFailedPurchaseOrders
  );
  app.post(
    '/api/zoho/sync/purchase-orders/:id/financials',
    authenticateToken,
    authorizeRole(['ADMIN', 'FINANCE']),
    zohoSyncPoFinancials
  );
  app.post(
    '/api/zoho/sync/purchase-orders/:id',
    authenticateToken,
    authorizeRole(['ADMIN', 'FINANCE']),
    zohoSyncPurchaseOrderById
  );
  app.post(
    '/api/zoho/sync/bills',
    authenticateToken,
    authorizeRole(['ADMIN', 'FINANCE']),
    zohoSyncAllBills
  );

  app.get('/api/ai/insights', authenticateToken, getAIInsights);
  app.post('/api/ai/chat', authenticateToken, handleAIChat);
  app.get('/api/ai/chat/history', authenticateToken, getChatHistory);

  app.get('/api/vendors', authenticateToken, async (req: any, res) => {
    const organizationId = req.user.organizationId;
    const vendors = await prisma.vendor.findMany({
      where: { organizationId },
      include: {
        _count: { select: { purchaseOrders: true } },
        purchaseOrders: { select: { amount: true } },
      },
    });

    res.json(
      vendors.map((v) => ({
        ...v,
        annSpend: v.purchaseOrders.reduce((sum, po) => sum + po.amount, 0),
        contracts: v._count.purchaseOrders,
      }))
    );
  });

  app.get('/api/vendors/:id', authenticateToken, async (req: any, res) => {
    const organizationId = req.user.organizationId;
    const { id } = req.params;
    try {
      const vendor = await prisma.vendor.findFirst({
        where: { id, organizationId },
        include: {
          purchaseOrders: {
            include: { request: true },
            orderBy: { date: 'desc' },
          },
        },
      });
      if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
      const annSpend = vendor.purchaseOrders.reduce((sum, po) => sum + po.amount, 0);
      res.json({ ...vendor, annSpend, contracts: vendor.purchaseOrders.length });
    } catch (error) {
      logger.error(`Error fetching vendor: ${error}`);
      res.status(500).json({ message: 'Error fetching vendor' });
    }
  });

  app.post('/api/vendors', authenticateToken, async (req: any, res) => {
    const { name, contact, email, category, paymentTerms, phone, location } = req.body;
    const organizationId = req.user.organizationId;
    try {
      const vendor = await prisma.vendor.create({
        data: {
          organizationId,
          name,
          contact,
          email,
          phone,
          location,
          category,
          paymentTerms,
          status: 'ACTIVE',
        },
      });
      syncVendorToZohoIfConnected(organizationId, vendor.id).catch(() => {});
      res.status(201).json(vendor);
    } catch (error) {
      logger.error(`Error creating vendor: ${error}`);
      res.status(500).json({ message: 'Error creating vendor' });
    }
  });

  app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (err.message?.includes('CORS')) {
      return res.status(403).json({ message: 'Origin not allowed' });
    }
    logger.error(`${err.message} - ${req.method} ${req.originalUrl}`);
    res.status(500).json({
      message: env.isProduction ? 'Internal server error' : err.message || 'Internal server error',
    });
  });

  return app;
}
