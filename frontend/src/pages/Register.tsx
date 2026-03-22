import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  Loader2,
  Shield,
  Activity,
  Lock,
  Mail,
  User,
  Building,
  Briefcase,
  IdCard,
  Fingerprint,
  Cpu,
  Globe
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { authService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');

  const [countryCode, setCountryCode] = useState('+91');
  const [phoneBody, setPhoneBody] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: 'Operations',
    position: 'Procurement Specialist',
    employeeId: `VX-${Math.floor(Math.random() * 90000) + 10000}`,
    role: 'EMPLOYEE',
    phone: '' // Will be updated on submit
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const submissionData = {
        ...formData,
        phone: `${countryCode}${phoneBody.replace(/\s+/g, '')}`,
        employeeId: `VX-${Math.floor(Math.random() * 900000) + 100000}`
      };

      // Register the user
      await authService.register(submissionData);

      toast.info('IDENTITY HELD: Verification PIN dispatched to your mobile device.', 'SECURE VERIFICATION');
      setShowOtp(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Identity registration failed.');
      toast.error('Identity Registration Interrupted. Check record integrity.', 'SECURITY ERROR');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setOtpError('');
    try {
      await authService.verifyCode({ email: formData.email, code: otp });
      // Auto login after verification
      const response = await authService.login({
        email: formData.email,
        password: formData.password
      });

      login(response.data.token, response.data.user);
      toast.success('Clearance Level Established. Welcome to Sovereign Ledger.', 'IDENTITY SECURED');
      navigate('/');
    } catch (err: any) {
      setOtpError(err.response?.data?.message || 'Invalid verification protocol code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center p-8 relative overflow-hidden font-sans">
      {/* Advanced Digital Background System */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(24,29,41,0.5)_0%,rgba(11,14,20,1)_100%)]" />

      {/* Circuitry Grid Overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FBB03B' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />

      {/* Atmospheric Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-accent/5 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-accent/3 rounded-full blur-[100px]" />

      {/* Floating Tactical Glyphs - Expanded Set */}
      <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[20%] right-[8%] opacity-10 text-brand-accent">
        <Shield className="w-10 h-10" />
      </motion.div>
      <motion.div animate={{ y: [0, 20, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute bottom-[25%] left-[8%] opacity-5 text-brand-accent">
        <Lock className="w-14 h-14" />
      </motion.div>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} className="absolute top-[10%] left-[15%] opacity-5 text-brand-accent">
        <Activity className="w-16 h-16" />
      </motion.div>
      <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[40%] right-[5%] opacity-5 text-brand-accent">
        <Fingerprint className="w-12 h-12" />
      </motion.div>
      <motion.div animate={{ y: [0, 30, 0] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[60%] left-[5%] opacity-[0.03] text-brand-accent">
        <Cpu className="w-20 h-20" />
      </motion.div>
      <motion.div animate={{ rotate: -360 }} transition={{ duration: 80, repeat: Infinity, ease: "linear" }} className="absolute bottom-[10%] right-[40%] opacity-[0.02] text-brand-accent">
        <Globe className="w-24 h-24" />
      </motion.div>

      <div className="w-full max-w-2xl z-10 space-y-8 py-12 animate-in fade-in zoom-in-95 duration-1000">
        <div className="text-center space-y-4">
          <div className="w-14 h-14 bg-brand-accent rounded-[16px] mx-auto flex items-center justify-center text-2xl font-black text-black shadow-[0_0_30px_rgba(251,176,59,0.2)]">
            SL
          </div>
          <h1 className="text-2xl md:text-3xl font-light text-gradient tracking-[0.2em] uppercase whitespace-nowrap">Identity Registry</h1>
          <p className="text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.4em] opacity-40">
            Establish your professional clearance
          </p>
        </div>

        <div className="glass rounded-xl p-8 lg:p-12 border border-brand-border/40 bg-brand-card/10 shadow-[0_40px_100px_rgba(0,0,0,0.6)] relative text-white group">
          <div className="absolute top-6 right-10 flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 bg-brand-accent/10 rounded-full border border-brand-accent/20">
              <div className="w-1 h-1 rounded-full bg-brand-accent animate-pulse" />
              <span className="text-[7px] font-black text-brand-accent uppercase tracking-[0.2em]">
                {formData.role} PROTOCOL
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
            <div className="grid grid-cols-2 gap-8">
              {/* Name */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.3em] ml-2 flex items-center gap-2">
                  <User size={10} className="text-brand-accent" /> Full Name
                </label>
                <div className="relative group">
                  <input
                    required
                    type="text"
                    placeholder="OPERATOR NAME"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white/[0.03] border border-brand-border/60 rounded-xl px-6 py-4 text-sm font-light text-white placeholder-brand-text-secondary/10 focus:outline-none focus:border-brand-accent/50 focus:bg-white/[0.05] transition-all tracking-widest"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.3em] ml-2 flex items-center gap-2">
                  <Mail size={10} className="text-brand-accent" /> Secure Email
                </label>
                <div className="relative group">
                  <input
                    required
                    type="email"
                    placeholder="EMAIL ADDRESS"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-white/[0.03] border border-brand-border/60 rounded-xl px-6 py-4 text-sm font-light text-white placeholder-brand-text-secondary/10 focus:outline-none focus:border-brand-accent/50 focus:bg-white/[0.05] transition-all tracking-widest"
                  />
                </div>
              </div>

              {/* Company Name */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.3em] ml-2 flex items-center gap-2">
                  <Building size={10} className="text-brand-accent" /> Company
                </label>
                <div className="relative group">
                  <input
                    required
                    type="text"
                    placeholder="CORPORATION NAME"
                    value={(formData as any).companyName || ''}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value } as any)}
                    className="w-full bg-white/[0.03] border border-brand-border/60 rounded-xl px-6 py-4 text-sm font-light text-white placeholder-brand-text-secondary/10 focus:outline-none focus:border-brand-accent/50 focus:bg-white/[0.05] transition-all tracking-widest"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.3em] ml-2 flex items-center gap-2">
                  <Globe size={10} className="text-brand-accent" /> Mobile for PIN
                </label>
                <div className="flex gap-2">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="w-24 bg-[#10141D] border border-brand-border/60 rounded-xl px-3 py-4 text-sm font-light text-brand-accent focus:outline-none focus:border-brand-accent/50 transition-all appearance-none text-center"
                  >
                    <option value="+91">🇮🇳 +91</option>
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+971">🇦🇪 +971</option>
                    <option value="+65">🇸🇬 +65</option>
                    <option value="+61">🇦🇺 +61</option>
                  </select>
                  <div className="relative group flex-1">
                    <input
                      required
                      type="tel"
                      placeholder="638378612"
                      value={phoneBody}
                      onChange={(e) => setPhoneBody(e.target.value)}
                      className="w-full bg-white/[0.03] border border-brand-border/60 rounded-xl px-6 py-4 text-sm font-light text-white placeholder-brand-text-secondary/10 focus:outline-none focus:border-brand-accent/50 focus:bg-white/[0.05] transition-all tracking-widest"
                    />
                  </div>
                </div>
              </div>

              {/* Role Selection */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.3em] ml-2 flex items-center gap-2">
                  <ShieldCheck size={10} className="text-brand-accent" /> Clearance Role
                </label>
                <div className="relative group">
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-[#10141D] border border-brand-border/60 rounded-xl px-6 py-4 text-sm font-light text-brand-text-secondary focus:outline-none focus:border-brand-accent/50 transition-all appearance-none uppercase tracking-widest"
                  >
                    <option value="EMPLOYEE">STANDARD OPERATOR</option>
                    <option value="MANAGER">DEPARTMENT MANAGER</option>
                    <option value="FINANCE">FINANCE OFFICER</option>
                    <option value="ADMIN">SYSTEM ADMINISTRATOR</option>
                  </select>
                </div>
              </div>

              {/* Department */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.3em] ml-2 flex items-center gap-2">
                  <Briefcase size={10} className="text-brand-accent" /> Department
                </label>
                <div className="relative group">
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full bg-[#10141D] border border-brand-border/60 rounded-xl px-6 py-4 text-sm font-light text-brand-text-secondary focus:outline-none focus:border-brand-accent/50 transition-all appearance-none uppercase tracking-widest"
                  >
                    <option value="Operations">OPERATIONS</option>
                    <option value="Finance">FINANCE</option>
                    <option value="Procurement Strategy">STRATEGY</option>
                    <option value="Technology">TECHNOLOGY</option>
                    <option value="Compliance">COMPLIANCE</option>
                  </select>
                </div>
              </div>

              {/* Password */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.3em] ml-2 flex items-center gap-2">
                  <Lock size={10} className="text-brand-accent" /> Passphrase Key
                </label>
                <div className="relative group">
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    placeholder="PASSWORD"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-white/[0.03] border border-brand-border/60 rounded-xl px-6 py-4 text-sm font-light text-white placeholder-brand-text-secondary/10 focus:outline-none focus:border-brand-accent/50 focus:bg-white/[0.05] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-brand-text-secondary/30 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Position */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.3em] ml-2 flex items-center gap-2">
                  <IdCard size={10} className="text-brand-accent" /> Specialization
                </label>
                <div className="relative group">
                  <input
                    required
                    type="text"
                    placeholder="e.g. DIRECTOR"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full bg-white/[0.03] border border-brand-border/60 rounded-xl px-6 py-4 text-sm font-light text-white placeholder-brand-text-secondary/10 focus:outline-none focus:border-brand-accent/50 focus:bg-white/[0.05] transition-all uppercase tracking-widest"
                  />
                </div>
              </div>
            </div>

            {error && (
              <p className="text-rose-500 text-[10px] font-black uppercase tracking-[0.2em] text-center bg-rose-500/5 py-3 rounded-xl border border-rose-500/20">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-6 rounded-[22px] text-[12px] font-black text-black bg-brand-accent uppercase tracking-[0.5em] hover:bg-brand-accent/90 transition-all shadow-[0_20px_40px_rgba(251,176,59,0.2)] flex items-center justify-center gap-4 group active:scale-95"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Authorize Registration'}
              {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />}
            </button>
          </form>

          {showOtp && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-brand-bg/95 backdrop-blur-md rounded-xl p-8">
              <form onSubmit={handleVerify} className="space-y-8 w-full animate-in fade-in zoom-in-95 duration-500">
                <div className="text-center space-y-4">
                  <Fingerprint className="w-12 h-12 text-brand-accent mx-auto" />
                  <h3 className="text-xl font-light text-white tracking-widest uppercase">Verify Identity</h3>
                  <p className="text-[10px] text-brand-text-secondary uppercase tracking-[0.2em]">Enter the 6-digit protocol pin sent to your mobile</p>
                </div>
                <div className="space-y-3">
                  <input
                    required
                    type="text"
                    placeholder="ENTER OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full bg-white/[0.03] border border-brand-border/60 rounded-xl px-6 py-4 text-center text-2xl font-black text-white placeholder-brand-text-secondary/20 focus:outline-none focus:border-brand-accent/50 focus:bg-white/[0.05] tracking-[1em] transition-all"
                  />
                  {otpError && (
                    <p className="text-rose-500 text-[10px] font-black uppercase tracking-[0.1em] text-center">{otpError}</p>
                  )}
                </div>
                <div className="flex gap-4">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => setShowOtp(false)}
                    className="flex-1 py-4 rounded-xl text-[10px] font-black text-white hover:text-brand-accent border border-brand-border/40 uppercase tracking-[0.2em] transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-4 rounded-xl text-[10px] font-black text-black bg-brand-accent uppercase tracking-[0.2em] hover:bg-brand-accent/90 transition-all shadow-[0_10px_20px_rgba(251,176,59,0.2)] flex items-center justify-center"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm'}
                  </button>
                </div>
              </form>
            </div>
          )}


          <div className="mt-12 pt-8 border-t border-brand-border/30 text-center">
            <p className="text-[10px] text-brand-text-secondary/60 font-medium uppercase tracking-[0.25em]">
              Already have clearance?
              <Link to="/login" className="text-brand-accent font-black hover:tracking-[0.35em] transition-all ml-3">
                Verify Identity
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
