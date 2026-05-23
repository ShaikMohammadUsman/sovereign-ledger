import crypto from 'crypto';
import { prisma } from '../prisma';
import {
  getZohoConfig,
  getZohoCredentialsForDataCenter,
  getZohoDataCenterFallbackOrder,
  isZohoConfigured,
  resolveZohoDataCenter,
  ZOHO_SCOPES,
  type ZohoDataCenter,
} from '../config/zoho';
import logger from '../utils/logger';

type OrgZohoFields = {
  id: string;
  zohoRefreshToken?: string | null;
  zohoAccessToken?: string | null;
  zohoAccessTokenExpiresAt?: Date | null;
  zohoBooksOrganizationId?: string | null;
  zohoAccountsServer?: string | null;
  zohoApiDomain?: string | null;
  zohoDefaultPurchaseItemId?: string | null;
};

type ZohoContact = {
  contact_id?: string;
  contact_name?: string;
  company_name?: string;
  email?: string;
  phone?: string;
  payment_terms?: number;
  payment_terms_label?: string;
  contact_persons?: Array<{ first_name?: string; last_name?: string; email?: string }>;
};

type ZohoItem = {
  item_id?: string;
  name?: string;
  item_type?: string;
  status?: string;
};

function booksBase(apiDomain: string) {
  return `https://${apiDomain}/books/v3`;
}

function accountsBase(accountsServer: string) {
  return `https://${accountsServer}`;
}

/** Signed OAuth state payload (organizationId + optional frontend return URL) */
export function createOAuthState(organizationId: string, frontendReturnUrl?: string): string {
  const payload = JSON.stringify({
    organizationId,
    frontendReturnUrl: frontendReturnUrl?.replace(/\/$/, ''),
    nonce: crypto.randomBytes(16).toString('hex'),
    ts: Date.now(),
  });
  const sig = crypto
    .createHmac('sha256', process.env.JWT_SECRET || 'zoho-state-fallback')
    .update(payload)
    .digest('hex');
  return Buffer.from(JSON.stringify({ payload, sig })).toString('base64url');
}

export function parseOAuthState(
  state: string
): { organizationId: string; frontendReturnUrl?: string } | null {
  try {
    const { payload, sig } = JSON.parse(Buffer.from(state, 'base64url').toString('utf8'));
    const expected = crypto
      .createHmac('sha256', process.env.JWT_SECRET || 'zoho-state-fallback')
      .update(payload)
      .digest('hex');
    if (sig !== expected) return null;
    const data = JSON.parse(payload);
    if (Date.now() - data.ts > 15 * 60 * 1000) return null;
    return {
      organizationId: data.organizationId,
      frontendReturnUrl: data.frontendReturnUrl,
    };
  } catch {
    return null;
  }
}

export function mapZohoOAuthError(error: string): string {
  const e = error.toLowerCase();
  if (e.includes('invalid_client')) {
    return 'Could not link your Zoho account. Your IT team may need to enable multi-region support in the Zoho API Console, or add credentials for your Zoho region.';
  }
  if (e.includes('invalid_code') || e.includes('invalid_grant')) {
    return 'Sign-in session expired. Click Connect with Zoho and try again.';
  }
  if (e.includes('redirect_uri')) {
    return 'Zoho sign-in could not finish. Ask your administrator to verify the app redirect URL in Zoho API Console.';
  }
  return error;
}

export function getAuthorizationUrl(organizationId: string, frontendReturnUrl?: string): string {
  const cfg = getZohoConfig();
  const creds = getZohoCredentialsForDataCenter(cfg.universalAccountsServer);
  const state = createOAuthState(organizationId, frontendReturnUrl);
  const params = new URLSearchParams({
    scope: ZOHO_SCOPES,
    client_id: creds.clientId,
    response_type: 'code',
    access_type: 'offline',
    redirect_uri: creds.redirectUri,
    prompt: 'consent',
    state,
  });
  return `${cfg.universalAccountsBase}/oauth/v2/auth?${params.toString()}`;
}

function isInvalidClientError(message: string): boolean {
  return message.toLowerCase().includes('invalid_client');
}

async function exchangeCodeForTokens(
  code: string,
  dc: ZohoDataCenter
) {
  const creds = getZohoCredentialsForDataCenter(dc.accountsServer);
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: creds.clientId,
    client_secret: creds.clientSecret,
    redirect_uri: creds.redirectUri,
    code,
  });

  const res = await fetch(`${accountsBase(dc.accountsServer)}/oauth/v2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  const data = (await res.json()) as Record<string, unknown>;
  if (!res.ok || data.error) {
    const detail = [data.error, data.error_description].filter(Boolean).join(': ');
    throw new Error(String(detail || data.message || 'Token exchange failed'));
  }

  return {
    accessToken: data.access_token as string,
    refreshToken: data.refresh_token as string,
    expiresIn: data.expires_in as number,
    apiDomain:
      (data.api_domain as string)?.replace('https://', '') || dc.apiDomain,
    accountsServer: dc.accountsServer,
  };
}

async function refreshAccessToken(org: OrgZohoFields): Promise<string> {
  if (!org.zohoRefreshToken) {
    throw new Error('Zoho Books is not connected for this organization');
  }

  const accountsServer = org.zohoAccountsServer || 'accounts.zoho.com';
  const creds = getZohoCredentialsForDataCenter(accountsServer);

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: creds.clientId,
    client_secret: creds.clientSecret,
    refresh_token: org.zohoRefreshToken,
  });

  const res = await fetch(`${accountsBase(accountsServer)}/oauth/v2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  const data = (await res.json()) as Record<string, unknown>;
  if (!res.ok || data.error) {
    throw new Error(String(data.error || 'Failed to refresh Zoho access token'));
  }

  const expiresAt = new Date(Date.now() + ((data.expires_in as number) || 3600) * 1000);
  await (prisma as any).organization.update({
    where: { id: org.id },
    data: {
      zohoAccessToken: data.access_token,
      zohoAccessTokenExpiresAt: expiresAt,
      ...(data.api_domain
        ? { zohoApiDomain: (data.api_domain as string).replace('https://', '') }
        : {}),
    },
  });

  return data.access_token as string;
}

export async function getValidAccessToken(organizationId: string): Promise<{
  accessToken: string;
  org: OrgZohoFields;
}> {
  const org = await (prisma as any).organization.findUnique({
    where: { id: organizationId },
  });

  if (!org?.zohoRefreshToken) {
    throw new Error('Zoho Books not connected');
  }

  const bufferMs = 5 * 60 * 1000;
  const expiresAt = org.zohoAccessTokenExpiresAt
    ? new Date(org.zohoAccessTokenExpiresAt).getTime()
    : 0;

  if (org.zohoAccessToken && expiresAt > Date.now() + bufferMs) {
    return { accessToken: org.zohoAccessToken, org };
  }

  const accessToken = await refreshAccessToken(org);
  const updated = await (prisma as any).organization.findUnique({
    where: { id: organizationId },
  });
  return { accessToken, org: updated };
}

async function zohoBooksRequest(
  organizationId: string,
  method: string,
  path: string,
  body?: Record<string, unknown>,
  extraQuery?: Record<string, string>
) {
  const { accessToken, org } = await getValidAccessToken(organizationId);
  const apiDomain = org.zohoApiDomain || 'www.zohoapis.com';
  const booksOrgId = org.zohoBooksOrganizationId;

  if (!booksOrgId) {
    throw new Error('Zoho Books organization ID not set. Reconnect Zoho Books.');
  }

  const url = new URL(`${booksBase(apiDomain)}${path}`);
  url.searchParams.set('organization_id', booksOrgId);
  if (extraQuery) {
    Object.entries(extraQuery).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const res = await fetch(url.toString(), {
    method,
    headers: {
      Authorization: `Zoho-oauthtoken ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = (await res.json()) as Record<string, unknown>;
  if (data.code !== undefined && data.code !== 0) {
    const msg = String(data.message || `Zoho Books API error (${data.code})`);
    if (/not authorized/i.test(msg)) {
      throw new Error(
        'Zoho permissions were updated. In Settings, disconnect Zoho Books, connect again, then retry.'
      );
    }
    throw new Error(msg);
  }
  if (!res.ok) {
    throw new Error(String(data.message || `Zoho Books HTTP ${res.status}`));
  }
  return data;
}

async function zohoBooksGet(
  organizationId: string,
  path: string,
  extraQuery?: Record<string, string>
) {
  return zohoBooksRequest(organizationId, 'GET', path, undefined, extraQuery);
}

async function fetchAllPages<T>(
  organizationId: string,
  path: string,
  listKey: string,
  extraQuery?: Record<string, string>
): Promise<T[]> {
  const results: T[] = [];
  let page = 1;

  while (true) {
    const data = await zohoBooksGet(organizationId, path, {
      ...extraQuery,
      page: String(page),
      per_page: '200',
    });
    const batch = (data[listKey] as T[]) || [];
    results.push(...batch);

    const pageContext = data.page_context as { has_more_page?: boolean } | undefined;
    if (!pageContext?.has_more_page || batch.length === 0) break;
    page += 1;
  }

  return results;
}

function isPurchaseItem(item: ZohoItem): boolean {
  const type = (item.item_type || '').toLowerCase();
  return type === 'purchases' || type === 'sales_and_purchases' || type === 'inventory';
}

async function getDefaultPurchaseAccountId(organizationId: string): Promise<string | null> {
  try {
    const data = await zohoBooksGet(organizationId, '/chartofaccounts');
    const accounts =
      (data.chartofaccounts as Array<{ account_id?: string; account_type?: string }>) || [];
    const preferred = accounts.find((a) => {
      const t = (a.account_type || '').toLowerCase();
      return t.includes('cost') || t.includes('expense') || t.includes('purchase');
    });
    return preferred?.account_id || accounts[0]?.account_id || null;
  } catch {
    return null;
  }
}

/** Resolve a Zoho purchase item for PO line items (required by Zoho Books API). */
export async function getOrCreateDefaultPurchaseItemId(organizationId: string): Promise<string> {
  const envItemId = process.env.ZOHO_DEFAULT_PURCHASE_ITEM_ID?.trim();
  if (envItemId) {
    try {
      await zohoBooksGet(organizationId, `/items/${envItemId}`);
      return envItemId;
    } catch {
      logger.warn(`[Zoho] ZOHO_DEFAULT_PURCHASE_ITEM_ID ${envItemId} not found in Books`);
    }
  }

  const org = await (prisma as any).organization.findUnique({
    where: { id: organizationId },
    select: { zohoDefaultPurchaseItemId: true },
  });

  if (org?.zohoDefaultPurchaseItemId) {
    try {
      await zohoBooksGet(organizationId, `/items/${org.zohoDefaultPurchaseItemId}`);
      return org.zohoDefaultPurchaseItemId;
    } catch {
      logger.warn(`[Zoho] Cached purchase item ${org.zohoDefaultPurchaseItemId} missing; re-resolving`);
    }
  }

  const allItems = await fetchAllPages<ZohoItem>(organizationId, '/items', 'items');
  const purchaseItems = allItems.filter(isPurchaseItem);
  const existing =
    purchaseItems.find((i) => /procurement|sovereign ledger/i.test(i.name || '')) ||
    purchaseItems[0];

  if (existing?.item_id) {
    await (prisma as any).organization.update({
      where: { id: organizationId },
      data: { zohoDefaultPurchaseItemId: existing.item_id },
    });
    return existing.item_id;
  }

  const purchaseAccountId = await getDefaultPurchaseAccountId(organizationId);
  const payload: Record<string, unknown> = {
    name: 'Procurement — Sovereign Ledger',
    description: 'Default purchase line item for POs synced from Sovereign Ledger',
    rate: 0,
    purchase_rate: 0,
    product_type: 'service',
    item_type: 'sales_and_purchases',
  };
  if (purchaseAccountId) {
    payload.purchase_account_id = purchaseAccountId;
  }

  const created = await zohoBooksRequest(organizationId, 'POST', '/items', payload);
  const itemId = (created.item as ZohoItem | undefined)?.item_id;
  if (!itemId) {
    throw new Error(
      'No purchase item in Zoho Books. Create a purchase item in Zoho (Items → New → Purchases), or disconnect/reconnect Zoho in Settings to allow auto-setup.'
    );
  }

  await (prisma as any).organization.update({
    where: { id: organizationId },
    data: { zohoDefaultPurchaseItemId: itemId },
  });

  logger.info(`[Zoho] Using purchase item ${itemId} for org ${organizationId}`);
  return itemId;
}

function mapZohoContactToVendorFields(contact: ZohoContact) {
  const name = (contact.company_name || contact.contact_name || 'Zoho Vendor').trim();
  const person = contact.contact_persons?.[0];
  const contactName = person
    ? [person.first_name, person.last_name].filter(Boolean).join(' ').trim()
    : contact.contact_name || name;
  const email = contact.email || person?.email || 'N/A';
  const paymentTerms =
    contact.payment_terms_label ||
    (contact.payment_terms ? `Net ${contact.payment_terms}` : 'Net 30');

  return {
    name,
    contact: contactName || name,
    email: email.includes('@') ? email : 'N/A',
    phone: contact.phone || null,
    paymentTerms,
    category: 'General',
  };
}

/** Import vendor contacts from Zoho Books into the procurement app. */
export async function importVendorsFromZoho(organizationId: string): Promise<{
  created: number;
  updated: number;
  skipped: number;
  total: number;
}> {
  const contacts = await fetchAllPages<ZohoContact>(organizationId, '/contacts', 'contacts', {
    contact_type: 'vendor',
  });

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const contact of contacts) {
    const zohoContactId = contact.contact_id;
    if (!zohoContactId) continue;

    const fields = mapZohoContactToVendorFields(contact);

    const byZohoId = await (prisma as any).vendor.findFirst({
      where: { organizationId, zohoContactId },
    });
    if (byZohoId) {
      skipped += 1;
      continue;
    }

    if (fields.email !== 'N/A') {
      const byEmail = await (prisma as any).vendor.findFirst({
        where: { organizationId, email: fields.email },
      });
      if (byEmail) {
        await (prisma as any).vendor.update({
          where: { id: byEmail.id },
          data: {
            zohoContactId,
            zohoLastSyncedAt: new Date(),
            zohoSyncError: null,
            phone: byEmail.phone || fields.phone,
          },
        });
        updated += 1;
        continue;
      }
    }

    const byName = await (prisma as any).vendor.findFirst({
      where: { organizationId, name: fields.name },
    });
    if (byName) {
      await (prisma as any).vendor.update({
        where: { id: byName.id },
        data: {
          zohoContactId,
          zohoLastSyncedAt: new Date(),
          zohoSyncError: null,
        },
      });
      updated += 1;
      continue;
    }

    await (prisma as any).vendor.create({
      data: {
        organizationId,
        ...fields,
        status: 'ACTIVE',
        zohoContactId,
        zohoLastSyncedAt: new Date(),
      },
    });
    created += 1;
  }

  logger.info(
    `[Zoho] Imported vendors for org ${organizationId}: created=${created} updated=${updated} skipped=${skipped}`
  );

  return { created, updated, skipped, total: contacts.length };
}

async function resolveBooksOrganizationId(
  organizationId: string,
  accessToken: string,
  apiDomain: string
): Promise<string> {
  const url = `${booksBase(apiDomain)}/organizations`;
  const res = await fetch(url, {
    headers: { Authorization: `Zoho-oauthtoken ${accessToken}` },
  });
  const data = (await res.json()) as { organizations?: Array<{ organization_id: string; name: string }> };
  const orgs = data.organizations;
  if (!orgs?.length) {
    throw new Error('No Zoho Books organizations found on this account');
  }
  return orgs[0].organization_id;
}

export async function completeOAuthConnection(
  organizationId: string,
  code: string,
  callbackParams?: { location?: string | null; accountsServer?: string | null }
): Promise<void> {
  const hasDcHint = Boolean(callbackParams?.location || callbackParams?.accountsServer);
  const candidates: ZohoDataCenter[] = hasDcHint
    ? [resolveZohoDataCenter(callbackParams || {})]
    : getZohoDataCenterFallbackOrder();

  let tokens: Awaited<ReturnType<typeof exchangeCodeForTokens>> | null = null;
  let lastError: Error | null = null;

  for (const dc of candidates) {
    try {
      tokens = await exchangeCodeForTokens(code, dc);
      break;
    } catch (err: any) {
      lastError = err;
      if (!isInvalidClientError(String(err.message || ''))) {
        throw err;
      }
      logger.warn(`[Zoho] Token exchange failed for ${dc.accountsServer}: ${err.message}`);
    }
  }

  if (!tokens) {
    throw lastError || new Error('invalid_client');
  }

  const booksOrgId = await resolveBooksOrganizationId(
    organizationId,
    tokens.accessToken,
    tokens.apiDomain
  );

  const expiresAt = new Date(Date.now() + tokens.expiresIn * 1000);
  const webhookSecret = crypto.randomBytes(24).toString('hex');

  await (prisma as any).organization.update({
    where: { id: organizationId },
    data: {
      zohoRefreshToken: tokens.refreshToken,
      zohoAccessToken: tokens.accessToken,
      zohoAccessTokenExpiresAt: expiresAt,
      zohoBooksOrganizationId: booksOrgId,
      zohoAccountsServer: tokens.accountsServer,
      zohoApiDomain: tokens.apiDomain,
      zohoConnectedAt: new Date(),
      zohoWebhookSecret: webhookSecret,
    },
  });

  logger.info(
    `[Zoho] Connected org ${organizationId} to Books org ${booksOrgId} (${tokens.accountsServer})`
  );
}

export async function disconnectZoho(organizationId: string): Promise<void> {
  await (prisma as any).organization.update({
    where: { id: organizationId },
    data: {
      zohoRefreshToken: null,
      zohoAccessToken: null,
      zohoAccessTokenExpiresAt: null,
      zohoBooksOrganizationId: null,
      zohoConnectedAt: null,
      zohoWebhookSecret: null,
      zohoAccountsServer: null,
      zohoApiDomain: null,
      zohoDefaultPurchaseItemId: null,
    },
  });
}

export async function probeZohoPermissions(organizationId: string): Promise<{
  ok: boolean;
  needsReconnect: boolean;
  message: string;
  hasPurchaseItems: boolean;
}> {
  try {
    const org = await (prisma as any).organization.findUnique({
      where: { id: organizationId },
      select: { zohoDefaultPurchaseItemId: true },
    });
    const envItem = process.env.ZOHO_DEFAULT_PURCHASE_ITEM_ID?.trim();
    if (envItem || org?.zohoDefaultPurchaseItemId) {
      return {
        ok: true,
        needsReconnect: false,
        hasPurchaseItems: true,
        message: 'Zoho Books permissions are up to date.',
      };
    }

    const allItems = await fetchAllPages<ZohoItem>(organizationId, '/items', 'items');
    const purchaseItems = allItems.filter(isPurchaseItem);

    if (purchaseItems.length > 0) {
      return {
        ok: true,
        needsReconnect: false,
        hasPurchaseItems: true,
        message: 'Zoho Books permissions are up to date.',
      };
    }

    return {
      ok: false,
      needsReconnect: true,
      hasPurchaseItems: false,
      message:
        'No purchase item in Zoho Books yet. Disconnect & reconnect Zoho in Settings (recommended), or create a Purchases item in Zoho Books → Items.',
    };
  } catch (err: any) {
    const msg = String(err.message || '');
    const needsReconnect = /not authorized|invalid oauth|scope/i.test(msg);
    return {
      ok: false,
      needsReconnect,
      hasPurchaseItems: false,
      message: needsReconnect
        ? 'Disconnect and reconnect Zoho Books in Settings to refresh permissions.'
        : msg,
    };
  }
}

export async function getZohoConnectionStatus(organizationId: string) {
  const cfg = getZohoConfig();
  const org = await (prisma as any).organization.findUnique({
    where: { id: organizationId },
    select: {
      id: true,
      zohoConnectedAt: true,
      zohoBooksOrganizationId: true,
      zohoRefreshToken: true,
      zohoWebhookSecret: true,
    },
  });

  const webhookToken = org?.zohoWebhookSecret;
  const webhookUrl = org?.id && webhookToken
    ? `${cfg.backendPublicUrl.replace(/\/$/, '')}/api/zoho/webhook/${org.id}?token=${webhookToken}`
    : null;

  const configured = isZohoConfigured();
  const connected = Boolean(org?.zohoRefreshToken);

  let permissions = { ok: true, needsReconnect: false, message: '', hasPurchaseItems: true };
  if (connected) {
    permissions = await probeZohoPermissions(organizationId);
  }

  let state: 'connected' | 'ready' | 'disabled' = 'disabled';
  let message = 'Zoho Books is not enabled for this application yet.';
  if (configured && connected) {
    state = 'connected';
    message = permissions.needsReconnect
      ? permissions.message
      : 'Your Zoho Books account is linked. Vendors and purchase orders sync automatically.';
  } else if (configured) {
    state = 'ready';
    message = 'Click Connect to sign in with Zoho and start syncing.';
  }

  return {
    state,
    message,
    configured,
    connected,
    connectedAt: org?.zohoConnectedAt || null,
    zohoBooksOrganizationId: org?.zohoBooksOrganizationId || null,
    webhookUrl: connected ? webhookUrl : null,
    permissionsOk: permissions.ok,
    needsReconnect: permissions.needsReconnect,
    hasPurchaseItems: permissions.hasPurchaseItems,
  };
}

export async function createZohoVendorContact(
  organizationId: string,
  vendor: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    contact: string;
    paymentTerms?: string;
  }
): Promise<string> {
  const contactName = vendor.name.trim();
  const payload: Record<string, unknown> = {
    contact_name: contactName,
    contact_type: 'vendor',
    company_name: contactName,
  };

  if (vendor.email && vendor.email !== 'N/A' && vendor.email.includes('@')) {
    payload.email = vendor.email;
  }
  if (vendor.phone) {
    payload.phone = vendor.phone;
  }
  if (vendor.contact && vendor.contact !== 'N/A') {
    payload.contact_persons = [
      {
        first_name: vendor.contact.split(' ')[0] || vendor.contact,
        last_name: vendor.contact.split(' ').slice(1).join(' ') || '',
        email: vendor.email !== 'N/A' ? vendor.email : undefined,
      },
    ];
  }

  const data = await zohoBooksRequest(organizationId, 'POST', '/contacts', payload);
  const contact = data.contact as { contact_id?: string } | undefined;
  const contactId = contact?.contact_id;
  if (!contactId) {
    throw new Error('Zoho did not return a contact_id');
  }

  await (prisma as any).vendor.update({
    where: { id: vendor.id },
    data: {
      zohoContactId: contactId,
      zohoLastSyncedAt: new Date(),
      zohoSyncError: null,
    },
  });

  return contactId;
}

export async function createZohoPurchaseOrder(
  organizationId: string,
  po: {
    id: string;
    poNumber: string;
    amount: number;
    currency: string;
    vendor: { id: string; zohoContactId?: string | null; name: string; email: string; phone?: string | null; contact: string; paymentTerms?: string };
  },
  requestTitle?: string
): Promise<string> {
  let vendorContactId = po.vendor.zohoContactId;

  if (!vendorContactId) {
    vendorContactId = await createZohoVendorContact(organizationId, po.vendor);
  }

  const itemId = await getOrCreateDefaultPurchaseItemId(organizationId);

  const lineItem = {
    item_id: itemId,
    name: requestTitle || `Procurement ${po.poNumber}`,
    description: `Synced from Sovereign Ledger — ${po.poNumber}`,
    rate: po.amount,
    quantity: 1,
  };

  const payload = {
    vendor_id: vendorContactId,
    reference_number: po.poNumber,
    date: new Date().toISOString().split('T')[0],
    line_items: [lineItem],
    notes: `Created via Sovereign Ledger — ${po.poNumber}`,
  };

  const data = await zohoBooksRequest(organizationId, 'POST', '/purchaseorders', payload);
  const purchaseorder = data.purchaseorder as { purchaseorder_id?: string } | undefined;
  const zohoPoId = purchaseorder?.purchaseorder_id;
  if (!zohoPoId) {
    throw new Error('Zoho did not return a purchaseorder_id');
  }

  await (prisma as any).purchaseOrder.update({
    where: { id: po.id },
    data: {
      zohoPurchaseOrderId: zohoPoId,
      zohoLastSyncedAt: new Date(),
      zohoSyncError: null,
    },
  });

  return zohoPoId;
}

export { isZohoConfigured };
