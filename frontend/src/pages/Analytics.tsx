import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  PieChart, 
  Target,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';

const Analytics: React.FC = () => {
  const kpis = [
    { label: 'Total Procured', value: '$842,500', trend: '+12.4%', up: true },
    { label: 'Avg. Cycle Time', value: '4.2 Days', trend: '-18%', up: false },
    { label: 'Budget Utilization', value: '68.4%', trend: 'Optimal', up: true },
    { label: 'Active Contracts', value: '142', trend: '+24', up: true },
  ];

  return (
    <div className="space-y-12 pb-20 font-sans">
      <div className="space-y-4">
        <div className="flex items-center gap-4 text-[10px] font-bold tracking-widest text-brand-text-secondary uppercase">
           <span>Intelligence</span>
           <ChevronRight className="w-3 h-3 text-brand-text-secondary/50" />
           <span className="text-brand-accent">Consolidated Analytics</span>
        </div>
        <h1 className="text-5xl font-light text-white tracking-tight">Financial Intelligence</h1>
        <p className="text-brand-text-secondary text-sm font-medium uppercase tracking-widest">
           Procurement performance, spend velocity, and capital efficiency
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <div key={i} className="glass rounded-2xl p-8 border border-brand-border bg-brand-sidebar/30">
            <p className="text-[10px] font-black text-brand-text-secondary uppercase tracking-widest mb-6">{kpi.label}</p>
            <div className="flex items-end justify-between">
              <h3 className="text-3xl font-light text-white tracking-tighter">{kpi.value}</h3>
              <div className={cn(
                "flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-tighter",
                kpi.up ? "text-emerald-400 bg-emerald-500/10" : "text-rose-400 bg-rose-500/10"
              )}>
                {kpi.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {kpi.trend}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-10">
        {/* Main Spending Chart Mockup */}
        <div className="col-span-12 lg:col-span-8 glass rounded-3xl p-10 border border-brand-border bg-brand-card/20 min-h-[450px] relative overflow-hidden">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em]">Spend Velocity (Fiscal 2024)</h3>
              <p className="text-[10px] text-brand-text-secondary uppercase tracking-widest opacity-50 mt-1">MONTHLY PROJECTION VS ACTUAL</p>
            </div>
            <div className="flex gap-4">
               {[2024, 2023].map(yr => (
                 <button key={yr} className={cn(
                   "text-[10px] font-black px-6 py-2 rounded-lg tracking-widest uppercase transition-all",
                   yr === 2024 ? "bg-brand-accent text-black" : "bg-white/5 text-brand-text-secondary hover:text-white"
                 )}>{yr}</button>
               ))}
            </div>
          </div>

          {/* Abstract Chart Bars */}
          <div className="h-64 flex items-end justify-between gap-4 mt-12 px-4">
            {[45, 67, 32, 89, 54, 76, 43, 91, 58, 82, 63, 71].map((h, i) => (
              <div key={i} className="flex-1 group relative">
                <div 
                  className="w-full bg-brand-accent/20 border-t border-brand-accent/50 rounded-t-lg transition-all duration-700 hover:bg-brand-accent/40 group-hover:h-[80%] cursor-crosshair relative"
                  style={{ height: `${h}%` }}
                >
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-brand-accent text-black text-[9px] font-black px-2 py-1 rounded">
                    ${(h * 1.2).toFixed(1)}k
                  </div>
                </div>
                <div className="mt-4 text-center text-[9px] font-bold text-brand-text-secondary/40 uppercase tracking-tighter">
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i]}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Spend by Category */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
           <div className="glass rounded-3xl p-10 border border-brand-border bg-brand-card/30 space-y-8">
              <h3 className="text-xs font-bold text-white uppercase tracking-[0.2em] flex items-center gap-3">
                <PieChart className="w-4 h-4 text-brand-accent" />
                Capital Allocation
              </h3>
              
              <div className="space-y-6">
                 {[
                   { label: 'Technology', val: 56, color: 'bg-brand-accent' },
                   { label: 'Logistics', val: 24, color: 'bg-sky-500' },
                   { label: 'Personnel', val: 12, color: 'bg-emerald-500' },
                   { label: 'Other', val: 8, color: 'bg-stone-500' }
                 ].map((cat, i) => (
                   <div key={i} className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                        <span className="text-brand-text-secondary">{cat.label}</span>
                        <span className="text-white">{cat.val}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className={cn("h-full transition-all duration-1000", cat.color)} style={{ width: `${cat.val}%` }} />
                      </div>
                   </div>
                 ))}
              </div>

               <div className="pt-6 border-t border-brand-border">
                  <button className="w-full py-4 bg-brand-accent/10 hover:bg-brand-accent/20 border border-brand-accent/30 rounded-2xl text-[10px] font-black text-brand-accent uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 group">
                    Generate Export
                    <ExternalLink className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </button>
               </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
