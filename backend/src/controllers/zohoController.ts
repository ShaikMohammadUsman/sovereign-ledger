import crypto from 'crypto';
import { Response } from 'express';
import {
  completeOAuthConnection,
  disconnectZoho,
  getAuthorizationUrl,
  getZohoConnectionStatus,
  importVendorsFromZoho,
  isZohoConfigured,
  mapZohoOAuthError,
  parseOAuthState,
} from '../services/zohoBooksService';
import {
  processZohoWebhook,
  syncPurchaseOrderFinancialsFromZoho,
} from '../services/zohoFinancialSync';
import {
  retryPurchaseOrderZohoSync,
  retryVendorZohoSync,
  syncAllPurchaseOrderFinancials,
  syncVendorToZohoIfConnected,
} from '../utils/zohoSync';
import { getZohoConfig } from '../config/zoho';
import { prisma } from '../prisma';
import logger from '../utils/logger';

/** GET /api/zoho/status */
export const getStatus = async (req: any, res: Response) => {
  try {
    const organizationId = req.user.organizationId;
    const org = await (prisma as any).organization.findUnique({
      where: { id: organizationId },
      select: { zohoRefreshToken: true, zohoWebhookSecret: true },
    });
    if (org?.zohoRefreshToken && !org.zohoWebhookSecret) {
      const secret = crypto.randomBytes(24).toString('hex');
      await (prisma as any).organization.update({
        where: { id: organizationId },
        data: { zohoWebhookSecret: secret },
      });
    }
    const status = await getZohoConnectionStatus(organizationId);
    res.json(status);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load Zoho status' });
  }
};

/** GET /api/zoho/connect */
export const connect = async (req: any, res: Response) => {
  if (!isZohoConfigured()) {
    return res.status(503).json({
      message:
        'Zoho Books is not configured on the server. Add ZOHO_CLIENT_ID and ZOHO_CLIENT_SECRET to backend/.env',
    });
  }

  try {
    const organizationId = req.user.organizationId;
    const returnUrl =
      (typeof req.query.returnUrl === 'string' && req.query.returnUrl) ||
      (req.headers.origin as string) ||
      undefined;
    const url = getAuthorizationUrl(organizationId, returnUrl);
    res.json({ url });
  } catch (error) {
    logger.error(`[Zoho] Connect error: ${error}`);
    res.status(500).json({ message: 'Failed to start Zoho connection' });
  }
};

/** GET /api/zoho/callback */
export const callback = async (req: any, res: Response) => {
  const { code, state, error: oauthError, location, 'accounts-server': accountsServer } =
    req.query;
  const cfg = getZohoConfig();

  const parsedState = state ? parseOAuthState(String(state)) : null;
  const frontendBase = parsedState?.frontendReturnUrl || cfg.frontendUrl;
  const settingsPath = `${frontendBase.replace(/\/$/, '')}/settings?zoho=`;

  if (oauthError) {
    const msg = mapZohoOAuthError(String(oauthError));
    return res.redirect(`${settingsPath}error&reason=${encodeURIComponent(msg)}`);
  }

  if (!code || !state) {
    return res.redirect(
      `${settingsPath}error&reason=${encodeURIComponent('Zoho did not return an authorization code. Try Connect again.')}`
    );
  }

  if (!parsedState) {
    return res.redirect(
      `${settingsPath}error&reason=${encodeURIComponent('Session expired. Click Connect with Zoho again.')}`
    );
  }

  try {
    await completeOAuthConnection(parsedState.organizationId, String(code), {
      location: location ? String(location) : null,
      accountsServer: accountsServer ? String(accountsServer) : null,
    });
    res.redirect(`${settingsPath}connected`);
  } catch (err: any) {
    logger.error(`[Zoho] Callback error: ${err.message}`);
    const friendly = mapZohoOAuthError(err.message || 'connection_failed');
    res.redirect(`${settingsPath}error&reason=${encodeURIComponent(friendly)}`);
  }
};

/** POST /api/zoho/disconnect */
export const disconnect = async (req: any, res: Response) => {
  try {
    await disconnectZoho(req.user.organizationId);
    res.json({ message: 'Zoho Books disconnected' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to disconnect Zoho' });
  }
};

/** POST /api/zoho/sync/vendors */
export const syncAllVendors = async (req: any, res: Response) => {
  const organizationId = req.user.organizationId;
  const allVendors = await (prisma as any).vendor.findMany({
    where: { organizationId },
  });
  const vendors = allVendors.filter((v: { zohoContactId?: string | null }) => !v.zohoContactId);

  const results: Array<{ vendorId: string; ok: boolean; error?: string }> = [];

  for (const v of vendors) {
    try {
      await syncVendorToZohoIfConnected(organizationId, v.id);
      const updated = await (prisma as any).vendor.findUnique({ where: { id: v.id } });
      results.push({
        vendorId: v.id,
        ok: Boolean(updated?.zohoContactId),
        error: updated?.zohoSyncError || undefined,
      });
    } catch (e: any) {
      results.push({ vendorId: v.id, ok: false, error: e.message });
    }
  }

  res.json({ synced: results.filter((r) => r.ok).length, total: vendors.length, results });
};

/** POST /api/zoho/sync/purchase-orders/retry-failed */
export const retryFailedPurchaseOrders = async (req: any, res: Response) => {
  const organizationId = req.user.organizationId;
  const allPos = await (prisma as any).purchaseOrder.findMany({
    where: { request: { organizationId } },
    include: { request: true, vendor: true },
  });
  const pos = allPos.filter((po: { zohoPurchaseOrderId?: string | null }) => !po.zohoPurchaseOrderId);

  const results: Array<{ poId: string; poNumber: string; ok: boolean; error?: string }> = [];

  for (const po of pos) {
    const result = await retryPurchaseOrderZohoSync(
      organizationId,
      po.id,
      po.request?.title
    );
    results.push({
      poId: po.id,
      poNumber: po.poNumber,
      ok: result.synced,
      error: result.error,
    });
  }

  res.json({
    synced: results.filter((r) => r.ok).length,
    total: pos.length,
    results,
  });
};

/** POST /api/zoho/import/vendors — pull vendors from Zoho Books into the app */
export const importVendors = async (req: any, res: Response) => {
  try {
    const status = await getZohoConnectionStatus(req.user.organizationId);
    if (!status.connected) {
      return res.status(400).json({ message: 'Connect Zoho Books before importing vendors.' });
    }
    const result = await importVendorsFromZoho(req.user.organizationId);
    res.json({
      message: `Imported ${result.created} new vendor(s), linked ${result.updated} existing.`,
      ...result,
    });
  } catch (e: any) {
    logger.error(`[Zoho] Import vendors error: ${e.message}`);
    res.status(400).json({ message: e.message || 'Failed to import vendors from Zoho' });
  }
};

/** POST /api/zoho/sync/vendors/:id */
export const syncVendorById = async (req: any, res: Response) => {
  const result = await retryVendorZohoSync(req.user.organizationId, req.params.id);
  if (!result.synced) return res.status(400).json(result);
  res.json(result);
};

/** POST /api/zoho/sync/purchase-orders/:id */
export const syncPurchaseOrderById = async (req: any, res: Response) => {
  const po = await (prisma as any).purchaseOrder.findFirst({
    where: { id: req.params.id, request: { organizationId: req.user.organizationId } },
    include: { request: true },
  });
  if (!po) return res.status(404).json({ message: 'PO not found' });

  const result = await retryPurchaseOrderZohoSync(
    req.user.organizationId,
    po.id,
    po.request?.title
  );
  if (!result.synced) return res.status(400).json(result);
  res.json(result);
};

/** POST /api/zoho/sync/bills — pull bill & payment status for all linked POs */
export const syncAllBills = async (req: any, res: Response) => {
  try {
    const result = await syncAllPurchaseOrderFinancials(req.user.organizationId);
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
};

/** POST /api/zoho/sync/purchase-orders/:id/financials */
export const syncPoFinancials = async (req: any, res: Response) => {
  try {
    const data = await syncPurchaseOrderFinancialsFromZoho(
      req.user.organizationId,
      req.params.id
    );
    res.json(data);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
};

/** POST /api/zoho/webhook/regenerate-secret */
export const regenerateWebhookSecret = async (req: any, res: Response) => {
  const secret = crypto.randomBytes(24).toString('hex');
  await (prisma as any).organization.update({
    where: { id: req.user.organizationId },
    data: { zohoWebhookSecret: secret },
  });
  const status = await getZohoConnectionStatus(req.user.organizationId);
  res.json({ webhookUrl: status.webhookUrl });
};

/** POST /api/zoho/webhook/:organizationId — Zoho Books callbacks */
export const handleWebhook = async (req: any, res: Response) => {
  const { organizationId } = req.params;
  const token = String(req.query.token || req.headers['x-zoho-webhook-token'] || '');

  const org = await (prisma as any).organization.findUnique({
    where: { id: organizationId },
    select: { zohoWebhookSecret: true, zohoRefreshToken: true },
  });

  if (!org?.zohoRefreshToken) {
    return res.status(404).json({ message: 'Organization not connected to Zoho' });
  }

  const expected = org.zohoWebhookSecret || process.env.ZOHO_WEBHOOK_SECRET;
  if (expected && token !== expected) {
    return res.status(401).json({ message: 'Invalid webhook token' });
  }

  try {
    const result = await processZohoWebhook(organizationId, req.body || {});
    res.status(200).json(result);
  } catch (e: any) {
    logger.error(`[Zoho Webhook] ${e.message}`);
    res.status(500).json({ message: e.message });
  }
};
