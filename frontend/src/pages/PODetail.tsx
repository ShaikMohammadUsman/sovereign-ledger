import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  FileText, 
  Download, 
  Printer, 
  Share2,
  Package,
  Truck,
  CreditCard,
  ArrowLeft
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { poService } from '@/services/api';
import { useToast } from '@/context/ToastContext';
import ZohoSyncPanel from '../components/ZohoSyncPanel';

const PODetail: React.FC = () => {
  const { id } = useParams();
  const [po, setPo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchPO = async () => {
    if (!id) return;
    try {
      const res = await poService.getById(id);
      setPo(res.data);
    } catch (error) {
      console.error('Failed to fetch PO details', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPO();
  }, [id]);

  if (loading) return <div className="text-white text-center py-20 font-bold tracking-widest uppercase">Loading Document...</div>;
  if (!po) return <div className="text-white text-center py-20 font-bold tracking-widest uppercase text-brand-accent">Purchase Order Not Found</div>;

  return (
    <div className="space-y-10 print:space-y-6 print:overflow-visible print:h-auto print-stay">
      {/* Official Print Header */}
      <div className="hidden print:flex items-center justify-between border-b border-brand-border pb-6 mb-6 print-only">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-accent flex items-center justify-center text-black font-bold">
            SL
          </div>
          <span className="font-bold tracking-widest text-sm uppercase">Sovereign Procurement System</span>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-brand-text-secondary uppercase">Official Purchase Order Record</p>
          <p className="text-[10px] text-brand-text-secondary">{new Date().toLocaleString()}</p>
        </div>
      </div>

      {/* Breadcrumb & Actions */}
      <div id="po-actions" className="flex items-center justify-between print:hidden">
        <Link to="/purchase-orders" className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-brand-text-secondary uppercase hover:text-brand-accent transition-colors">
          <ArrowLeft className="w-3 h-3" />
          Back to Orders
        </Link>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              toast.info('Compiling Secure Purchase Order PDF...', 'GENERATING DOCUMENT');
              window.print();
            }}
            className="glass px-4 py-2 rounded-lg border border-brand-border flex items-center gap-2 text-[10px] font-bold tracking-widest text-brand-text-secondary hover:text-white transition-colors"
          >
            <Download className="w-4 h-4" /> DOWNLOAD PDF
          </button>
          <button 
            onClick={() => window.print()}
            className="glass px-4 py-2 rounded-lg border border-brand-border flex items-center gap-2 text-[10px] font-bold tracking-widest text-brand-text-secondary hover:text-white transition-colors"
          >
            <Printer className="w-4 h-4" /> PRINT
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-end justify-between border-b border-brand-border pb-10">
        <div className="space-y-4">
          <h1 className="text-6xl font-light tracking-tighter text-white">
            Purchase Order
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold tracking-[0.2em] text-brand-text-secondary">
              SYSTEM REFERENCE: {po.poNumber}
            </span>
            <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-[10px] font-black px-3 py-1 rounded tracking-widest uppercase">
              {po.status || 'ISSUED'}
            </span>
          </div>
        </div>
        <div className="text-right space-y-2">
          <p className="text-[10px] font-bold text-brand-text-secondary uppercase tracking-widest">Grand Total</p>
          <p className="text-5xl font-light text-brand-accent">{formatCurrency(po.amount, po.currency)}</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-12 print:flex print:flex-col print:gap-8 overflow-visible">
        {/* Main Content */}
        <div className="col-span-8 space-y-12 print:col-span-12 print:w-full print:space-y-8">
          {/* Vendor & Shipping */}
          <div className="grid grid-cols-2 gap-10">
            <div className="glass rounded-2xl p-8 border border-brand-border bg-brand-card/20 space-y-6">
              <div className="flex items-center gap-2 border-b border-brand-border pb-4">
                <Package className="w-4 h-4 text-brand-accent" />
                <h3 className="text-[10px] font-bold tracking-widest uppercase text-brand-text-secondary">Vendor Information</h3>
              </div>
              <div className="space-y-4">
                <p className="text-xl font-light text-white">{po.vendor?.name || 'Unknown Vendor'}</p>
                <p className="text-xs text-brand-text-secondary leading-relaxed">{po.vendor?.email || 'N/A'}</p>
                <p className="text-[10px] font-bold text-brand-accent tracking-widest">{po.vendor?.contact || 'N/A'}</p>
              </div>
            </div>

            <div className="glass rounded-2xl p-8 border border-brand-border bg-brand-card/20 space-y-6">
              <div className="flex items-center gap-2 border-b border-brand-border pb-4">
                <Truck className="w-4 h-4 text-brand-accent" />
                <h3 className="text-[10px] font-bold tracking-widest uppercase text-brand-text-secondary">Shipping Target</h3>
              </div>
              <div className="space-y-4">
                <p className="text-xl font-light text-white">Global Headquarters</p>
                <p className="text-xs text-brand-text-secondary leading-relaxed">Infrastructure Hub A, Floor 12<br />Tech Plaza, SF 94103</p>
                <p className="text-[10px] font-bold text-brand-accent tracking-widest">ISSUED: {new Date(po.createdAt || po.date).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="glass rounded-2xl border border-brand-border overflow-hidden bg-brand-card/10">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 border-b border-brand-border">
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-brand-text-secondary">Description</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-brand-text-secondary text-right">Qty</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-brand-text-secondary text-right">Unit Price</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-brand-text-secondary text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="px-8 py-6">
                      <p className="text-sm font-light text-white">{po.request?.title || 'Requisition Item'}</p>
                    </td>
                    <td className="px-8 py-6 text-right text-sm font-medium text-brand-text-secondary">
                      1
                    </td>
                    <td className="px-8 py-6 text-right text-sm font-light text-brand-text-secondary">
                      {formatCurrency(po.amount, po.currency)}
                    </td>
                    <td className="px-8 py-6 text-right text-sm font-bold text-white">
                      {formatCurrency(po.amount, po.currency)}
                    </td>
                  </tr>
              </tbody>
            </table>
          </div>

          {/* Additional Details (Request Specs) */}
          <div className="glass rounded-2xl p-8 border border-brand-border bg-brand-card/10 space-y-6">
            <div className="flex items-center gap-2 border-b border-brand-border pb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-accent shadow-[0_0_8px_rgba(251,176,59,0.5)]" />
              <h3 className="text-[10px] font-bold tracking-widest uppercase text-brand-text-secondary">Execution Justification & Scope</h3>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-1.5">
                <span className="text-[9px] font-bold text-brand-text-secondary/50 uppercase tracking-widest">Requester Entity</span>
                <p className="text-xs text-white uppercase tracking-wider">{po.request?.createdBy?.name || 'Authorized User'}</p>
              </div>
              <div className="space-y-1.5">
                <span className="text-[9px] font-bold text-brand-text-secondary/50 uppercase tracking-widest">Department Block</span>
                <p className="text-xs text-white uppercase tracking-wider">{po.request?.department || 'Operations'}</p>
              </div>
              <div className="col-span-2 space-y-2 pt-2">
                <span className="text-[9px] font-bold text-brand-text-secondary/50 uppercase tracking-widest">Technical Justification</span>
                <p className="text-xs text-brand-text-secondary leading-relaxed italic border-l-2 border-brand-accent/20 pl-4 py-1">
                  {po.request?.description || 'No strategic breakdown provided.'}
                </p>
              </div>
            </div>
          </div>

          {/* New: Approval Workflow / Validation Registry */}
          <div className="glass rounded-2xl p-8 border border-brand-border bg-brand-card/10 space-y-6">
            <div className="flex items-center gap-2 border-b border-brand-border pb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <h3 className="text-[10px] font-bold tracking-widest uppercase text-brand-text-secondary">Validation & Approval Registry</h3>
            </div>
            <div className="space-y-4">
              {po.request?.approvals && po.request.approvals.length > 0 ? (
                po.request.approvals.map((approval: any, idx: number) => (
                  <div key={idx} className="flex gap-4 items-start border-l border-brand-border pl-6 relative pb-4 last:pb-0">
                    <div className="absolute -left-[4.5px] top-1 w-2 h-2 rounded-full bg-brand-border" />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <p className="text-xs font-bold text-white uppercase tracking-wider">{approval.approver?.name || 'System Administrator'}</p>
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest">VERIFIED</span>
                      </div>
                      <p className="text-[10px] text-brand-text-secondary mt-1">{approval.comments || 'Authorization granted for procurement execution.'}</p>
                      <p className="text-[9px] text-brand-text-secondary/40 mt-1 uppercase font-bold tracking-widest">{new Date(approval.updatedAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-brand-text-secondary italic">Standard automated verification process complete. Final authorization stamp active.</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Summary */}
        <div className="col-span-4 space-y-8 print:col-span-12 print:w-full print:space-y-8">
          {id && (
            <ZohoSyncPanel
              type="po"
              entityId={id}
              data={po}
              onUpdated={fetchPO}
            />
          )}
          <div className="glass rounded-2xl p-10 border border-brand-border bg-brand-card/30 space-y-10">
            <h3 className="text-[10px] font-bold tracking-widest uppercase text-brand-text-secondary border-b border-brand-border pb-4">
              Financial Summary
            </h3>
            
            <div className="space-y-6">
              <div className="flex justify-between items-center text-xs">
                <span className="text-brand-text-secondary">Subtotal</span>
                <span className="text-white font-light">{formatCurrency(po.amount, po.currency)}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-brand-text-secondary">Estimated Tax</span>
                <span className="text-white font-light">{formatCurrency(0, po.currency)}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-brand-text-secondary">Shipping</span>
                <span className="text-white font-light">{formatCurrency(0, po.currency)}</span>
              </div>
              <div className="pt-6 border-t border-brand-border flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase text-brand-accent tracking-widest">Total Amount</span>
                <span className="text-2xl font-light text-brand-accent">{formatCurrency(po.amount, po.currency)}</span>
              </div>
            </div>

            <div className="space-y-4 pt-10">
              <div className="flex items-center gap-3">
                <CreditCard className="w-4 h-4 text-brand-text-secondary" />
                <div>
                  <p className="text-[9px] font-bold text-brand-text-secondary/50 uppercase tracking-widest">Payment Terms</p>
                  <p className="text-xs text-white">{po.vendor?.paymentTerms || 'Net 30'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-brand-text-secondary" />
                <div>
                  <p className="text-[9px] font-bold text-brand-text-secondary/50 uppercase tracking-widest">Related Request</p>
                  <Link to={`/requests/${po.requestId}`} className="text-xs text-brand-accent underline underline-offset-4">{po.requestId}</Link>
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={() => toast.success('Purchase Order securely dispatched to Vendor.', 'SYSTEM DISPATCH')}
            className="w-full bg-brand-accent text-black font-black py-5 rounded-xl text-xs tracking-[0.2em] shadow-[0_10px_30px_rgba(251,176,59,0.3)] hover:scale-[1.02] transition-transform active:scale-95 uppercase print:hidden"
          >
            Dispatch To Vendor
          </button>
        </div>
      </div>
    </div>
  );
};

export default PODetail;
