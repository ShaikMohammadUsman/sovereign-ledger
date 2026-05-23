import React, { useEffect, useState } from 'react';
import { BookOpen, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { zohoService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

type VendorZoho = {
  zohoContactId?: string | null;
  zohoSyncError?: string | null;
};

type PoZoho = VendorZoho & {
  zohoPurchaseOrderId?: string | null;
  zohoPaymentStatus?: string | null;
  zohoSyncError?: string | null;
};

type Props =
  | { type: 'vendor'; entityId: string; data: VendorZoho; onUpdated?: () => void }
  | { type: 'po'; entityId: string; data: PoZoho; onUpdated?: () => void };

const ZohoSyncPanel: React.FC<Props> = ({ type, entityId, data, onUpdated }) => {
  const { user } = useAuth();
  const toast = useToast();
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  const canSync =
    user?.role === 'ADMIN' || user?.role === 'FINANCE' || user?.role === 'FINANCE_MANAGER';

  useEffect(() => {
    zohoService
      .getStatus()
      .then((r) => setConnected(r.data.connected))
      .catch(() => setConnected(false))
      .finally(() => setChecking(false));
  }, []);

  const handleRetry = async () => {
    setLoading(true);
    try {
      if (type === 'vendor') {
        await zohoService.syncVendor(entityId);
        toast.success('Vendor sent to Zoho Books.', 'Synced');
      } else {
        await zohoService.syncPurchaseOrder(entityId);
        toast.success('Purchase order sent to Zoho Books.', 'Synced');
      }
      onUpdated?.();
    } catch (err: any) {
      toast.error(
        err.response?.data?.error || err.response?.data?.message || 'Could not sync to Zoho.',
        'Sync failed'
      );
    } finally {
      setLoading(false);
    }
  };

  if (checking) return null;

  const synced =
    type === 'vendor' ? Boolean(data.zohoContactId) : Boolean((data as PoZoho).zohoPurchaseOrderId);

  return (
    <div className="glass rounded-2xl p-5 border border-brand-border bg-brand-card/20 space-y-3">
      <div className="flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-brand-accent" />
        <span className="text-sm font-medium text-white">Zoho Books</span>
        {connected && synced && <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto" />}
      </div>

      {!connected ? (
        <p className="text-sm text-brand-text-secondary">
          <Link to="/settings" className="text-brand-accent underline">
            Connect Zoho Books
          </Link>{' '}
          in Settings to sync this {type === 'vendor' ? 'vendor' : 'purchase order'}.
        </p>
      ) : synced ? (
        <p className="text-sm text-emerald-400/90">
          Synced with Zoho Books
          {type === 'po' && (data as PoZoho).zohoPaymentStatus && (
            <span className="text-brand-text-secondary">
              {' '}
              · Payment: {(data as PoZoho).zohoPaymentStatus}
            </span>
          )}
        </p>
      ) : (
        <p className="text-sm text-brand-text-secondary">Not in Zoho Books yet.</p>
      )}

      {data.zohoSyncError && (
        <p className="text-sm text-rose-400">{data.zohoSyncError}</p>
      )}

      {canSync && connected && !synced && (
        <button
          type="button"
          disabled={loading}
          onClick={handleRetry}
          className="inline-flex items-center gap-2 text-sm text-brand-accent hover:underline"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Send to Zoho now
        </button>
      )}

      {canSync && connected && synced && (
        <button
          type="button"
          disabled={loading}
          onClick={handleRetry}
          className={cn(
            'inline-flex items-center gap-2 text-xs text-brand-text-secondary hover:text-white',
            loading && 'opacity-50'
          )}
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
          Sync again
        </button>
      )}
    </div>
  );
};

export default ZohoSyncPanel;
