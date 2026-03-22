import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Lock, 
  User, 
  ShieldCheck, 
  ArrowRight, 
  Eye, 
  EyeOff,
  Loader2,
  Shield,
  FileText,
  Activity,
  Fingerprint,
  Cpu,
  Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { authService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { motion } from 'framer-motion';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState('admin@sovereign.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await authService.login({ email, password });
      login(response.data.token, response.data.user);
      toast.success('Clearance Level Confirmed. Welcome back to the Ledger.', 'IDENTITY VERIFIED');
      navigate('/');
    } catch (err: any) {
      if (err.response?.status === 403 && err.response?.data?.requiresVerification) {
        toast.info('IDENTITY HELD: verification code required.', 'SECURE VERIFICATION');
        setShowOtp(true);
      } else {
        setError(err.response?.data?.message || 'Verification failed. Credentials invalid.');
        toast.error('Identity Verification Failed. Check record integrity.', 'ACCESS DENIED');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setOtpError('');
    try {
      await authService.verifyCode({ email, code: otp });
      // Auto login after verification
      const response = await authService.login({ email, password });
      
      login(response.data.token, response.data.user);
      toast.success('Clearance Level Confirmed. Welcome to Sovereign Ledger.', 'IDENTITY SECURED');
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
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-accent/5 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-accent/3 rounded-full blur-[100px]" />
      
      {/* Floating Tactical Glyphs - Expanded Set */}
      <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[20%] left-[8%] opacity-10 text-brand-accent">
         <Shield className="w-10 h-10" />
      </motion.div>
      <motion.div animate={{ y: [0, 20, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute bottom-[25%] right-[8%] opacity-5 text-brand-accent">
         <Lock className="w-14 h-14" />
      </motion.div>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} className="absolute top-[10%] right-[15%] opacity-5 text-brand-accent">
         <Activity className="w-16 h-16" />
      </motion.div>
      <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }} className="absolute bottom-[15%] left-[15%] opacity-10 text-brand-accent">
         <FileText className="w-8 h-8" />
      </motion.div>
      <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[40%] left-[5%] opacity-5 text-brand-accent">
         <Fingerprint className="w-12 h-12" />
      </motion.div>
      <motion.div animate={{ y: [0, 30, 0] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[60%] right-[5%] opacity-[0.03] text-brand-accent">
         <Cpu className="w-20 h-20" />
      </motion.div>
      <motion.div animate={{ rotate: -360 }} transition={{ duration: 80, repeat: Infinity, ease: "linear" }} className="absolute bottom-[10%] left-[40%] opacity-[0.02] text-brand-accent">
         <Globe className="w-24 h-24" />
      </motion.div>

      <div className="w-full max-w-lg z-10 space-y-12 py-12 animate-in fade-in zoom-in-95 duration-1000">
        <div className="text-center space-y-8">
          <div className="w-16 h-16 bg-brand-accent rounded-[20px] mx-auto flex items-center justify-center text-3xl font-black text-black shadow-[0_0_50px_rgba(251,176,59,0.3)] relative group cursor-default">
            <div className="absolute inset-0 rounded-[24px] bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
            SL
          </div>
          <div className="space-y-4">
            <h1 className="text-2xl md:text-3xl font-light tracking-[0.25em] uppercase text-gradient whitespace-nowrap">
              Identity Verification
            </h1>
            <p className="text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.6em] opacity-40">
              Procurement & Asset Intelligence Ledger
            </p>
          </div>
        </div>

        <div className="glass rounded-xl p-10 lg:p-14 border border-brand-border/40 bg-brand-card/10 shadow-[0_40px_100px_rgba(0,0,0,0.6)] relative overflow-hidden group">
          {/* Internal Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-accent/5 rounded-full blur-3xl transition-all duration-700 group-hover:bg-brand-accent/10" />
          
          <div className="absolute top-8 right-12 flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse" />
            <span className="text-[9px] font-black text-brand-accent/60 uppercase tracking-[0.3em]">
              AES-256 ENCRYPTED
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-12 relative z-10">
            <div className="space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.3em] ml-3 flex items-center gap-2">
                  <User className="w-3 h-3 text-brand-accent/50" />
                  Authorization Identity
                </label>
                <div className="relative group">
                  <input 
                    type="email" 
                    placeholder="EMAIL ADDRESS" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/[0.03] border border-brand-border/60 rounded-[20px] px-8 py-5 text-sm font-light text-white placeholder-brand-text-secondary/10 focus:outline-none focus:border-brand-accent/50 focus:bg-white/[0.05] transition-all tracking-widest"
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between ml-3">
                  <label className="text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.3em] flex items-center gap-2">
                    <Lock className="w-3 h-3 text-brand-accent/50" />
                    Access Credential
                  </label>
                </div>
                <div className="relative group">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="PASSPHRASE" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/[0.03] border border-brand-border/60 rounded-[20px] px-8 py-5 text-sm font-light text-white placeholder-brand-text-secondary/10 focus:outline-none focus:border-brand-accent/50 focus:bg-white/[0.05] transition-all tracking-[0.3em]"
                    required
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-brand-text-secondary/30 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <p className="text-rose-500 text-[10px] font-black uppercase tracking-[0.2em] text-center bg-rose-500/5 py-3 rounded-xl border border-rose-500/20">{error}</p>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-6 rounded-[22px] text-[12px] font-black text-black bg-brand-accent uppercase tracking-[0.5em] hover:bg-brand-accent/90 transition-all shadow-[0_20px_40px_rgba(251,176,59,0.2)] flex items-center justify-center gap-4 group disabled:opacity-50 active:scale-95"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  Verify Identity
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </>
              )}
            </button>
          </form>

          {showOtp && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-brand-bg/95 backdrop-blur-md rounded-xl p-10">
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
              Missing Clearance? 
              <Link to="/register" className="text-brand-accent font-black hover:tracking-[0.35em] transition-all ml-3">
                Request Identification
              </Link>
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-8 opacity-20 hover:opacity-100 transition-opacity duration-700">
           <span className="text-[8px] font-black text-brand-text-secondary uppercase tracking-[0.4em]">Protocol v8.4.2</span>
           <div className="w-1 h-1 rounded-full bg-brand-border" />
           <span className="text-[8px] font-black text-brand-text-secondary uppercase tracking-[0.4em]">Neurolink Secured</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
