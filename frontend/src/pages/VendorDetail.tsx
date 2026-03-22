import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Mail, 
  Phone, 
  Globe, 
  CreditCard, 
  History,
  ChevronRight,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';

const VendorDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock data
  const vendor = {
    id: id || 'V-001',
    name: 'Apple Enterprise Solutions',
    category: 'Hardware & Infrastructure',
    status: 'ACTIVE',
    contactPerson: 'Tim Cook (Enterprise Sales)',
    email: 'enterprise@apple.com',
    phone: '+1 (800) 275-2273',
    website: 'https://apple.com/business',
    paymentTerms: 'Net 30',
    taxId: 'TX-992-001-B',
    totalSpend: 1542850,
    activeOrders: 2,
    history: [
      { id: 'PO-00001', request: 'MacBook Pro M3 Max', amount: 42850, date: 'Oct 01, 2024', status: 'ISSUED' },
      { id: 'PO-00002', request: 'Vision Pro Dev Kits', amount: 8400, date: 'Sep 15, 2024', status: 'DELIVERED' },
      { id: 'PO-00003', request: 'iPhone 15 Enterprise Hub', amount: 12600, date: 'Aug 20, 2024', status: 'DELIVERED' },
    ]
  };

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
            <span className="text-[10px] font-bold text-brand-text-secondary uppercase tracking-[0.2em]">{vendor.id}</span>
            <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-black px-3 py-1 rounded-full tracking-widest uppercase flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
               {vendor.status}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <button className="px-8 py-4 rounded-xl border border-brand-border text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/5 transition-all">
             Edit Profile
           </button>
           <button className="px-8 py-4 rounded-xl bg-brand-accent text-black text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg">
             New Requisition
           </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-12">
        <div className="col-span-12 lg:col-span-4 space-y-8">
          <div className="glass rounded-3xl p-8 border border-brand-border bg-brand-card/20 space-y-8">
             <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-text-secondary border-b border-brand-border pb-4">Entity Identity</h3>
             
             <div className="space-y-6">
               <div className="space-y-2">
                 <p className="text-[9px] font-black text-brand-text-secondary/50 uppercase tracking-widest">Category</p>
                 <p className="text-sm font-medium text-white">{vendor.category}</p>
               </div>
               <div className="space-y-2">
                 <p className="text-[9px] font-black text-brand-text-secondary/50 uppercase tracking-widest">Tax Identity</p>
                 <p className="text-sm font-medium text-white uppercase">{vendor.taxId}</p>
               </div>
               <div className="space-y-2">
                 <p className="text-[9px] font-black text-brand-text-secondary/50 uppercase tracking-widest">Terms of Payment</p>
                 <p className="text-sm font-medium text-brand-accent">{vendor.paymentTerms}</p>
               </div>
             </div>

             <div className="pt-8 border-t border-brand-border space-y-6">
                <div className="flex items-center gap-4 text-brand-text-secondary hover:text-white transition-colors cursor-pointer group">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-brand-border flex items-center justify-center group-hover:border-brand-accent/50 transition-all">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Direct Liaison</p>
                    <p className="text-xs font-medium">{vendor.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-brand-text-secondary hover:text-white transition-colors cursor-pointer group">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-brand-border flex items-center justify-center group-hover:border-brand-accent/50 transition-all">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Primary Contact</p>
                    <p className="text-xs font-medium">{vendor.phone}</p>
                  </div>
                </div>
             </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-8 space-y-12">
          <div className="grid grid-cols-2 gap-8">
             <div className="glass rounded-3xl p-8 border border-brand-border bg-gradient-to-br from-brand-accent/5 to-transparent">
                <p className="text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.3em] mb-4">Total Life-Cycle Spend</p>
                <p className="text-5xl font-light text-white tracking-tighter">{formatCurrency(vendor.totalSpend)}</p>
             </div>
             <div className="glass rounded-3xl p-8 border border-brand-border bg-white/3">
                <p className="text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.3em] mb-4">Active Commitments</p>
                <p className="text-5xl font-light text-white tracking-tighter">{vendor.activeOrders}</p>
             </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-text-secondary border-b border-brand-border pb-4">Historical Commitments</h3>
            <div className="glass rounded-3xl border border-brand-border overflow-hidden bg-brand-card/10">
               <table className="w-full text-left">
                 <thead>
                   <tr className="bg-brand-sidebar/50 border-b border-brand-border">
                     <th className="px-8 py-5 text-[9px] font-black text-brand-text-secondary uppercase tracking-widest">ID</th>
                     <th className="px-8 py-5 text-[9px] font-black text-brand-text-secondary uppercase tracking-widest">Description</th>
                     <th className="px-8 py-5 text-[9px] font-black text-brand-text-secondary uppercase tracking-widest">Amount</th>
                     <th className="px-8 py-5 text-[9px] font-black text-brand-text-secondary uppercase tracking-widest">Status</th>
                     <th className="px-8 py-5"></th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-brand-border/30">
                   {vendor.history.map((h) => (
                     <tr key={h.id} className="hover:bg-white/3 transition-all group">
                       <td className="px-8 py-6 text-[10px] font-bold text-brand-accent/50 uppercase">{h.id}</td>
                       <td className="px-8 py-6 text-sm font-medium text-white tracking-wide">{h.request}</td>
                       <td className="px-8 py-6 text-base font-medium text-white tracking-tighter">{formatCurrency(h.amount)}</td>
                       <td className="px-8 py-6">
                          <span className={cn(
                            "text-[8px] font-black px-2 py-1 rounded tracking-[0.2em] border uppercase",
                            h.status === 'ISSUED' ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : "border-brand-border bg-white/3 text-brand-text-secondary/50"
                          )}>
                            {h.status}
                          </span>
                       </td>
                       <td className="px-8 py-6 text-right">
                          <ArrowUpRight className="w-4 h-4 text-brand-accent ml-auto opacity-0 group-hover:opacity-100 transition-all group-hover:scale-125" />
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDetail;
