/**
 * Zoho Books integration configuration.
 * End users never choose a region — OAuth callback supplies location / accounts-server.
 */

export const ZOHO_SCOPES = [
  'ZohoBooks.contacts.CREATE',
  'ZohoBooks.contacts.UPDATE',
  'ZohoBooks.contacts.READ',
  'ZohoBooks.purchaseorders.CREATE',
  'ZohoBooks.purchaseorders.READ',
  'ZohoBooks.bills.READ',
  'ZohoBooks.vendorpayments.READ',
  'ZohoBooks.settings.READ',
  'ZohoBooks.settings.CREATE',
].join(',');

/** Universal OAuth entry — Zoho redirects users to their own data center. */
export const ZOHO_UNIVERSAL_ACCOUNTS_SERVER = 'accounts.zoho.com';

export type ZohoDataCenter = {
  locationCode: string;
  accountsServer: string;
  apiDomain: string;
};

/** Zoho `location` query param → accounts + API hosts */
const ZOHO_DC_BY_LOCATION: Record<string, Omit<ZohoDataCenter, 'locationCode'>> = {
  com: { accountsServer: 'accounts.zoho.com', apiDomain: 'www.zohoapis.com' },
  us: { accountsServer: 'accounts.zoho.com', apiDomain: 'www.zohoapis.com' },
  in: { accountsServer: 'accounts.zoho.in', apiDomain: 'www.zohoapis.in' },
  eu: { accountsServer: 'accounts.zoho.eu', apiDomain: 'www.zohoapis.eu' },
  au: { accountsServer: 'accounts.zoho.com.au', apiDomain: 'www.zohoapis.com.au' },
  uk: { accountsServer: 'accounts.zoho.uk', apiDomain: 'www.zohoapis.uk' },
  jp: { accountsServer: 'accounts.zoho.jp', apiDomain: 'www.zohoapis.jp' },
  ca: { accountsServer: 'accounts.zohocloud.ca', apiDomain: 'www.zohoapis.ca' },
  sa: { accountsServer: 'accounts.zoho.sa', apiDomain: 'www.zohoapis.sa' },
};

const KNOWN_ACCOUNTS_HOSTS = new Map<string, ZohoDataCenter>(
  Object.entries(ZOHO_DC_BY_LOCATION).map(([locationCode, dc]) => [
    dc.accountsServer,
    { locationCode, ...dc },
  ])
);

function normalizeAccountsHost(accountsServer?: string | null): string | null {
  if (!accountsServer?.trim()) return null;
  try {
    const withProto = accountsServer.includes('://')
      ? accountsServer
      : `https://${accountsServer}`;
    return new URL(withProto).hostname.toLowerCase();
  } catch {
    return accountsServer.replace(/^https?:\/\//i, '').split('/')[0].toLowerCase();
  }
}

/** Resolve user's Zoho data center from OAuth callback query params. */
export function resolveZohoDataCenter(params: {
  location?: string | null;
  accountsServer?: string | null;
}): ZohoDataCenter {
  const host = normalizeAccountsHost(params.accountsServer);
  if (host) {
    const known = KNOWN_ACCOUNTS_HOSTS.get(host);
    if (known) return known;
    const apiDomain = host.startsWith('accounts.')
      ? host.replace(/^accounts\./, 'www.')
      : 'www.zohoapis.com';
    return { locationCode: params.location?.toLowerCase() || 'com', accountsServer: host, apiDomain };
  }

  const loc = (params.location || 'com').toLowerCase();
  const preset = ZOHO_DC_BY_LOCATION[loc] || ZOHO_DC_BY_LOCATION.com;
  return { locationCode: loc, ...preset };
}

/** Ordered list for token-exchange fallback when callback omits DC hints (rare). */
export function getZohoDataCenterFallbackOrder(): ZohoDataCenter[] {
  const preferred = (process.env.ZOHO_REGION || 'us').toLowerCase();
  const order = ['com', 'in', 'eu', 'au', 'uk', 'jp', 'ca', 'sa'];
  const codes = [
    preferred === 'us' ? 'com' : preferred,
    ...order.filter((c) => c !== (preferred === 'us' ? 'com' : preferred)),
  ];
  const seen = new Set<string>();
  const result: ZohoDataCenter[] = [];
  for (const code of codes) {
    const preset = ZOHO_DC_BY_LOCATION[code];
    if (!preset || seen.has(preset.accountsServer)) continue;
    seen.add(preset.accountsServer);
    result.push({ locationCode: code, ...preset });
  }
  return result;
}

function credentialEnvSuffix(accountsServer: string): string {
  const host = accountsServer.toLowerCase();
  if (host.includes('.zoho.in')) return 'IN';
  if (host.includes('.zoho.eu')) return 'EU';
  if (host.includes('.zoho.uk')) return 'UK';
  if (host.includes('.zoho.jp')) return 'JP';
  if (host.includes('zohocloud.ca')) return 'CA';
  if (host.includes('.zoho.sa')) return 'SA';
  if (host.includes('.com.au')) return 'AU';
  return 'US';
}

/** OAuth client credentials for a data center (optional per-DC env overrides). */
export function getZohoCredentialsForDataCenter(accountsServer: string): {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
} {
  const base = getZohoConfig();
  const suffix = credentialEnvSuffix(accountsServer);
  return {
    clientId:
      process.env[`ZOHO_CLIENT_ID_${suffix}`] ||
      process.env.ZOHO_CLIENT_ID ||
      base.clientId,
    clientSecret:
      process.env[`ZOHO_CLIENT_SECRET_${suffix}`] ||
      process.env.ZOHO_CLIENT_SECRET ||
      base.clientSecret,
    redirectUri: base.redirectUri,
  };
}

export function getZohoConfig() {
  const clientId = process.env.ZOHO_CLIENT_ID || '';
  const clientSecret = process.env.ZOHO_CLIENT_SECRET || '';
  const redirectUri =
    process.env.ZOHO_REDIRECT_URI ||
    process.env.ZOHO_REDIRECT_URI_PRODUCTION ||
    'http://localhost:5001/api/zoho/callback';

  const frontendUrl =
    process.env.FRONTEND_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  const backendPublicUrl =
    process.env.BACKEND_PUBLIC_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:5001');
  const webhookSecret = process.env.ZOHO_WEBHOOK_SECRET || '';

  const redirectUris = [
    redirectUri,
    process.env.ZOHO_REDIRECT_URI_LOCAL || 'http://localhost:5001/api/zoho/callback',
    process.env.ZOHO_REDIRECT_URI_PRODUCTION,
  ].filter((u, i, arr): u is string => Boolean(u) && arr.indexOf(u) === i);

  return {
    clientId,
    clientSecret,
    redirectUri,
    redirectUris,
    frontendUrl,
    backendPublicUrl,
    webhookSecret,
    webhookUrl: `${backendPublicUrl.replace(/\/$/, '')}/api/zoho/webhook`,
    universalAccountsServer: ZOHO_UNIVERSAL_ACCOUNTS_SERVER,
    universalAccountsBase: `https://${ZOHO_UNIVERSAL_ACCOUNTS_SERVER}`,
  };
}

export function isZohoConfigured(): boolean {
  const { clientId, clientSecret } = getZohoConfig();
  return Boolean(clientId && clientSecret);
}
