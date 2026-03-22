import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  ArrowUpRight,
  Plus,
  Filter,
  Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn, formatCurrency } from '@/lib/utils';
import { requestService, poService } from '../services/api';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<any[]>([]);
  const [pos, setPos] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [reqRes, poRes] = await Promise.all([
          requestService.getAll(),
          poService.getAll().catch(() => ({ data: [] }))
        ]);
        if (reqRes.data) setRequests(reqRes.data);
        if (poRes.data) setPos(poRes.data);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      }
    };
    loadData();
  }, []);

  const totalSpend = requests.filter(r => r.status === 'APPROVED' || r.status === 'PO_CREATED').reduce((sum, r) => sum + r.amount, 0);
  const pendingCount = requests.filter(r => r.status === 'IN REVIEW' || r.status === 'SUBMITTED' || r.status === 'PENDING').length;

  const stats = [
    { label: 'Pending Approvals', value: pendingCount.toString(), icon: Clock, color: 'text-amber-500', trend: 'Needs action' },
    { label: 'Approved & POs', value: requests.filter(r => r.status === 'APPROVED' || r.status === 'PO_CREATED').length.toString(), icon: CheckCircle2, color: 'text-emerald-500', trend: 'Active' },
    { label: 'Total Approved Spend', value: formatCurrency(totalSpend), icon: TrendingUp, color: 'text-brand-accent', trend: 'All Time' },
  ];

  const recentRequests = requests.slice(0, 5);

  return (
    <div className="space-y-12">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-light text-white tracking-tight">Executive Dashboard</h1>
          <p className="text-brand-text-secondary mt-2 text-sm uppercase tracking-widest font-medium">
            Procurement & Spend Management Overview
          </p>
        </div>
        <div className="text-[9px] font-bold text-brand-text-secondary/50 uppercase tracking-[0.3em]">
          DATA SYNC: LIVE · 2024.09.24
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="glass rounded-2xl p-8 border border-brand-border bg-gradient-to-br from-white/5 to-transparent flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className={cn("p-2 rounded-lg bg-current/10", stat.color)}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-brand-text-secondary/50 uppercase tracking-widest">
                {stat.trend}
              </span>
            </div>
            <div className="mt-8 space-y-1">
              <span className="text-[10px] font-bold text-brand-text-secondary uppercase tracking-[0.2em]">
                {stat.label}
              </span>
              <p className="text-4xl font-light text-white tracking-tight">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Recent POs Table */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-brand-text-secondary">
              Recent Purchase Orders
            </h3>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-brand-text-secondary/50" />
                <input 
                  type="text" 
                  placeholder="SEARCH ORDERS..." 
                  className="bg-brand-sidebar border border-brand-border rounded-lg pl-9 pr-4 py-2 text-[10px] font-bold tracking-widest text-white focus:outline-none focus:border-brand-accent w-64 uppercase"
                />
              </div>
              <Filter onClick={() => alert('Filter applied.')} className="w-4 h-4 text-brand-text-secondary cursor-pointer hover:text-brand-accent transition-colors" />
            </div>
          </div>

          <div className="glass rounded-2xl border border-brand-border overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-brand-sidebar/50 border-b border-brand-border">
                  <th className="px-6 py-4 text-[9px] font-black text-brand-text-secondary uppercase tracking-widest">PO Number</th>
                  <th className="px-6 py-4 text-[9px] font-black text-brand-text-secondary uppercase tracking-widest">Request Title</th>
                  <th className="px-6 py-4 text-[9px] font-black text-brand-text-secondary uppercase tracking-widest">Vendor</th>
                  <th className="px-6 py-4 text-[9px] font-black text-brand-text-secondary uppercase tracking-widest">Amount</th>
                  <th className="px-6 py-4 text-[9px] font-black text-brand-text-secondary uppercase tracking-widest">Date</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {pos.slice(0, 10).map((po) => (
                  <tr 
                    key={po.id} 
                    onClick={() => navigate(`/purchase-orders/${po.id}`)}
                    className="hover:bg-white/5 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-5 text-[10px] font-bold text-brand-accent uppercase">{po.poNumber}</td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-medium text-white">{po.request?.title || 'Unknown Req'}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-xs text-brand-text-secondary font-medium">{po.vendor?.name || 'Unknown'}</span>
                    </td>
                    <td className="px-6 py-5 font-light text-white">
                      {formatCurrency(po.amount)}
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-[10px] font-bold text-brand-text-secondary uppercase tracking-widest">
                        {new Date(po.date).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowUpRight className="w-4 h-4 text-brand-accent ml-auto" />
                    </td>
                  </tr>
                ))}
                {pos.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-[10px] font-bold text-brand-text-secondary/50 uppercase tracking-widest">
                      No Purchase Orders Found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Spend by Department (Sidebar in Dashboard) */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-brand-text-secondary">
            Spend Distribution
          </h3>
          <div className="glass rounded-2xl p-8 border border-brand-border bg-brand-card/30 space-y-8">
            {[
              { label: 'Infrastructure', amount: 154000, color: 'bg-brand-accent' },
              { label: 'Cloud Services', amount: 82500, color: 'bg-emerald-500' },
              { label: 'Executive Ops', amount: 106350, color: 'bg-amber-500' },
            ].map((dept, i) => (
              <div key={i} className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest">{dept.label}</span>
                  <span className="text-xs font-light text-brand-text-secondary">{formatCurrency(dept.amount)}</span>
                </div>
                <div className="h-1.5 w-full bg-brand-border rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full rounded-full transition-all duration-1000", dept.color)}
                    style={{ width: `${(dept.amount / 342850) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            
            <button onClick={() => navigate('/analytics')} className="w-full mt-4 py-3 border border-dashed border-brand-border rounded-xl text-[10px] font-bold text-brand-text-secondary uppercase tracking-widest hover:border-brand-accent hover:text-white transition-all">
              View All Departments
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
