import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { prisma } from './prisma';
import { login, register, verifyCode } from './controllers/authController';
import { createRequest, getRequests, getRequestDetails, updateRequestStatus, updateRequest, deleteRequest } from './controllers/requestController';
import { generatePO, getPOs, getPODetails } from './controllers/poController';
import { getAIInsights, handleAIChat, getChatHistory } from './controllers/aiController';
import { authenticateToken, authorizeRole } from './middleware/auth';
import { apiLimiter, authLimiter } from './middleware/rateLimiter';
import logger from './utils/logger';

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(helmet());
app.use(express.json());

// Global Rate Limiter
app.use('/api', apiLimiter);

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth Routes
app.post('/api/auth/register', authLimiter, register);
app.post('/api/auth/login', authLimiter, login);
app.post('/api/auth/verify', authLimiter, verifyCode);

// Request Routes
app.post('/api/requests', authenticateToken, createRequest);
app.get('/api/requests', authenticateToken, getRequests);
app.get('/api/requests/:id', authenticateToken, getRequestDetails);
app.patch('/api/requests/:id/status', authenticateToken, authorizeRole(['ADMIN', 'MANAGER', 'FINANCE']), updateRequestStatus);
app.put('/api/requests/:id', authenticateToken, updateRequest);
app.delete('/api/requests/:id', authenticateToken, deleteRequest);

// PO Routes
app.post('/api/purchase-orders/generate', authenticateToken, authorizeRole(['FINANCE', 'ADMIN']), generatePO);
app.get('/api/purchase-orders', authenticateToken, getPOs);
app.get('/api/purchase-orders/:id', authenticateToken, getPODetails);

// AI Insight Routes
app.get('/api/ai/insights', authenticateToken, getAIInsights);
app.post('/api/ai/chat', authenticateToken, handleAIChat);
app.get('/api/ai/chat/history', authenticateToken, getChatHistory);

// Vendor Routes (Enhanced)
app.get('/api/vendors', authenticateToken, async (req: any, res) => {
  const organizationId = req.user.organizationId;
  const vendors = await prisma.vendor.findMany({
    where: { organizationId },
    include: {
      _count: {
        select: { purchaseOrders: true }
      },
      purchaseOrders: {
        select: { amount: true }
      }
    }
  });
  
  // Calculate total annual spend for each vendor
  const vendorsWithSpend = vendors.map(v => ({
    ...v,
    annSpend: v.purchaseOrders.reduce((sum, po) => sum + po.amount, 0),
    contracts: v._count.purchaseOrders
  }));

  res.json(vendorsWithSpend);
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
        status: 'ACTIVE'
      }
    });
    res.status(201).json(vendor);
  } catch (error) {
    logger.error(`Error creating vendor: ${error}`);
    res.status(500).json({ message: 'Error creating vendor' });
  }
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(`${err.message} - ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  res.status(500).json({ message: 'Internal Sovereign Engine Protocol Error' });
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    logger.info(`[SOVEREIGN CORE] Core active on port ${PORT} - Protocol: ENCRYPTED`);
  });
}

export { prisma };
export default app;
