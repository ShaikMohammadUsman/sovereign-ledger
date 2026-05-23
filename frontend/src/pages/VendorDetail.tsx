import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Mail,
  Phone,
  ChevronRight,
  ArrowUpRight,
  Loader2,
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { vendorService } from '../services/api';
import ZohoSyncPanel from '../components/ZohoSyncPanel';

const VendorDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadVendor = async () => {
    if (!id) return;
    try {
      const res = await vendorService.getById(id);
      setVendor(res.data);
    } catch {
      setVendor(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendor();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-3 text-brand-text-secondary uppercase text-[10px] tracking-widest">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading vendor…
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="text-center py-20 text-rose-400 uppercase text-[10px] tracking-widest font-bold">
        Vendor not found
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20 font-sans">
      <div className="flex items-center justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-4 text-[10px] font-bold tracking-widest text-brand-text-secondary uppercase">
            <span>Supply Chain</span>
            <ChevronRight className="w-3 h-3 text-brand-text-secondary/50" />
            <span className="text-brand-accent">Entity Profile</span>
          </div>
          <h1 className="text-5xl font-light text-white tracking-tight">{vendor.name}</h1>
          <div className="flex items-center gap-6">
            <span className="text-[10px] font-bold text-brand-text-secondary uppercase tracking-[0.2em]">
              {vendor.category}
            </span>
            <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-black px-3 py-1 rounded-full tracking-widest uppercase">
              {vendor.status}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate('/requests/new')}
          className="px-8 py-4 rounded-xl bg-brand-accent text-black text-[10px] font-black uppercase tracking-widest"
        >
          New Requisition
        </button>
      </div>

      <div className="grid grid-cols-12 gap-12">
        <div className="col-span-12 lg:col-span-4 space-y-8">
          <div className="glass rounded-3xl p-8 border border-brand-border bg-brand-card/20 space-y-8">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-text-secondary border-b border-brand-border pb-4">
              Entity Identity
            </h3>
            <div className="space-y-6">
              <div>
                <p className="text-[9px] font-black text-brand-text-secondary/50 uppercase tracking-widest">Contact</p>
                <p className="text-sm text-white">{vendor.contact}</p>
              </div>
              <div>
                <p className="text-[9px] font-black text-brand-text-secondary/50 uppercase tracking-widest">Payment terms</p>
                <p className="text-sm text-brand-accent">{vendor.paymentTerms}</p>
              </div>
              <div className="flex items-center gap-4 text-brand-text-secondary">
                <Mail className="w-4 h-4" />
                <p className="text-xs">{vendor.email}</p>
              </div>
              {vendor.phone && (
                <div className="flex items-center gap-4 text-brand-text-secondary">
                  <Phone className="w-4 h-4" />
                  <p className="text-xs">{vendor.phone}</p>
                </div>
              )}
            </div>
          </div>

          {id && (
            <ZohoSyncPanel type="vendor" entityId={id} data={vendor} onUpdated={loadVendor} />
          )}
        </div>

        <div className="col-span-12 lg:col-span-8 space-y-8">
          <div className="grid grid-cols-2 gap-8">
            <div className="glass rounded-3xl p-8 border border-brand-border">
              <p className="text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.3em] mb-4">
                Total spend
              </p>
              <p className="text-5xl font-light text-white">{formatCurrency(vendor.annSpend || 0)}</p>
            </div>
            <div className="glass rounded-3xl p-8 border border-brand-border">
              <p className="text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.3em] mb-4">
                Purchase orders
              </p>
              <p className="text-5xl font-light text-white">{vendor.contracts || 0}</p>
            </div>
          </div>

          <div className="glass rounded-3xl border border-brand-border overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-brand-sidebar/50 border-b border-brand-border">
                  <th className="px-8 py-5 text-[9px] font-black text-brand-text-secondary uppercase">PO</th>
                  <th className="px-8 py-5 text-[9px] font-black text-brand-text-secondary uppercase">Request</th>
                  <th className="px-8 py-5 text-[9px] font-black text-brand-text-secondary uppercase">Amount</th>
                  <th className="px-8 py-5 text-[9px] font-black text-brand-text-secondary uppercase">Payment</th>
                  <th className="px-8 py-5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/30">
                {(vendor.purchaseOrders || []).map((po: any) => (
                  <tr key={po.id} className="hover:bg-white/3 group">
                    <td className="px-8 py-6 text-[10px] font-bold text-brand-accent">{po.poNumber}</td>
                    <td className="px-8 py-6 text-sm text-white">{po.request?.title || '—'}</td>
                    <td className="px-8 py-6 text-sm text-white">{formatCurrency(po.amount, po.currency)}</td>
                    <td className="px-8 py-6 text-[10px] uppercase text-brand-text-secondary">
                      {po.zohoPaymentStatus || '—'}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <Link to={`/purchase-orders/${po.id}`}>
                        <ArrowUpRight className="w-4 h-4 text-brand-accent ml-auto opacity-60 group-hover:opacity-100" />
                      </Link>
                    </td>
                  </tr>
                ))}
                {!vendor.purchaseOrders?.length && (
                  <tr>
                    <td colSpan={5} className="px-8 py-12 text-center text-brand-text-secondary text-sm italic">
                      No purchase orders yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDetail;
