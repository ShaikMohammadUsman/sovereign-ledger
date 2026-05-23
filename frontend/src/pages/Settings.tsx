import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Download,
  Link2,
  Loader2,
  RefreshCw,
  Unplug,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { zohoService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

type ZohoStatus = {
  state: 'connected' | 'ready' | 'disabled';
  message: string;
  configured: boolean;
  connected: boolean;
  connectedAt: string | null;
  webhookUrl?: string | null;
  needsReconnect?: boolean;
  permissionsOk?: boolean;
};

const Settings: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [status, setStatus] = useState<ZohoStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  const canManageZoho =
    user?.role === 'ADMIN' || user?.role === 'FINANCE' || user?.role === 'FINANCE_MANAGER';

  const loadStatus = async () => {
    try {
      const res = await zohoService.getStatus();
      const data = res.data;
      setStatus({
        state: data.state || (data.connected ? 'connected' : data.configured ? 'ready' : 'disabled'),
        message: data.message || '',
        configured: data.configured,
        connected: data.connected,
        connectedAt: data.connectedAt,
        webhookUrl: data.webhookUrl,
        needsReconnect: data.needsReconnect,
        permissionsOk: data.permissionsOk,
      });
    } catch {
      toast.error('Could not load integration status.', 'Settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  useEffect(() => {
    const zoho = searchParams.get('zoho');
    if (!zoho) return;
    if (zoho === 'connected') {
      toast.success('Zoho Books is connected. New vendors and POs will sync automatically.', 'Connected');
      loadStatus();
    } else if (zoho.startsWith('error')) {
      const reason = decodeURIComponent(searchParams.get('reason') || 'Could not connect to Zoho');
      setConnectError(reason);
      toast.error(reason, 'Connection failed');
    }
    setSearchParams({}, { replace: true });
  }, [searchParams]);

  const handleConnect = async () => {
    setConnectError(null);
    setActionLoading(true);
    try {
      const res = await zohoService.getConnectUrl();
      if (res.data?.url) window.location.href = res.data.url;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not open Zoho sign-in.', 'Zoho Books');
      setActionLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Disconnect Zoho Books? Syncing will stop until you connect again.')) return;
    setActionLoading(true);
    try {
      await zohoService.disconnect();
      toast.info('Zoho Books disconnected.', 'Disconnected');
      await loadStatus();
    } catch {
      toast.error('Could not disconnect.', 'Zoho Books');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRetryFailedPos = async () => {
    setActionLoading(true);
    try {
      const res = await zohoService.retryFailedPurchaseOrders();
      const { synced, total } = res.data;
      if (synced > 0) {
        toast.success(`Synced ${synced} of ${total} purchase order(s) to Zoho Books.`, 'Done');
      } else if (total === 0) {
        toast.info('All purchase orders are already synced to Zoho.', 'Zoho Books');
      } else {
        toast.error(
          res.data.results?.find((r: { error?: string }) => r.error)?.error ||
            'Could not sync POs. Reconnect Zoho first.',
          'Sync failed'
        );
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Retry failed.', 'Zoho Books');
    } finally {
      setActionLoading(false);
    }
  };

  const handleImportVendors = async () => {
    setActionLoading(true);
    try {
      const res = await zohoService.importVendorsFromZoho();
      const { created, updated, total } = res.data;
      toast.success(
        `Imported ${created} new and linked ${updated} of ${total} vendor(s) from Zoho Books.`,
        'Import complete'
      );
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Import failed.', 'Zoho Books');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSyncVendors = async () => {
    setActionLoading(true);
    try {
      const res = await zohoService.syncVendors();
      toast.success(`Synced ${res.data.synced} vendor(s) to Zoho Books.`, 'Done');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Sync failed.', 'Zoho Books');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSyncBills = async () => {
    setActionLoading(true);
    try {
      const res = await zohoService.syncAllBills();
      toast.success(`Updated payment status on ${res.data.synced} purchase order(s).`, 'Done');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Sync failed.', 'Zoho Books');
    } finally {
      setActionLoading(false);
    }
  };

  const state = status?.state ?? 'disabled';

  return (
    <div className="space-y-12 pb-20">
      <div>
        <h1 className="text-4xl font-light text-white tracking-tight">Settings</h1>
        <p className="text-brand-text-secondary mt-2 text-sm">Manage integrations for your organization</p>
      </div>

      <section className="glass rounded-3xl border border-brand-border p-8 lg:p-10 space-y-8">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-brand-accent/10 border border-brand-accent/20">
            <BookOpen className="w-6 h-6 text-brand-accent" />
          </div>
          <div>
            <h2 className="text-xl font-light text-white">Zoho Books</h2>
            <p className="text-sm text-brand-text-secondary mt-2 max-w-xl">
              Keep accounting in sync — vendors and purchase orders flow to Zoho Books when you work
              in this app.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center gap-3 text-brand-text-secondary text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading…
          </div>
        ) : !canManageZoho ? (
          <p className="text-sm text-brand-text-secondary">
            Ask an admin or finance user to connect Zoho Books for your organization.
          </p>
        ) : (
          <>
            {connectError && (
              <div className="rounded-2xl p-4 border border-rose-500/30 bg-rose-500/10 text-sm text-rose-200">
                {connectError}
              </div>
            )}

            {state === 'connected' && status?.needsReconnect && (
              <div className="rounded-2xl p-4 border border-amber-500/40 bg-amber-500/10 text-sm text-amber-100 space-y-2">
                <p className="font-medium">Action required: refresh Zoho permissions</p>
                <p className="text-amber-200/90">{status.message}</p>
                <ol className="list-decimal list-inside text-xs text-amber-200/80 space-y-1">
                  <li>Click <strong>Disconnect</strong> below</li>
                  <li>Click <strong>Connect with Zoho</strong> and approve all permissions</li>
                  <li>Click <strong>Retry failed PO syncs</strong></li>
                </ol>
              </div>
            )}

            {state === 'connected' && !status?.needsReconnect && (
              <div className="rounded-2xl p-4 border border-emerald-500/20 bg-emerald-500/5 text-xs text-emerald-200/90">
                Zoho permissions OK — vendor → request → approve → PO sync is ready to test.
              </div>
            )}

            {/* Single clear status banner */}
            <div
              className={cn(
                'rounded-2xl p-6 border flex items-start gap-4',
                state === 'connected' && 'border-emerald-500/30 bg-emerald-500/5',
                state === 'ready' && 'border-brand-accent/30 bg-brand-accent/5',
                state === 'disabled' && 'border-brand-border bg-brand-sidebar/30'
              )}
            >
              {state === 'connected' ? (
                <CheckCircle2 className="w-8 h-8 text-emerald-500 shrink-0" />
              ) : (
                <BookOpen className="w-8 h-8 text-brand-accent shrink-0" />
              )}
              <div className="space-y-2">
                <p className="text-lg font-medium text-white">
                  {state === 'connected' && 'Connected to Zoho Books'}
                  {state === 'ready' && 'Not connected yet'}
                  {state === 'disabled' && 'Not available'}
                </p>
                <p className="text-sm text-brand-text-secondary">{status?.message}</p>
                {state === 'connected' && status?.connectedAt && (
                  <p className="text-xs text-brand-text-secondary/70">
                    Connected since {new Date(status.connectedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            {state === 'connected' && (
              <ul className="text-sm text-brand-text-secondary space-y-2 pl-1">
                <li>• Import vendors from Zoho Books — finance’s vendor list in the app</li>
                <li>• New vendors in the app → appear as contacts in Zoho Books</li>
                <li>• When you generate a PO → creates a purchase order in Zoho Books</li>
                <li>• Use &quot;Retry sync&quot; on a vendor or PO page if something did not appear</li>
              </ul>
            )}

            {/* Primary actions — plain language */}
            <div className="flex flex-wrap gap-3">
              {state === 'ready' && (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleConnect}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-brand-accent text-black text-sm font-bold hover:bg-brand-accent/90 transition-all"
                >
                  {actionLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Link2 className="w-5 h-5" />
                  )}
                  Connect with Zoho
                </button>
              )}

              {state === 'connected' && (
                <>
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={handleImportVendors}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-brand-accent/40 bg-brand-accent/10 text-sm font-medium hover:bg-brand-accent/20"
                  >
                    {actionLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    Import vendors from Zoho
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={handleRetryFailedPos}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-brand-border text-sm hover:border-brand-accent/50"
                  >
                    <RefreshCw className={cn('w-4 h-4', actionLoading && 'animate-spin')} />
                    Retry failed PO syncs
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={handleSyncVendors}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-brand-border text-sm hover:border-brand-accent/50"
                  >
                    <RefreshCw className={cn('w-4 h-4', actionLoading && 'animate-spin')} />
                    Sync all vendors now
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={handleSyncBills}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-brand-border text-sm hover:border-brand-accent/50"
                  >
                    <RefreshCw className={cn('w-4 h-4', actionLoading && 'animate-spin')} />
                    Refresh bill status
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={handleDisconnect}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm text-rose-400 border border-rose-500/20 hover:bg-rose-500/10"
                  >
                    <Unplug className="w-4 h-4" />
                    Disconnect
                  </button>
                </>
              )}

              {state === 'disabled' && (
                <p className="text-sm text-brand-text-secondary">
                  Your IT team needs to enable Zoho on the server once. After that, you can connect
                  your Zoho account here with one click.
                </p>
              )}
            </div>

            {/* Advanced — hidden from normal users */}
            {state === 'connected' && status?.webhookUrl && (
              <div className="pt-4 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-xs text-brand-text-secondary hover:text-white"
                >
                  {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  Advanced (for IT / webhooks)
                </button>
                {showAdvanced && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs text-brand-text-secondary">
                      Optional: paste this URL in Zoho Books → Settings → Developer → Webhooks
                    </p>
                    <code className="block text-[10px] p-3 rounded-lg bg-black/40 border border-brand-border text-brand-accent break-all">
                      {status.webhookUrl}
                    </code>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default Settings;
