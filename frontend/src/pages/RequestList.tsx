import React, { useEffect, useState } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  ChevronRight,
  ArrowUpRight,
  Zap,
  Star,
  Users,
  X,
  Building,
  ArrowRight,
  MoreVertical,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn, formatCurrency } from '@/lib/utils';
import { requestService } from '@/services/api';
import { useToast } from '@/context/ToastContext';

const RequestList: React.FC = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await requestService.getAll();
        if (response.data) {
          setRequests(response.data);
        }
      } catch (error) {
        console.error("Failed to load ledger records", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'APPROVED': 
      case 'PO_CREATED':
        return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
      case 'IN REVIEW': 
      case 'PENDING':
        return "border-brand-accent/30 bg-brand-accent/10 text-brand-accent";
      case 'REJECTED': return "border-rose-500/30 bg-rose-500/10 text-rose-400";
      case 'DRAFT': return "border-brand-text-secondary/30 bg-brand-text-secondary/10 text-brand-text-secondary";
      case 'SUBMITTED': return "border-sky-500/40 bg-sky-500/10 text-sky-300";
      default: return "border-brand-border bg-brand-sidebar text-brand-text-secondary";
    }
  };

  return (
    <div className="space-y-12 pb-20 font-sans">
      <div className="flex items-center justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-4 text-[10px] font-bold tracking-widest text-brand-text-secondary uppercase">
             <span>Requisitions</span>
             <ChevronRight className="w-3 h-3 text-brand-text-secondary/50" />
             <span className="text-brand-accent">Request Ledger</span>
          </div>
          <h1 className="text-5xl font-light text-white tracking-tight">Procurement Ledger</h1>
          <p className="text-brand-text-secondary text-sm font-medium uppercase tracking-widest">
             Centralized management of enterprise procurement and expenditure requests
          </p>
        </div>

        <button 
          onClick={() => navigate('/requests/new')}
          className="bg-brand-accent text-black px-8 py-4 rounded-xl text-[11px] font-black uppercase tracking-[0.3em] hover:bg-brand-accent/90 transition-all shadow-[0_0_25px_rgba(251,176,59,0.2)] flex items-center gap-4 group"
        >
          Create Requisition
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6 flex-1 max-w-2xl">
            <div className="relative group flex-1">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-secondary/30 group-focus-within:text-brand-accent transition-colors" />
              <input 
                type="text" 
                placeholder="SEARCH LEDGER ID / TITLE..." 
                className="w-full bg-brand-sidebar border border-brand-border rounded-2xl pl-16 pr-6 py-4 text-[10px] font-bold tracking-widest text-white focus:outline-none focus:border-brand-accent transition-all uppercase placeholder-brand-text-secondary/20"
              />
            </div>
            
            <div className="flex gap-4">
               <button className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-brand-card/30 border border-brand-border text-brand-text-secondary hover:text-white transition-all text-[10px] font-black uppercase tracking-widest">
                 <Filter className="w-4 h-4" />
                 Active Only
               </button>
               <button className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-brand-card/30 border border-brand-border text-brand-text-secondary hover:text-white transition-all text-[10px] font-black uppercase tracking-widest">
                 <Clock className="w-4 h-4" />
                 Recent
               </button>
            </div>
          </div>
        </div>

        <div className="glass rounded-3xl border border-brand-border/50 overflow-hidden bg-brand-card/10 shadow-2xl backdrop-blur-3xl relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/5 blur-[100px] pointer-events-none" />
          
          <table className="w-full text-left relative">
            <thead>
              <tr className="bg-brand-sidebar/80 border-b border-brand-border/50 backdrop-blur-3xl">
                <th className="px-10 py-6 text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.3em]">Ledger ID</th>
                <th className="px-10 py-6 text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.3em]">Request Identity</th>
                <th className="px-10 py-6 text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.3em]">Supply Entity</th>
                <th className="px-10 py-6 text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.3em]">Department</th>
                <th className="px-10 py-6 text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.3em]">Value</th>
                <th className="px-10 py-6 text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.3em]">Status</th>
                <th className="px-10 py-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/20">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-10 py-20 text-center">
                     <AlertCircle className="w-8 h-8 text-brand-accent animate-spin mx-auto mb-4 opacity-50" />
                     <p className="text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.4em]">Synchronizing Registry...</p>
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-10 py-20 text-center">
                     <FileText className="w-8 h-8 text-brand-text-secondary mx-auto mb-4 opacity-20" />
                     <p className="text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.4em]">No Requisition Records Found</p>
                  </td>
                </tr>
              ) : requests.map((req) => (
                <tr 
                  key={req.id} 
                  onClick={() => navigate(`/requests/${req.id}`)}
                  className="hover:bg-white/5 transition-all group cursor-pointer"
                >
                  <td className="px-10 py-8">
                    <p className="text-[10px] text-brand-accent/50 font-black tracking-widest uppercase truncate max-w-[80px]">{req.id.substring(req.id.length - 6)}</p>
                    <p className="text-[9px] text-brand-text-secondary/40 font-bold uppercase mt-1 tracking-widest">{new Date(req.createdAt).toLocaleDateString()}</p>
                  </td>
                  <td className="px-10 py-8">
                    <span className="text-base font-medium text-white tracking-wide group-hover:text-brand-accent transition-colors">{req.title}</span>
                  </td>
                  <td className="px-10 py-8">
                    <span className="text-xs text-brand-text-secondary font-medium uppercase tracking-widest truncate max-w-[150px]">{req.vendor?.name || 'N/A'}</span>
                  </td>
                  <td className="px-10 py-8">
                    <span className="text-[10px] font-bold text-brand-text-secondary uppercase tracking-widest border border-brand-border px-3 py-1 rounded bg-white/3">
                      {req.department}
                    </span>
                  </td>
                  <td className="px-10 py-8">
                    <p className="text-base font-medium text-white tracking-tighter">{formatCurrency(req.amount, req.currency)}</p>
                  </td>
                  <td className="px-10 py-8">
                    <span className={cn(
                      "text-[9px] font-black px-3 py-1.5 rounded-full tracking-[0.2em] border uppercase flex items-center gap-2 w-fit",
                      getStatusStyle(req.status)
                    )}>
                      {req.status === 'IN REVIEW' && <div className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse" />}
                      {req.status === 'APPROVED' && <CheckCircle2 className="w-3 h-3" />}
                      {req.status === 'REJECTED' && <XCircle className="w-3 h-3" />}
                      {req.status}
                    </span>
                  </td>
                  <td className="px-10 py-8 text-right">
                     <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-[-10px]">
                        <button className="p-3 bg-brand-card hover:bg-white/10 rounded-lg border border-brand-border transition-all">
                          <MoreVertical className="w-4 h-4 text-brand-text-secondary" />
                        </button>
                        <ArrowUpRight className="w-5 h-5 text-brand-accent ml-2" />
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-10">
          <p className="text-[10px] font-bold text-brand-text-secondary/30 uppercase tracking-[0.3em]">
            SYSTEM RECORD SYNCED · 2024.09.24.14:02.UTC
          </p>
          <div className="flex gap-4">
             <button onClick={() => toast.info('Synchronizing Archive: Loading previous phase records...', 'DATA RETRIEVAL')} className="px-6 py-3 text-[10px] font-black text-brand-text-secondary/50 uppercase tracking-widest border border-brand-border rounded-xl hover:text-white hover:border-brand-text-secondary transition-all">Previous Phase</button>
             <div className="flex gap-2">
               {[1, 2, 3].map(page => (
                 <button key={page} onClick={() => toast.info(`Accessing Registry Page ${page}...`, 'LEDGER NAVIGATION')} className={cn(
                   "w-10 h-10 rounded-lg text-[10px] font-black border transition-all",
                   page === 1 ? "bg-brand-accent text-black border-brand-accent" : "border-brand-border text-brand-text-secondary/50 hover:border-brand-text-secondary hover:text-white"
                 )}>{page}</button>
               ))}
             </div>
             <button onClick={() => toast.info('Synchronizing Archive: Loading next phase records...', 'DATA RETRIEVAL')} className="px-6 py-3 text-[10px] font-black text-brand-accent uppercase tracking-widest border border-brand-accent rounded-xl hover:bg-brand-accent hover:text-black transition-all">Next Phase</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestList;
