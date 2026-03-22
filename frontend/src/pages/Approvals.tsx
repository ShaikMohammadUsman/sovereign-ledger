import React from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';

const Approvals: React.FC = () => {
  const pendingApprovals = [
    { id: 'REQ-2409-001', title: 'MacBook Pro M3 Max', requester: 'Julian Vane (CTO)', amount: 42850, urgency: 'HIGH', date: 'Sep 24, 2024', status: 'In Review' },
    { id: 'REQ-2409-004', title: 'Adobe Creative Cloud Team', requester: 'Sarah Miller (Design)', amount: 2400, urgency: 'MEDIUM', date: 'Sep 23, 2024', status: 'Manager Review' },
    { id: 'REQ-2409-005', title: 'Cloud Hosting Renewal', requester: 'David Chen (IT)', amount: 15400, urgency: 'HIGH', date: 'Sep 23, 2024', status: 'Finance Approval' },
  ];

  const authorizationVolume = [
    { label: 'Authorized this month', value: '$842,500', icon: CheckCircle2, color: 'text-emerald-500' },
    { label: 'Pending budget check', value: '$24,000', icon: Clock, color: 'text-amber-500' },
    { label: 'Rejected / Stalled', value: '$12,400', icon: AlertTriangle, color: 'text-rose-500' },
  ];

  return (
    <div className="space-y-12 pb-20 font-sans">
      <div className="flex items-center justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-4 text-[10px] font-bold tracking-widest text-brand-text-secondary uppercase">
             <span>Authorization</span>
             <ChevronRight className="w-3 h-3 text-brand-text-secondary/50" />
             <span className="text-brand-accent">Approval Queue</span>
          </div>
          <h1 className="text-5xl font-light text-white tracking-tight">Authorization Portal</h1>
          <p className="text-brand-text-secondary text-sm font-medium uppercase tracking-widest">
             Review and validate enterprise-wide procurement requests
          </p>
        </div>

        <div className="bg-brand-accent/5 border border-brand-accent/20 rounded-2xl p-6 flex items-center gap-6">
           <div className="space-y-1">
             <p className="text-[9px] font-black text-brand-text-secondary uppercase tracking-[0.2em] opacity-60">Session Audit</p>
             <p className="text-xs font-bold text-white uppercase tracking-widest">Administrator: Marcus Thorne</p>
           </div>
           <ShieldCheck className="w-6 h-6 text-brand-accent animate-pulse" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {authorizationVolume.map((stat, i) => (
          <div key={i} className="glass rounded-2xl p-8 border border-brand-border bg-brand-sidebar/50">
            <div className="flex items-center gap-3">
              <stat.icon className={cn("w-4 h-4", stat.color)} />
              <span className="text-[9px] font-black text-brand-text-secondary uppercase tracking-[0.2em]">
                {stat.label}
              </span>
            </div>
            <p className="mt-4 text-3xl font-light text-white tracking-tighter">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-8">
        <div className="flex items-center justify-between border-b border-brand-border pb-4">
          <h3 className="text-[10px] font-black tracking-[0.3em] uppercase text-brand-text-secondary">
             Pending Authorization Queue
          </h3>
          <span className="text-[9px] font-bold text-brand-text-secondary/50 uppercase tracking-widest">
            {pendingApprovals.length} ITEMS REQUIRING ACTION
          </span>
        </div>

        <div className="space-y-6">
          {pendingApprovals.map((item) => (
            <div key={item.id} className="glass rounded-3xl border border-brand-border hover:border-brand-accent/50 transition-all duration-300 overflow-hidden bg-brand-card/20 relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/3 blur-[60px]" />
              
              <div className="p-8 lg:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="flex gap-8 items-start">
                   <div className="space-y-2">
                     <p className="text-[10px] text-brand-accent font-black tracking-widest uppercase">{item.id}</p>
                     <h4 className="text-xl font-medium text-white tracking-tight group-hover:text-brand-accent transition-colors">
                       {item.title}
                     </h4>
                     <p className="text-[10px] text-brand-text-secondary font-bold uppercase tracking-widest flex items-center gap-2">
                       By {item.requester} · {item.date}
                     </p>
                   </div>
                </div>

                <div className="flex flex-col lg:items-end gap-3 text-right">
                   <span className="text-3xl font-light text-white tracking-tighter shadow-brand-accent/20">
                     {formatCurrency(item.amount)}
                   </span>
                   <div className={cn(
                     "text-[9px] font-black px-3 py-1.5 rounded-full tracking-[0.2em] border uppercase w-fit lg:ml-auto",
                     item.urgency === 'HIGH' ? "border-rose-500/40 bg-rose-500/10 text-rose-400" :
                     "border-brand-accent/40 bg-brand-accent/10 text-brand-accent"
                   )}>
                     Urgency: {item.urgency}
                   </div>
                </div>

                <div className="flex items-center gap-4 lg:pl-10 lg:border-l border-brand-border">
                   <button className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-black transition-all group/btn">
                     <CheckCircle2 className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                   </button>
                   <button className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500 hover:text-black transition-all group/btn">
                     <XCircle className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                   </button>
                   <button className="p-4 rounded-xl bg-brand-card border border-brand-border text-brand-text-secondary hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest flex items-center gap-3">
                     <MessageSquare className="w-4 h-4" />
                     Comment
                   </button>
                   <button className="p-4 rounded-xl bg-brand-accent text-black hover:scale-105 transition-all text-sm shadow-[0_0_20px_rgba(251,176,59,0.2)]">
                     <ArrowRight className="w-5 h-5" />
                   </button>
                </div>
              </div>

              <div className="h-1 w-0 group-hover:w-full bg-brand-accent/30 transition-all duration-700" />
            </div>
          ))}
        </div>

        <button className="w-full py-6 border border-dashed border-brand-border rounded-3xl text-[10px] font-black text-brand-text-secondary/40 uppercase tracking-[0.5em] hover:border-brand-accent hover:text-brand-accent transition-all duration-300">
           Review Authorization History
        </button>
      </div>
    </div>
  );
};

export default Approvals;
