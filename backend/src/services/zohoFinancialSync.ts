import { prisma } from '../prisma';
import logger from '../utils/logger';

type ZohoPo = {
  purchaseorder_id?: string;
  status?: string;
  billed_status?: string;
};

type ZohoBill = {
  bill_id?: string;
  status?: string;
  balance?: number;
  total?: number;
  paid_status?: string;
  reference_number?: string;
  purchaseorder_ids?: string[];
};

async function zohoGet(
  organizationId: string,
  path: string,
  extraQuery?: Record<string, string>
): Promise<Record<string, unknown>> {
  const { getValidAccessToken } = await import('./zohoBooksService');
  const { accessToken, org } = await getValidAccessToken(organizationId);
  const apiDomain = org.zohoApiDomain || 'www.zohoapis.com';
  const booksOrgId = org.zohoBooksOrganizationId;
  if (!booksOrgId) throw new Error('Zoho Books organization not configured');

  const url = new URL(`https://${apiDomain}/books/v3${path}`);
  url.searchParams.set('organization_id', booksOrgId);
  if (extraQuery) {
    Object.entries(extraQuery).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Zoho-oauthtoken ${accessToken}` },
  });
  const data = (await res.json()) as Record<string, unknown>;
  if (data.code !== undefined && data.code !== 0) {
    throw new Error(String(data.message || `Zoho API error (${data.code})`));
  }
  return data;
}

function mapPaymentStatus(bill?: ZohoBill, po?: ZohoPo): string {
  if (!bill) return po?.status === 'billed' ? 'BILLED' : 'PENDING';
  const paid = (bill.paid_status || '').toLowerCase();
  if (paid === 'paid' || paid === 'fully_paid') return 'PAID';
  if (paid === 'partially_paid' || (bill.balance !== undefined && bill.total && bill.balance < bill.total)) {
    return 'PARTIALLY_PAID';
  }
  const status = (bill.status || '').toLowerCase();
  if (status === 'paid') return 'PAID';
  if (status === 'overdue') return 'OVERDUE';
  if (status === 'open' || status === 'draft') return 'UNPAID';
  return 'UNPAID';
}

export async function syncPurchaseOrderFinancialsFromZoho(
  organizationId: string,
  poId: string
): Promise<{
  zohoBillId?: string | null;
  zohoBillStatus?: string | null;
  zohoPaymentStatus?: string | null;
  zohoBillAmount?: number | null;
}> {
  const po = await (prisma as any).purchaseOrder.findFirst({
    where: { id: poId, request: { organizationId } },
    include: { request: true },
  });
  if (!po) throw new Error('Purchase order not found');

  let zohoPo: ZohoPo | undefined;
  if (po.zohoPurchaseOrderId) {
    const poData = await zohoGet(
      organizationId,
      `/purchaseorders/${po.zohoPurchaseOrderId}`
    );
    zohoPo = poData.purchaseorder as ZohoPo;
  }

  let matchedBill: ZohoBill | undefined;
  const billsData = await zohoGet(organizationId, '/bills', {
    reference_number: po.poNumber,
  });
  const bills = (billsData.bills as ZohoBill[]) || [];
  if (bills.length > 0) {
    matchedBill = bills[0];
  } else if (po.zohoPurchaseOrderId) {
    const allBills = await zohoGet(organizationId, '/bills');
    const all = (allBills.bills as ZohoBill[]) || [];
    matchedBill = all.find(
      (b) =>
        b.reference_number === po.poNumber ||
        b.purchaseorder_ids?.includes(po.zohoPurchaseOrderId)
    );
  }

  const zohoBillStatus = matchedBill?.status || zohoPo?.billed_status || zohoPo?.status || null;
  const zohoPaymentStatus = mapPaymentStatus(matchedBill, zohoPo);
  const zohoBillAmount = matchedBill?.total ?? po.amount;
  const zohoBillId = matchedBill?.bill_id || po.zohoBillId || null;

  await (prisma as any).purchaseOrder.update({
    where: { id: poId },
    data: {
      zohoBillId,
      zohoBillStatus,
      zohoPaymentStatus,
      zohoBillAmount,
      zohoBillLastSyncedAt: new Date(),
      zohoSyncError: null,
    },
  });

  logger.info(`[Zoho] Financial sync PO ${po.poNumber}: bill=${zohoBillId} payment=${zohoPaymentStatus}`);
  return { zohoBillId, zohoBillStatus, zohoPaymentStatus, zohoBillAmount };
}

export async function syncAllPurchaseOrderFinancials(organizationId: string) {
  const pos = await (prisma as any).purchaseOrder.findMany({
    where: {
      zohoPurchaseOrderId: { not: null },
      request: { organizationId },
    },
  });

  const results: Array<{ poId: string; ok: boolean; error?: string }> = [];
  for (const po of pos) {
    try {
      await syncPurchaseOrderFinancialsFromZoho(organizationId, po.id);
      results.push({ poId: po.id, ok: true });
    } catch (e: any) {
      results.push({ poId: po.id, ok: false, error: e.message });
      await (prisma as any).purchaseOrder.update({
        where: { id: po.id },
        data: { zohoSyncError: e.message?.slice(0, 500) },
      });
    }
  }
  return {
    synced: results.filter((r) => r.ok).length,
    total: pos.length,
    results,
  };
}

/** Handle Zoho Books webhook payloads (bill / payment / PO events). */
export async function processZohoWebhook(
  organizationId: string,
  body: Record<string, unknown>
): Promise<{ handled: boolean; message: string }> {
  const module =
    (body.module as string) ||
    (body.entity_type as string) ||
    ((body.JSONString as string) ? JSON.parse(body.JSONString as string).module : null);

  let payload = body;
  if (typeof body.JSONString === 'string') {
    try {
      payload = JSON.parse(body.JSONString);
    } catch {
      payload = body;
    }
  }

  const entityId =
    (payload.entity_id as string) ||
    (payload.bill_id as string) ||
    (payload.purchaseorder_id as string);

  const eventType = (
    (payload.event_type as string) ||
    (body.event_type as string) ||
    ''
  ).toLowerCase();

  logger.info(`[Zoho Webhook] org=${organizationId} module=${module} event=${eventType} entity=${entityId}`);

  const isBillEvent =
    module === 'bill' ||
    eventType.includes('bill') ||
    Boolean(payload.bill);
  const isPoEvent =
    module === 'purchaseorder' ||
    eventType.includes('purchaseorder') ||
    Boolean(payload.purchaseorder);
  const isPaymentEvent =
    module === 'vendor_payment' ||
    eventType.includes('payment') ||
    eventType.includes('vendorpayment');

  if (!isBillEvent && !isPoEvent && !isPaymentEvent) {
    return { handled: false, message: 'Event type not tracked' };
  }

  let po = null as any;

  if (entityId) {
    if (isPoEvent) {
      po = await (prisma as any).purchaseOrder.findFirst({
        where: { zohoPurchaseOrderId: entityId, request: { organizationId } },
      });
    }
    if (!po && isBillEvent) {
      po = await (prisma as any).purchaseOrder.findFirst({
        where: { zohoBillId: entityId, request: { organizationId } },
      });
    }
  }

  const refNumber =
    (payload.reference_number as string) ||
    ((payload.bill as ZohoBill)?.reference_number);

  if (!po && refNumber) {
    po = await (prisma as any).purchaseOrder.findFirst({
      where: { poNumber: refNumber, request: { organizationId } },
    });
  }

  if (!po) {
    const linked = await (prisma as any).purchaseOrder.findMany({
      where: { zohoPurchaseOrderId: { not: null }, request: { organizationId } },
      take: 50,
      orderBy: { date: 'desc' },
    });
    for (const candidate of linked) {
      try {
        await syncPurchaseOrderFinancialsFromZoho(organizationId, candidate.id);
      } catch {
        /* continue */
      }
    }
    return { handled: true, message: 'Refreshed recent linked POs' };
  }

  await syncPurchaseOrderFinancialsFromZoho(organizationId, po.id);
  return { handled: true, message: `Synced PO ${po.poNumber}` };
}
