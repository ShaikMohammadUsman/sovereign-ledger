import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CreditCard,
  FileDown, 
  Search, 
  Filter, 
  CheckCircle2,
  Clock,
  ExternalLink,
  Plus
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { poService } from '@/services/api';

const POList: React.FC = () => {
  const navigate = useNavigate();
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPOs = async () => {
      try {
        const response = await poService.getAll();
        setPurchaseOrders(response.data);
      } catch (error) {
        console.error('Failed to fetch POs', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPOs();
  }, []);

  return (
    <div className="space-y-12 pb-20 font-sans">
      <div className="flex items-center justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-4 text-[10px] font-bold tracking-widest text-brand-text-secondary uppercase">
             <span>Treasury</span>
             <ExternalLink className="w-3 h-3 text-brand-text-secondary/50" />
             <span className="text-brand-accent">Purchase Order Archive</span>
          </div>
          <h1 className="text-5xl font-light text-white tracking-tight">Active Commitments</h1>
          <p className="text-brand-text-secondary text-sm font-medium uppercase tracking-widest">
             Issued procurement commitments and financial ledger tracking
          </p>
        </div>

        <button onClick={() => navigate('/requests')} className="bg-brand-accent text-black px-8 py-4 rounded-xl text-[11px] font-black uppercase tracking-[0.3em] hover:bg-brand-accent/90 transition-all shadow-[0_0_25px_rgba(251,176,59,0.2)] flex items-center gap-4 group">
          Generate New PO
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="relative group max-w-sm w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-secondary/40 group-focus-within:text-brand-accent transition-colors" />
            <input 
              type="text" 
              placeholder="PO-NUMBER / VENDOR..." 
              className="w-full bg-brand-sidebar border border-brand-border rounded-2xl pl-16 pr-6 py-4 text-[10px] font-bold tracking-widest text-white focus:outline-none focus:border-brand-accent transition-all uppercase placeholder-brand-text-secondary/20"
            />
          </div>
          
          <div className="flex gap-4">
             <button className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-brand-card/30 border border-brand-border text-brand-text-secondary hover:text-white transition-all text-[10px] font-black uppercase tracking-widest">
               <FileDown className="w-4 h-4" />
               Export PDF
             </button>
             <button className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-brand-accent text-black text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">
               Filter Archive
             </button>
          </div>
        </div>

        <div className="glass rounded-3xl border border-brand-border/50 overflow-hidden bg-brand-card/10 shadow-2xl backdrop-blur-3xl">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-brand-sidebar/80 border-b border-brand-border/50">
                <th className="px-10 py-6 text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.3em]">Commitment ID</th>
                <th className="px-10 py-6 text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.3em]">Description</th>
                <th className="px-10 py-6 text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.3em]">Supply Entity</th>
                <th className="px-10 py-6 text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.3em]">Value</th>
                <th className="px-10 py-6 text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.3em]">Issued Date</th>
                <th className="px-10 py-6 text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.3em]">Status</th>
                <th className="px-10 py-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/20">
              {purchaseOrders.map((po) => (
                <tr key={po.id} onClick={() => navigate(`/purchase-orders/${po.id}`)} className="hover:bg-white/3 transition-all group cursor-pointer">
                  <td className="px-10 py-8">
                    <p className="text-[10px] text-brand-accent font-black tracking-widest uppercase">{po.poNumber}</p>
                  </td>
                  <td className="px-10 py-8">
                     <span className="text-sm font-medium text-white tracking-wide">{po.request?.title || 'Req'}</span>
                  </td>
                  <td className="px-10 py-8">
                    <span className="text-xs text-brand-text-secondary font-medium">{po.vendor?.name || 'Unknown'}</span>
                  </td>
                  <td className="px-10 py-8">
                    <span className="text-base font-medium text-white tracking-tight">{formatCurrency(po.amount, po.currency)}</span>
                  </td>
                  <td className="px-10 py-8 text-[11px] text-brand-text-secondary/70">
                    {new Date(po.date || po.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-10 py-8">
                    <span className={cn(
                      "text-[9px] font-black px-3 py-1.5 rounded-full tracking-[0.2em] border uppercase flex items-center gap-2 w-fit",
                      po.status === 'ISSUED' ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" :
                      po.status === 'DELIVERED' ? "border-sky-500/30 bg-sky-500/10 text-sky-400" :
                      po.status === 'CANCELLED' ? "border-rose-500/30 bg-rose-500/10 text-rose-400" :
                      "border-brand-accent/40 bg-brand-accent/10 text-brand-accent"
                    )}>
                      {po.status === 'ISSUED' && <CheckCircle2 className="w-3 h-3 text-emerald-400 animate-pulse" />}
                      {po.status || 'ISSUED'}
                    </span>
                  </td>
                  <td className="px-10 py-8 text-right">
                     <button className="p-3 bg-brand-card hover:bg-brand-accent hover:text-black rounded-lg border border-brand-border transition-all">
                       <FileDown className="w-4 h-4" />
                     </button>
                  </td>
                </tr>
              ))}
              {purchaseOrders.length === 0 && !loading && (
                <tr>
                   <td colSpan={7} className="text-center py-20 text-brand-text-secondary text-[10px] font-bold tracking-widest uppercase">
                     No Purchase Orders Found
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default POList;
