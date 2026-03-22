import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FileText,
  Users,
  CreditCard,
  Settings,
  Bell,
  History,
  HelpCircle,
  PlusCircle,
  Lightbulb,
  LogOut,
  ChevronRight,
  User,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Fingerprint,
  Briefcase,
  X
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { useToast } from '../../context/ToastContext';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Requests', path: '/requests', icon: FileText },
  { name: 'Vendors', path: '/vendors', icon: Users },
  { name: 'Purchase Orders', path: '/purchase-orders', icon: CreditCard },
  { name: 'AI Insights', path: '/ai-insights', icon: Lightbulb },
  { name: 'Settings', path: '/settings', icon: Settings },
];

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const toast = useToast();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const isAdmin = user?.role === 'ADMIN';
  const isFinance = user?.role === 'FINANCE_MANAGER';
  const isProcurement = user?.role === 'PROCUREMENT_OFFICER';
  const isAuthorized = isAdmin || isFinance || isProcurement;

  return (
    <div className="flex h-screen bg-brand-bg text-brand-text-primary overflow-hidden font-sans">
      {/* Sidebar */}
      <aside id="app-sidebar" className="w-64 bg-sidebar flex flex-col border-r border-brand-border shrink-0 print:hidden">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-10">
            <div className="w-8 h-8 rounded-lg bg-brand-accent flex items-center justify-center text-black font-bold">
              SL
            </div>
            <span className="font-bold tracking-widest text-lg uppercase">Sovereign Ledger</span>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-sm",
                    isActive
                      ? "bg-brand-accent/10 text-brand-accent border-l-4 border-brand-accent"
                      : "text-brand-text-secondary hover:bg-white/5 hover:text-white"
                  )
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium tracking-wide uppercase text-[11px]">{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 space-y-4">
          <button 
            onClick={() => navigate('/ai-insights')}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl bg-brand-accent/10 border border-brand-accent/30 text-brand-accent text-sm font-medium hover:bg-brand-accent/20 transition-all group"
          >
            <Sparkles className="w-5 h-5" />
            <span className="uppercase text-[11px] font-bold tracking-widest">Neural Insights</span>
            <div className="ml-auto w-2 h-2 rounded-full bg-brand-accent animate-pulse" />
          </button>

          <div className="pt-4 border-t border-brand-border space-y-1">
            <button onClick={() => toast.info('Support Portal is not currently available in this environment.', 'SYSTEM ACCESS')} className="flex items-center gap-3 px-4 py-3 w-full text-brand-text-secondary hover:text-white transition-colors text-xs uppercase tracking-wider">
              <HelpCircle className="w-4 h-4" />
              <span>Support</span>
            </button>
            <button onClick={() => { logout(); navigate('/login'); }} className="flex items-center gap-3 px-4 py-3 w-full text-brand-text-secondary hover:text-white transition-colors text-xs uppercase tracking-wider">
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden print:overflow-visible">
        {/* Top Header */}
        <header id="app-header" className="h-20 border-b border-brand-border flex items-center justify-between px-8 bg-brand-bg/50 backdrop-blur-md z-10 print:hidden">
          <div className="flex items-center gap-8">
            <div className="flex gap-6 text-[11px] font-bold uppercase tracking-widest text-brand-text-secondary">
              <span 
                className={cn("cursor-pointer pb-1 transition-all", location.pathname === '/analytics' ? "text-white border-b border-brand-accent px-1" : "hover:text-white")} 
                onClick={() => navigate('/analytics')}
              >
                Analytics
              </span>
              <span className={cn("cursor-pointer pb-1 transition-all", (location.pathname === '/' || location.pathname === '/dashboard') ? "text-white border-b border-brand-accent px-1" : "hover:text-white")}>
                Contracts
              </span>
              <span 
                className={cn("cursor-pointer pb-1 transition-all", location.pathname === '/global-sourcing' ? "text-white border-b border-brand-accent px-1" : "hover:text-white")} 
                onClick={() => navigate('/global-sourcing')}
              >
                Global Sourcing
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 text-brand-text-secondary">
              <Bell className="w-5 h-5 hover:text-white cursor-pointer" onClick={() => toast.success('You have 3 new requisition updates.', 'NOTIFICATIONS')} />
              <History className="w-5 h-5 hover:text-white cursor-pointer" onClick={() => toast.info('Loading Request History...', 'SYSTEM RECORDS')} />
              <HelpCircle className="w-5 h-5 hover:text-white cursor-pointer" onClick={() => toast.info('Opening Help Center...', 'KNOWLEDGE BASE')} />
            </div>

            <button
               onClick={() => navigate('/requests/new')}
               className="bg-brand-accent text-black px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-brand-accent/90 transition-all shadow-lg hover:shadow-brand-accent/20"
            >
              New Requisition
            </button>

            <div className="relative">
              <div 
                onClick={() => setIsProfileOpen(!isProfileOpen)} 
                className={cn(
                  "w-10 h-10 rounded-full border flex items-center justify-center bg-brand-card hover:border-brand-accent cursor-pointer transition-all",
                  isProfileOpen ? "border-brand-accent shadow-[0_0_15px_rgba(251,176,59,0.3)]" : "border-brand-border"
                )}
              >
                <User className="w-5 h-5 text-brand-accent" />
              </div>

              <AnimatePresence>
                {isProfileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-4 w-72 border border-brand-border rounded-[24px] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.8)] z-50 bg-[#0B0E14] group"
                    >
                      <button 
                        onClick={(e) => { e.stopPropagation(); setIsProfileOpen(false); }}
                        className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/5 text-brand-text-secondary hover:text-white transition-all z-[60]"
                      >
                         <X className="w-3.5 h-3.5" />
                      </button>
                      
                      <div className="flex flex-col items-center text-center space-y-4">
                        <div className="w-16 h-16 rounded-full border-2 border-brand-accent/30 p-1 flex items-center justify-center bg-brand-accent/5">
                           <div className="w-full h-full rounded-full bg-brand-accent flex items-center justify-center text-black font-black text-xl">
                             {user?.name?.charAt(0) || 'U'}
                           </div>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-bold text-white uppercase tracking-widest">{user?.name}</h3>
                          <p className="text-[10px] text-brand-text-secondary uppercase tracking-[0.2em] mt-1 italic">{user?.position || 'Strategic Procurement Analyst'}</p>
                        </div>

                        <div className="w-full space-y-2 pt-4 border-t border-brand-border">
                          <div className="flex items-center justify-between text-[9px] uppercase tracking-widest text-brand-text-secondary">
                             <span>Employee ID</span>
                             <span className="text-white font-bold">{user?.employeeId || 'VX-00124'}</span>
                          </div>
                          <div className="flex items-center justify-between text-[9px] uppercase tracking-widest text-brand-text-secondary">
                             <span>Department</span>
                             <span className="text-white font-bold">{user?.department}</span>
                          </div>
                        </div>

                        <div className={cn(
                          "w-full p-3 rounded-xl border flex items-center gap-3 transition-all",
                          isAuthorized 
                            ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400" 
                            : "bg-brand-sidebar border-brand-border text-brand-text-secondary/50"
                        )}>
                           {isAuthorized ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                           <div className="text-left">
                              <p className="text-[8px] font-black uppercase tracking-[0.2em]">Clearance Tier 0{isAdmin ? '4' : isFinance || isProcurement ? '3' : '1'}</p>
                              <p className="text-[10px] font-bold uppercase tracking-widest">{isAuthorized ? 'AUTHORIZED PERSONNEL' : 'RESTRICTED ACCESS'}</p>
                           </div>
                        </div>

                        <button 
                          onClick={() => { logout(); navigate('/login'); }}
                          className="w-full py-3 rounded-xl bg-white/5 border border-brand-border text-[9px] font-black uppercase tracking-[0.3em] hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-400 transition-all flex items-center justify-center gap-2"
                        >
                          <LogOut className="w-3 h-3" /> Terminate Session
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto bg-[radial-gradient(circle_at_top_right,rgba(251,176,59,0.05),transparent_40%)] print:overflow-visible print:bg-none">
          <div className="max-w-7xl mx-auto p-8 print:p-0">
            {children}
          </div>
        </div>

        {/* Footer info bar */}
        <footer className="h-10 border-t border-brand-border flex items-center justify-between px-8 text-[9px] uppercase tracking-widest text-brand-text-secondary/50 print:hidden">
          <span>Confidential Ledger Record #882-VX</span>
          <div className="flex gap-6">
            <span>Encryption: AES-256</span>
            <span>Stamp: 2024.09.24.14:02.UTC</span>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default MainLayout;
