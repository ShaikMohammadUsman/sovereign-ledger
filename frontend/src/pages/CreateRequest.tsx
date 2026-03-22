import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Upload, 
  ChevronRight,
  AlertCircle,
  FileText,
  X,
  ChevronDown,
  ChevronUp,
  Save,
  Building,
  Briefcase
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { requestService, vendorService } from '@/services/api';
import { useNavigate, useParams } from 'react-router-dom';

const CreateRequest: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    currency: 'USD',
    department: 'Operations',
    urgency: 'MEDIUM',
    vendor: '',
  });

  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [isVendorOpen, setIsVendorOpen] = useState(false);
  const [isDeptOpen, setIsDeptOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currencyRef = useRef<HTMLDivElement>(null);
  const vendorRef = useRef<HTMLDivElement>(null);
  const deptRef = useRef<HTMLDivElement>(null);

  const departments = ['Operations', 'Engineering', 'Marketing', 'Sales', 'Executive', 'Technical'];
  const [vendors, setVendors] = useState<any[]>([]);

  
  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
    { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  ];

  useEffect(() => {
    const fetchSelectData = async () => {
      try {
        const res = await vendorService.getAll();
        setVendors(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSelectData();

    if (id) {
      const fetchRequest = async () => {
        try {
          const res = await requestService.getById(id);
          const req = res.data;
          setFormData({
            title: req.title || '',
            description: req.description || '',
            amount: req.amount ? req.amount.toString() : '',
            currency: req.currency || 'USD',
            department: req.department || 'Operations',
            urgency: req.urgency || 'MEDIUM',
            vendor: req.vendor?.name || '',
          });
        } catch (error) {
          console.error("Failed to fetch request", error);
        }
      };
      fetchRequest();
    }
  }, [id]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachedFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setAttachedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const selectedCurrency = currencies.find(c => c.code === formData.currency) || currencies[0];
  const selectedVendorData = vendors.find(v => v.id === formData.vendor);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (currencyRef.current && !currencyRef.current.contains(event.target as Node)) {
        setIsCurrencyOpen(false);
      }
      if (vendorRef.current && !vendorRef.current.contains(event.target as Node)) {
        setIsVendorOpen(false);
      }
      if (deptRef.current && !deptRef.current.contains(event.target as Node)) {
        setIsDeptOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent, status: string = 'SUBMITTED') => {
    e.preventDefault();
    if (!formData.title || !formData.amount) {
      alert('Please fill out all required fields.');
      return;
    }
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        department: formData.department,
        urgency: formData.urgency,
        status: status,
        vendor: formData.vendor
      };
      
      if (id) {
        await requestService.update(id, payload);
      } else {
        await requestService.create(payload);
      }
      navigate('/requests');
    } catch (error) {
      console.error('Failed to save requisition', error);
      alert('Error saving requisition. Please check connection.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20 font-sans">
      <div className="space-y-4">
        <div className="flex items-center gap-4 text-[10px] font-bold tracking-widest text-brand-text-secondary uppercase">
          <span>Requisitions</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-brand-accent">{id ? 'Edit Request' : 'New Request'}</span>
        </div>
        <h1 className="text-5xl font-light text-white tracking-tight">Initiate Requisition</h1>
        <p className="text-brand-text-secondary text-sm font-medium uppercase tracking-widest">
          Procurement Authorization Form · RECORD ID: REQ-PENDING
        </p>
      </div>

      <div className="glass rounded-3xl p-12 border border-brand-border bg-brand-card/30 relative overflow-visible group backdrop-blur-3xl shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/5 blur-[100px] group-hover:bg-brand-accent/10 transition-all duration-500 pointer-events-none" />
        
        <form className="space-y-10 relative z-10" onSubmit={(e) => handleSubmit(e, 'SUBMITTED')}>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-brand-text-secondary uppercase tracking-[0.2em] ml-1">
              Item / Service Specification
            </label>
            <input 
              type="text" 
              placeholder="E.G. CLOUD INFRASTRUCTURE UPGRADE..." 
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full bg-white/5 border border-brand-border rounded-xl px-6 py-4 text-sm font-light text-white placeholder-brand-text-secondary/40 focus:outline-none focus:border-brand-accent transition-all uppercase tracking-widest"
            />
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-brand-text-secondary uppercase tracking-[0.2em] ml-1">
                Estimated Capital Commitment
              </label>
              <div className="flex gap-2 relative">
                 <div className="relative w-32 shrink-0" ref={currencyRef}>
                    <button
                      type="button"
                      onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
                      className={cn(
                        "w-full h-full bg-brand-sidebar border border-brand-border rounded-xl px-4 flex items-center justify-between text-brand-accent transition-all hover:border-brand-accent/50",
                        isCurrencyOpen && "border-brand-accent shadow-[0_0_15px_rgba(251,176,59,0.2)]"
                      )}
                    >
                      <span className="text-base font-bold">{selectedCurrency.symbol}</span>
                      <span className="text-[10px] font-black tracking-tighter opacity-70">{selectedCurrency.code}</span>
                      {isCurrencyOpen ? <ChevronUp className="w-3 h-3 opacity-50" /> : <ChevronDown className="w-3 h-3 opacity-50" />}
                    </button>

                    {isCurrencyOpen && (
                      <div className="absolute top-[calc(100%+8px)] left-0 w-64 bg-[#10141D] border border-brand-border rounded-2xl shadow-2xl py-3 z-50 animate-in fade-in zoom-in-95 duration-200 backdrop-blur-3xl">
                        <div className="px-5 pb-3 mb-2 border-b border-brand-border/50">
                          <p className="text-[8px] font-black text-brand-text-secondary uppercase tracking-[0.2em]">Select Ledger Currency</p>
                        </div>
                        {currencies.map((c) => (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => {
                              setFormData({...formData, currency: c.code});
                              setIsCurrencyOpen(false);
                            }}
                            className={cn(
                              "w-full px-5 py-3 flex items-center justify-between hover:bg-brand-accent/10 transition-colors group",
                              formData.currency === c.code ? "bg-brand-accent/5" : ""
                            )}
                          >
                            <div className="flex items-center gap-4">
                              <span className={cn("text-lg font-bold w-6 text-center", formData.currency === c.code ? "text-brand-accent" : "text-brand-text-secondary group-hover:text-white")}>
                                {c.symbol}
                              </span>
                              <div className="text-left">
                                <p className={cn("text-[10px] font-black tracking-widest uppercase", formData.currency === c.code ? "text-brand-accent" : "text-white group-hover:text-brand-accent")}>{c.code}</p>
                                <p className="text-[8px] text-brand-text-secondary/60 uppercase tracking-widest">{c.name}</p>
                              </div>
                            </div>
                            {formData.currency === c.code && <div className="w-1.5 h-1.5 rounded-full bg-brand-accent" />}
                          </button>
                        ))}
                      </div>
                    )}
                 </div>

                <div className="relative flex-1 group">
                   <div className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-text-secondary/40 font-bold pointer-events-none group-focus-within:text-brand-accent transition-colors">
                     {selectedCurrency.symbol}
                   </div>
                  <input 
                    type="number" 
                    placeholder="AMOUNT..." 
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="w-full bg-white/5 border border-brand-border rounded-xl pl-12 pr-6 py-4 text-sm font-bold text-white placeholder-brand-text-secondary/20 focus:outline-none focus:border-brand-accent transition-all tracking-widest"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2 z-40">
              <label className="text-[10px] font-bold text-brand-text-secondary uppercase tracking-[0.2em] ml-1">
                Execution Partner (Vendor)
              </label>
              <div className="relative" ref={vendorRef}>
                <button
                  type="button"
                  onClick={() => setIsVendorOpen(!isVendorOpen)}
                  className={cn(
                    "w-full bg-brand-sidebar border border-brand-border rounded-xl px-6 py-4 flex items-center justify-between transition-all hover:border-brand-accent/50",
                    isVendorOpen && "border-brand-accent shadow-[0_0_15px_rgba(251,176,59,0.2)]"
                  )}
                >
                  <span className={cn("text-[11px] font-bold tracking-widest uppercase", formData.vendor ? "text-white" : "text-brand-text-secondary/40")}>
                    {formData.vendor ? (selectedVendorData?.name || formData.vendor) : "SELECT VENDOR (OPTIONAL)"}
                  </span>
                  {isVendorOpen ? <ChevronUp className="w-4 h-4 text-brand-text-secondary/40" /> : <ChevronDown className="w-4 h-4 text-brand-text-secondary/40" />}
                </button>

                {isVendorOpen && (
                  <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-[#10141D] border border-brand-border rounded-2xl shadow-2xl py-3 animate-in fade-in zoom-in-95 duration-200 backdrop-blur-3xl max-h-64 overflow-y-auto custom-scrollbar">
                    <div className="px-5 pb-3 mb-2 border-b border-brand-border/50">
                      <p className="text-[8px] font-black text-brand-text-secondary uppercase tracking-[0.2em]">Registered Vendors</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({...formData, vendor: ''});
                        setIsVendorOpen(false);
                      }}
                      className={cn(
                        "w-full px-5 py-3 flex items-center gap-4 hover:bg-white/5 transition-colors group",
                        formData.vendor === '' ? "bg-white/5" : ""
                      )}
                    >
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                        <Building className="w-4 h-4 text-brand-text-secondary/50 group-hover:text-white" />
                      </div>
                      <div className="text-left text-brand-text-secondary group-hover:text-white">
                        <p className="text-[10px] font-bold tracking-widest uppercase">None (To Be Decided)</p>
                      </div>
                    </button>
                    {vendors.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => {
                          setFormData({...formData, vendor: v.id});
                          setIsVendorOpen(false);
                        }}
                        className={cn(
                          "w-full px-5 py-3 flex items-center gap-4 hover:bg-brand-accent/10 transition-colors group",
                          formData.vendor === v.id ? "bg-brand-accent/5" : ""
                        )}
                      >
                        <div className="w-8 h-8 rounded-lg bg-brand-accent/10 flex items-center justify-center">
                          <Building className={cn("w-4 h-4 text-brand-text-secondary/50 group-hover:text-brand-accent", formData.vendor === v.id ? "text-brand-accent" : "")} />
                        </div>
                        <div className="text-left">
                          <p className={cn("text-[10px] font-black tracking-widest uppercase", formData.vendor === v.id ? "text-brand-accent" : "text-white group-hover:text-brand-accent")}>{v.name}</p>
                          <p className="text-[8px] text-brand-text-secondary/60 uppercase tracking-widest">{v.category || 'Vendor'}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 z-30">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-brand-text-secondary uppercase tracking-[0.2em] ml-1">
                Financial Department
              </label>
              <div className="relative" ref={deptRef}>
                <button
                  type="button"
                  onClick={() => setIsDeptOpen(!isDeptOpen)}
                  className={cn(
                    "w-full bg-brand-sidebar border border-brand-border rounded-xl px-6 py-4 flex items-center justify-between transition-all hover:border-brand-accent/50",
                    isDeptOpen && "border-brand-accent shadow-[0_0_15px_rgba(251,176,59,0.2)]"
                  )}
                >
                  <span className="text-[11px] font-bold tracking-widest text-white uppercase">
                    {formData.department}
                  </span>
                  {isDeptOpen ? <ChevronUp className="w-4 h-4 text-brand-text-secondary/40" /> : <ChevronDown className="w-4 h-4 text-brand-text-secondary/40" />}
                </button>

                {isDeptOpen && (
                  <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-[#10141D] border border-brand-border rounded-2xl shadow-2xl py-3 z-30 animate-in fade-in zoom-in-95 duration-200 backdrop-blur-3xl">
                    <div className="px-5 pb-3 mb-2 border-b border-brand-border/50">
                      <p className="text-[8px] font-black text-brand-text-secondary uppercase tracking-[0.2em]">Select Department</p>
                    </div>
                    {departments.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => {
                          setFormData({...formData, department: d});
                          setIsDeptOpen(false);
                        }}
                        className={cn(
                          "w-full px-5 py-3 flex items-center gap-4 hover:bg-brand-accent/10 transition-colors group",
                          formData.department === d ? "bg-brand-accent/5" : ""
                        )}
                      >
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                          <Briefcase className={cn("w-4 h-4 text-brand-text-secondary/50 group-hover:text-brand-accent", formData.department === d ? "text-brand-accent" : "")} />
                        </div>
                        <div className="text-left">
                          <p className={cn("text-[10px] font-bold tracking-widest uppercase", formData.department === d ? "text-brand-accent" : "text-white group-hover:text-brand-accent")}>{d}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2 z-20">
              <label className="text-[10px] font-bold text-brand-text-secondary uppercase tracking-[0.2em] ml-1">
                Strategic Urgency
              </label>
              <div className="flex gap-4">
                {['LOW', 'MEDIUM', 'HIGH'].map(level => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setFormData({...formData, urgency: level})}
                    className={cn(
                      "flex-1 py-4 px-4 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all border",
                      formData.urgency === level 
                        ? "bg-brand-accent text-black border-brand-accent shadow-[0_0_20px_rgba(251,176,59,0.3)]" 
                        : "bg-white/5 text-brand-text-secondary border-brand-border hover:bg-white/10"
                    )}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2 z-10">
            <label className="text-[10px] font-bold text-brand-text-secondary uppercase tracking-[0.2em] ml-1">
              Justification & Project Scope
            </label>
            <textarea 
              rows={4}
              placeholder="PROVIDE COMPREHENSIVE JUSTIFICATION FOR THIS REQUISITION..." 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full bg-white/5 border border-brand-border rounded-xl px-6 py-4 text-sm font-light text-white placeholder-brand-text-secondary/40 focus:outline-none focus:border-brand-accent transition-all resize-none uppercase tracking-widest leading-loose"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-brand-text-secondary uppercase tracking-[0.2em] ml-1">
              Ledger Attachment (PDF)
            </label>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              className="hidden" 
              accept=".pdf,.doc,.docx"
            />
            {!attachedFile ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-brand-border rounded-xl p-10 text-center hover:border-brand-accent/50 transition-all group cursor-pointer bg-white/3"
              >
                <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mx-auto mb-6 group-hover:bg-brand-accent/10 transition-colors">
                  <Upload className="w-8 h-8 text-brand-text-secondary/50 group-hover:text-brand-accent group-hover:scale-110 transition-all duration-300" />
                </div>
                <p className="text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.3em] mb-2">
                  Attach Quote / Contract Execution
                </p>
                <p className="text-[9px] text-brand-text-secondary/30 uppercase tracking-[0.2em]">
                  Drag files here or click to browse local storage
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-brand-accent/5 border border-brand-accent/20 rounded-2xl p-8 animate-in slide-in-from-top-4">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-brand-accent">
                    <FileText className="w-8 h-8 shadow-2xl" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-white uppercase tracking-widest">{attachedFile.name}</p>
                    <p className="text-[10px] text-brand-accent font-bold uppercase tracking-widest mt-1">{(attachedFile.size / 1024 / 1024).toFixed(2)} MB · SECURED SYSTEM OBJECT</p>
                  </div>
                </div>
                <button 
                  onClick={removeFile}
                  className="p-3 hover:bg-rose-500/10 rounded-xl text-brand-text-secondary hover:text-rose-500 transition-all border border-transparent hover:border-rose-500/30"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            )}
          </div>

          <div className="pt-8 flex items-center gap-6">
            <button 
              type="button"
              onClick={(e) => handleSubmit(e, 'DRAFT')}
              className="flex-1 py-5 rounded-2xl text-[11px] font-black text-brand-text-secondary border border-brand-border uppercase tracking-[0.3em] hover:bg-white/5 transition-all"
            >
              Draft Archive
            </button>
            <button 
              type="submit"
              className="flex-[2] py-5 rounded-2xl text-[11px] font-black text-black bg-brand-accent uppercase tracking-[0.4em] hover:bg-brand-accent/90 transition-all shadow-[0_10px_40px_rgba(251,176,59,0.2)] flex items-center justify-center gap-4 group"
            >
              Authorize & Issue
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
            </button>
          </div>
        </form>
      </div>

      <div className="flex items-center gap-6 bg-brand-accent/5 rounded-3xl p-8 border border-brand-accent/20">
        <AlertCircle className="w-6 h-6 text-brand-accent shrink-0" />
        <p className="text-[11px] font-medium text-brand-text-secondary leading-relaxed uppercase tracking-[0.2em]">
          Protocol: Requests exceeding <span className="text-brand-accent font-black tracking-[0.3em] underline decoration-brand-accent/30 underline-offset-4">{selectedCurrency.symbol}5,000.00</span> require secondary authorization from the Finance Director.
        </p>
      </div>
    </div>
  );
};

export default CreateRequest;
