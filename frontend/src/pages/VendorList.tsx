import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Mail,
  Briefcase,
  ChevronRight,
  ArrowUpRight,
  X,
  ShieldCheck,
  Building,
  CreditCard,
  History,
  TrendingUp,
  Globe,
  Phone,
  Loader2
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { vendorService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const VendorList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  const canRegisterVendors = user?.role === 'ADMIN' || user?.role === 'PROCUREMENT_OFFICER';
  
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    email: '',
    phone: '',
    category: '',
    paymentTerms: '',
    location: ''
  });

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const response = await vendorService.getAll();
      setVendors(response.data);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleRegisterVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setRegistering(true);
      await vendorService.create(formData);
      setIsRegisterModalOpen(false);
      setFormData({
        name: '',
        contact: '',
        email: '',
        phone: '',
        category: '',
        paymentTerms: '',
        location: ''
      });
      fetchVendors();
    } catch (error) {
      console.error('Error registering vendor:', error);
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="space-y-12 pb-20 font-sans">
      <div className="flex items-center justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-4 text-[10px] font-bold tracking-widest text-brand-text-secondary uppercase">
             <span>Supply Chain</span>
             <ChevronRight className="w-3 h-3 text-brand-text-secondary/50" />
             <span className="text-brand-accent">Vendor Ledger</span>
          </div>
          <h1 className="text-5xl font-light text-white tracking-tight">Approved Vendors</h1>
          <p className="text-brand-text-secondary text-sm font-medium uppercase tracking-widest">
             Management of verified supplier identities and payment frameworks
          </p>
        </div>

        <button 
          onClick={() => {
            if (canRegisterVendors) {
              setIsRegisterModalOpen(true);
            } else {
              toast.error('Identity Authorization Required. Your current clearance level does not permit supply chain modifications.', 'SECURITY ACCESS DENIED');
            }
          }}
          className={cn(
            "px-8 py-4 rounded-xl text-[11px] font-black uppercase tracking-[0.3em] transition-all flex items-center gap-4 group",
            canRegisterVendors 
              ? "bg-brand-accent text-black hover:bg-brand-accent/90 shadow-[0_0_25px_rgba(251,176,59,0.2)]" 
              : "bg-brand-sidebar border border-brand-border text-brand-text-secondary/30 cursor-not-allowed"
          )}
        >
          {canRegisterVendors ? 'Register New Vendor' : 'Clearance Required'}
          <Plus className={cn("w-4 h-4 transition-transform", canRegisterVendors && "group-hover:rotate-90")} />
        </button>
      </div>

      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="relative group max-w-md w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-secondary/40 group-focus-within:text-brand-accent transition-colors" />
            <input 
              type="text" 
              placeholder="SEARCH VENDOR IDENTITY..." 
              className="w-full bg-brand-sidebar border border-brand-border rounded-2xl pl-16 pr-6 py-4 text-[10px] font-bold tracking-widest text-white focus:outline-none focus:border-brand-accent transition-all uppercase placeholder-brand-text-secondary/20"
            />
          </div>
          
          <div className="flex items-center gap-4">
             <button className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-brand-card/30 border border-brand-border text-brand-text-secondary hover:text-white transition-all text-[10px] font-black uppercase tracking-widest">
               <Filter className="w-4 h-4" />
               Category
             </button>
             <button className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-brand-card/30 border border-brand-border text-brand-text-secondary hover:text-white transition-all text-[10px] font-black uppercase tracking-widest">
               <Briefcase className="w-4 h-4" />
               Terms
             </button>
          </div>
        </div>

        <div className="glass rounded-3xl border border-brand-border/50 overflow-hidden bg-brand-card/10 shadow-2xl backdrop-blur-3xl">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-brand-sidebar/80 border-b border-brand-border backdrop-blur-3xl">
                <th className="px-10 py-6 text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.3em]">Identity</th>
                <th className="px-10 py-6 text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.3em]">Domain</th>
                <th className="px-10 py-6 text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.3em]">Liaison</th>
                <th className="px-10 py-6 text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.3em]">Protocols</th>
                <th className="px-10 py-6 text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.3em]">Status</th>
                <th className="px-10 py-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/30">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-10 py-8 text-center text-brand-text-secondary text-sm">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-4 text-brand-accent" />
                    Loading vendors...
                  </td>
                </tr>
              ) : vendors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-10 py-8 text-center text-brand-text-secondary text-sm uppercase tracking-widest">
                    No active vendor identities found
                  </td>
                </tr>
              ) : vendors.map((vendor) => (
                <tr 
                  key={vendor.id} 
                  onClick={() => setSelectedVendor(vendor)}
                  className="hover:bg-white/3 transition-all group cursor-pointer"
                >
                  <td className="px-10 py-8">
                    <div className="space-y-1">
                      <p className="text-[10px] text-brand-accent/50 font-black tracking-widest uppercase truncate max-w-[120px]">{vendor.id}</p>
                      <p className="text-base font-medium text-white tracking-wide group-hover:text-brand-accent transition-colors">{vendor.name}</p>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                     <span className="text-[10px] font-bold text-brand-text-secondary/70 uppercase tracking-widest bg-white/3 px-3 py-1 rounded-full border border-brand-border">
                       {vendor.category || 'TBD'}
                     </span>
                  </td>
                  <td className="px-10 py-8">
                    <div className="space-y-1.5">
                      <p className="text-sm font-light text-white">{vendor.contact}</p>
                      <p className="text-[10px] font-medium text-brand-text-secondary/50 uppercase flex items-center gap-2 tracking-widest">
                        <Mail className="w-3 h-3" />
                        {vendor.email}
                      </p>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <span className="text-[10px] font-bold text-brand-text-secondary uppercase tracking-[0.2em] px-3 py-1 rounded bg-brand-border/30 border border-brand-border/50">
                      {vendor.paymentTerms || 'NET 30'}
                    </span>
                  </td>
                  <td className="px-10 py-8">
                    <span className={cn(
                      "text-[9px] font-black px-3 py-1.5 rounded-full tracking-[0.2em] border uppercase flex items-center gap-2 w-fit",
                      vendor.status === 'ACTIVE' 
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" 
                        : "border-brand-text-secondary/20 bg-brand-text-secondary/5 text-brand-text-secondary/40"
                    )}>
                      {vendor.status === 'ACTIVE' && <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />}
                      {vendor.status || 'PENDING'}
                    </span>
                  </td>
                  <td className="px-10 py-8 text-right group-hover:pr-14 transition-all duration-300">
                     <ArrowUpRight className="w-5 h-5 text-brand-accent opacity-0 group-hover:opacity-100 transition-all group-hover:scale-125" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-10">
          <p className="text-[10px] font-bold text-brand-text-secondary uppercase tracking-[0.3em] opacity-40">
            RECORD COUNT: {vendors.length} ACTIVE IDENTITIES
          </p>
          <div className="flex gap-4">
             <button className="px-4 py-2 text-[10px] font-bold text-brand-text-secondary uppercase tracking-widest border border-brand-border rounded hover:text-white transition-colors">Prev</button>
             <button className="px-4 py-2 text-[10px] font-bold text-brand-accent uppercase tracking-widest border border-brand-accent rounded bg-brand-accent/5">1</button>
             <button className="px-4 py-2 text-[10px] font-bold text-brand-text-secondary uppercase tracking-widest border border-brand-border rounded hover:text-white transition-colors">Next</button>
          </div>
        </div>
      </div>

      {/* VENDOR PROFILE MODAL */}
      {selectedVendor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md transition-all duration-500 animate-in fade-in animate-out fade-out" onClick={() => setSelectedVendor(null)}>
            <div className="w-full max-w-4xl glass rounded-[40px] border border-brand-border/50 bg-[#0B0E14] overflow-hidden shadow-[0_0_120px_rgba(251,176,59,0.15)] flex h-[70vh]" onClick={(e) => e.stopPropagation()}>
              
              {/* Sidebar Info (40% width) */}
              <div className="w-[40%] border-r border-brand-border/50 p-10 bg-white/[0.03] flex flex-col group/sidebar overflow-hidden relative transition-all duration-700 hover:bg-white/[0.05] shrink-0">
                 {/* Sidebar Gradient Effect (Constant) */}
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,176,59,0.1),transparent_75%)] opacity-100 transition-opacity duration-1000 pointer-events-none" />
                 
                 <div className="relative z-10 h-full flex flex-col justify-between">
                    <div>
                       <div className="flex items-center gap-6 mb-12 pb-10 border-b border-brand-accent/20">
                          <div className="w-14 h-14 rounded-2xl bg-brand-accent/10 border border-brand-accent/30 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(251,176,59,0.1)]">
                             <Building className="w-7 h-7 text-brand-accent" />
                          </div>
                          <h2 className="text-3xl font-light text-white tracking-tight leading-tight">
                            {selectedVendor.name}
                          </h2>
                       </div>
                       
                       <div className="space-y-1.5 pr-4 pb-6">
                          <div className="flex items-center gap-4 px-4 py-2.5 rounded-2xl border border-transparent hover:border-brand-accent/20 hover:bg-brand-accent/5 transition-all group/field">
                             <Users className="w-4 h-4 text-brand-accent" />
                             <p className="text-sm text-brand-text-secondary group-hover/field:text-white font-medium transition-colors truncate">{selectedVendor.contact || 'Not Assigned'}</p>
                          </div>
                          <div className="flex items-center gap-4 px-4 py-2.5 rounded-2xl border border-transparent hover:border-brand-accent/20 hover:bg-brand-accent/5 transition-all group/field">
                             <Globe className="w-4 h-4 text-brand-accent" />
                             <p className="text-sm text-brand-text-secondary group-hover/field:text-white font-medium transition-colors truncate">{selectedVendor.location || 'Location Not Specified'}</p>
                          </div>
                          <div className="flex items-center gap-4 px-4 py-2.5 rounded-2xl border border-transparent hover:border-brand-accent/20 hover:bg-brand-accent/5 transition-all group/field">
                             <Mail className="w-4 h-4 text-brand-accent" />
                             <p className="text-sm text-brand-text-secondary group-hover/field:text-white font-medium transition-colors truncate">{selectedVendor.email}</p>
                          </div>
                          <div className="flex items-center gap-4 px-4 py-2.5 rounded-2xl border border-transparent hover:border-brand-accent/20 hover:bg-brand-accent/5 transition-all group/field">
                             <Phone className="w-4 h-4 text-brand-accent" />
                             <p className="text-sm text-brand-text-secondary group-hover/field:text-white font-medium transition-colors truncate">{selectedVendor.phone || 'Secure Line Not Set'}</p>
                          </div>
                       </div>
                    </div>

                    <div className="pt-6 border-t border-brand-accent/20">
                       <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-white/3 rounded-xl border border-white/5 hover:border-brand-accent/20 transition-all group/stat">
                             <span className="block text-[7px] font-black text-brand-accent uppercase tracking-[0.3em] mb-1.5">Partner Since</span>
                             <span className="text-[10px] font-bold text-white tracking-widest group-hover/stat:text-brand-accent transition-colors block h-4 leading-relaxed">
                               {new Date(selectedVendor.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                             </span>
                          </div>
                          <div className="p-3 bg-white/3 rounded-xl border border-white/5 hover:border-brand-accent/20 transition-all group/stat">
                             <span className="block text-[7px] font-black text-brand-accent uppercase tracking-[0.3em] mb-1.5">Ledger Status</span>
                             <div className="flex items-center gap-1.5 h-4">
                                <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest leading-relaxed">Active</span>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Main Content Area (60% width) */}
              <div className="flex-1 p-14 pb-12 flex flex-col relative overflow-auto bg-[#0D1117]/50 backdrop-blur-xl">
                 <button 
                  onClick={() => setSelectedVendor(null)} 
                  className="absolute top-6 right-6 p-4 hover:bg-white/5 rounded-full transition-all group z-20"
                 >
                   <X className="w-5 h-5 text-brand-text-secondary group-hover:text-white" />
                 </button>

                 <div className="grid grid-cols-2 gap-6 mb-12 relative z-10">
                    <div className="glass p-5 rounded-3xl border border-brand-accent/20 bg-brand-accent/3 transition-all hover:bg-brand-accent/5 flex flex-col items-center">
                       <div className="flex items-baseline justify-between w-full mb-3">
                          <p className="text-[9px] font-black text-brand-text-secondary uppercase tracking-[0.2em]">Annual Commitment</p>
                          <TrendingUp className="w-3 h-3 text-brand-accent" />
                       </div>
                       <p className="text-3xl font-light text-white tracking-tighter">
                         {formatCurrency(
                            selectedVendor.annSpend || 0, 
                            (selectedVendor.location?.toLowerCase().includes('india') || selectedVendor.location?.toLowerCase().includes('hyderabad')) ? 'INR' : 'USD'
                          )}
                       </p>
                    </div>
                    <div className="glass p-5 rounded-3xl border border-brand-border/50 bg-white/2 flex flex-col items-center">
                       <div className="flex items-baseline justify-between w-full mb-3">
                          <p className="text-[9px] font-black text-brand-text-secondary uppercase tracking-[0.2em]">Active Contracts</p>
                          <Briefcase className="w-3 h-3 text-brand-text-secondary/40" />
                       </div>
                       <p className="text-3xl font-light text-white tracking-tighter">
                         {selectedVendor.contracts || 0}
                       </p>
                    </div>
                 </div>

                 <div className="space-y-6 relative z-10 flex-1">
                    <h3 className="text-[10px] font-black text-brand-accent uppercase tracking-[0.2em] border-b border-brand-accent/20 pb-4">Financial Protocol</h3>
                    <div className="grid grid-cols-2 gap-8">
                       <div className="space-y-2">
                          <p className="text-[9px] font-bold text-brand-text-secondary/50 uppercase tracking-widest">Settlement Period</p>
                          <div className="flex items-center gap-3 text-white">
                             <CreditCard className="w-4 h-4 text-brand-accent" />
                             <span className="text-sm font-medium uppercase tracking-widest leading-none">{selectedVendor.paymentTerms || 'Net 30'}</span>
                          </div>
                       </div>
                       <div className="space-y-2">
                          <p className="text-[9px] font-bold text-brand-text-secondary/50 uppercase tracking-widest">Account Status</p>
                          <p className="text-xs font-black uppercase tracking-widest text-emerald-400">Verified Entity</p>
                       </div>
                    </div>
                 </div>

                 <div className="mt-8 flex justify-end relative z-10 border-t border-brand-border/30 pt-10">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedVendor(null);
                        navigate('/purchase-orders');
                      }}
                      className="px-10 py-4 rounded-xl bg-brand-accent text-black text-[9px] font-black uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-[0_10px_40px_rgba(251,176,59,0.2)] active:scale-95"
                    >
                       Review History
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* REGISTER NEW VENDOR MODAL */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-10 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="w-full max-w-2xl glass rounded-[40px] border border-brand-border/50 bg-[#0B0E14] overflow-hidden shadow-[0_0_120px_rgba(251,176,59,0.15)] p-12">
            <div className="flex items-center justify-between mb-10">
              <div className="space-y-2">
                <p className="text-[10px] font-black text-brand-accent uppercase tracking-[0.4em]">Protocol: Identity Registration</p>
                <h2 className="text-3xl font-light text-white tracking-tight">Register New Vendor</h2>
              </div>
              <button 
                onClick={() => setIsRegisterModalOpen(false)}
                className="p-3 hover:bg-white/5 rounded-full transition-all group"
              >
                <X className="w-6 h-6 text-brand-text-secondary group-hover:text-white" />
              </button>
            </div>

            <form onSubmit={handleRegisterVendor} className="space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-brand-text-secondary uppercase tracking-widest ml-2">Company Identity</label>
                  <input 
                    required
                    type="text" 
                    placeholder="COMPANY NAME"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-white/5 border border-brand-border rounded-2xl px-6 py-4 text-sm font-light text-white placeholder-brand-text-secondary/20 focus:outline-none focus:border-brand-accent transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-brand-text-secondary uppercase tracking-widest ml-2">Primary Domain</label>
                  <input 
                    required
                    type="text" 
                    placeholder="CATEGORY (e.g. Hardware)"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-white/5 border border-brand-border rounded-2xl px-6 py-4 text-sm font-light text-white placeholder-brand-text-secondary/20 focus:outline-none focus:border-brand-accent transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-brand-text-secondary uppercase tracking-widest ml-2">Liaison Name</label>
                  <input 
                    required
                    type="text" 
                    placeholder="CONTACT PERSON"
                    value={formData.contact}
                    onChange={(e) => setFormData({...formData, contact: e.target.value})}
                    className="w-full bg-white/5 border border-brand-border rounded-2xl px-6 py-4 text-sm font-light text-white placeholder-brand-text-secondary/20 focus:outline-none focus:border-brand-accent transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-brand-text-secondary uppercase tracking-widest ml-2">Digital Address</label>
                  <input 
                    required
                    type="email" 
                    placeholder="EMAIL@COMPANY.COM"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-white/5 border border-brand-border rounded-2xl px-6 py-4 text-sm font-light text-white placeholder-brand-text-secondary/20 focus:outline-none focus:border-brand-accent transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-brand-text-secondary uppercase tracking-widest ml-2">Secure Line</label>
                  <input 
                    type="text" 
                    placeholder="PHONE NUMBER"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-white/5 border border-brand-border rounded-2xl px-6 py-4 text-sm font-light text-white placeholder-brand-text-secondary/20 focus:outline-none focus:border-brand-accent transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-brand-text-secondary uppercase tracking-widest ml-2">HQ Location</label>
                  <input 
                    type="text" 
                    placeholder="CITY, COUNTRY"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full bg-white/5 border border-brand-border rounded-2xl px-6 py-4 text-sm font-light text-white placeholder-brand-text-secondary/20 focus:outline-none focus:border-brand-accent transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-brand-text-secondary uppercase tracking-widest ml-2">Financial Protocol</label>
                <input 
                  required
                  type="text" 
                  placeholder="PAYMENT TERMS (e.g. Net 30)"
                  value={formData.paymentTerms}
                  onChange={(e) => setFormData({...formData, paymentTerms: e.target.value})}
                  className="w-full bg-white/5 border border-brand-border rounded-2xl px-6 py-4 text-sm font-light text-white placeholder-brand-text-secondary/20 focus:outline-none focus:border-brand-accent transition-all"
                />
              </div>

              <button 
                type="submit"
                disabled={registering}
                className="w-full py-5 rounded-2xl bg-brand-accent text-black text-[11px] font-black uppercase tracking-[0.4em] hover:bg-brand-accent/90 transition-all shadow-2xl flex items-center justify-center gap-4 group"
              >
                {registering ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    REGISTERING...
                  </>
                ) : (
                  <>
                    AUTHORIZE IDENTITY REGISTRATION
                    <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default VendorList;
