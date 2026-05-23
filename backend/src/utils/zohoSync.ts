import { prisma } from '../prisma';
import {
  createZohoPurchaseOrder,
  createZohoVendorContact,
  getZohoConnectionStatus,
  isZohoConfigured,
} from '../services/zohoBooksService';
import {
  syncAllPurchaseOrderFinancials,
  syncPurchaseOrderFinancialsFromZoho,
} from '../services/zohoFinancialSync';
import logger from './logger';

/** Sync vendor to Zoho Books if org is connected. Never throws — logs errors only. */
export async function syncVendorToZohoIfConnected(
  organizationId: string,
  vendorId: string
): Promise<void> {
  try {
    if (!isZohoConfigured()) return;

    const status = await getZohoConnectionStatus(organizationId);
    if (!status.connected) return;

    const vendor = await (prisma as any).vendor.findFirst({
      where: { id: vendorId, organizationId },
    });
    if (!vendor || vendor.zohoContactId) return;

    await createZohoVendorContact(organizationId, vendor);
    logger.info(`[Zoho] Synced vendor ${vendorId} to Books`);
  } catch (err: any) {
    logger.error(`[Zoho] Vendor sync failed for ${vendorId}: ${err.message}`);
    await (prisma as any).vendor.update({
      where: { id: vendorId },
      data: { zohoSyncError: err.message?.slice(0, 500) },
    }).catch(() => {});
  }
}

/** Sync purchase order to Zoho Books if org is connected. */
export async function syncPurchaseOrderToZohoIfConnected(
  organizationId: string,
  poId: string,
  requestTitle?: string
): Promise<{ synced: boolean; zohoPurchaseOrderId?: string; error?: string }> {
  try {
    if (!isZohoConfigured()) {
      return { synced: false, error: 'Zoho credentials not configured on server' };
    }

    const status = await getZohoConnectionStatus(organizationId);
    if (!status.connected) {
      return { synced: false, error: 'Zoho Books not connected for this organization' };
    }

    const po = await (prisma as any).purchaseOrder.findUnique({
      where: { id: poId },
      include: { vendor: true, request: true },
    });

    if (!po) return { synced: false, error: 'PO not found' };
    if (po.zohoPurchaseOrderId) {
      return { synced: true, zohoPurchaseOrderId: po.zohoPurchaseOrderId };
    }

    const zohoPoId = await createZohoPurchaseOrder(
      organizationId,
      {
        id: po.id,
        poNumber: po.poNumber,
        amount: po.amount,
        currency: po.currency,
        vendor: po.vendor,
      },
      requestTitle || po.request?.title
    );

    logger.info(`[Zoho] Synced PO ${po.poNumber} → Books ${zohoPoId}`);
    return { synced: true, zohoPurchaseOrderId: zohoPoId };
  } catch (err: any) {
    logger.error(`[Zoho] PO sync failed for ${poId}: ${err.message}`);
    await (prisma as any).purchaseOrder.update({
      where: { id: poId },
      data: { zohoSyncError: err.message?.slice(0, 500) },
    }).catch(() => {});
    return { synced: false, error: err.message };
  }
}

/** Force re-sync vendor to Zoho (creates contact if missing). */
export async function retryVendorZohoSync(
  organizationId: string,
  vendorId: string
): Promise<{ synced: boolean; zohoContactId?: string; error?: string }> {
  try {
    if (!isZohoConfigured()) {
      return { synced: false, error: 'Zoho credentials not configured on server' };
    }
    const status = await getZohoConnectionStatus(organizationId);
    if (!status.connected) {
      return { synced: false, error: 'Zoho Books not connected' };
    }

    const vendor = await (prisma as any).vendor.findFirst({
      where: { id: vendorId, organizationId },
    });
    if (!vendor) return { synced: false, error: 'Vendor not found' };

    if (vendor.zohoContactId) {
      await (prisma as any).vendor.update({
        where: { id: vendorId },
        data: { zohoLastSyncedAt: new Date(), zohoSyncError: null },
      });
      return { synced: true, zohoContactId: vendor.zohoContactId };
    }

    const contactId = await createZohoVendorContact(organizationId, vendor);
    return { synced: true, zohoContactId: contactId };
  } catch (err: any) {
    await (prisma as any).vendor.update({
      where: { id: vendorId },
      data: { zohoSyncError: err.message?.slice(0, 500) },
    }).catch(() => {});
    return { synced: false, error: err.message };
  }
}

/** Re-sync PO to Zoho and refresh bill/payment status from Books. */
export async function retryPurchaseOrderZohoSync(
  organizationId: string,
  poId: string,
  requestTitle?: string
): Promise<{
  synced: boolean;
  zohoPurchaseOrderId?: string;
  zohoPaymentStatus?: string;
  error?: string;
}> {
  const poSync = await syncPurchaseOrderToZohoIfConnected(organizationId, poId, requestTitle);
  if (!poSync.synced && poSync.error && !poSync.error.includes('already')) {
    return { synced: false, error: poSync.error };
  }

  try {
    const financials = await syncPurchaseOrderFinancialsFromZoho(organizationId, poId);
    const po = await (prisma as any).purchaseOrder.findUnique({ where: { id: poId } });
    return {
      synced: true,
      zohoPurchaseOrderId: po?.zohoPurchaseOrderId,
      zohoPaymentStatus: financials.zohoPaymentStatus || undefined,
    };
  } catch (err: any) {
    return {
      synced: Boolean(poSync.synced),
      zohoPurchaseOrderId: poSync.zohoPurchaseOrderId,
      error: err.message,
    };
  }
}

export { syncAllPurchaseOrderFinancials, syncPurchaseOrderFinancialsFromZoho };
