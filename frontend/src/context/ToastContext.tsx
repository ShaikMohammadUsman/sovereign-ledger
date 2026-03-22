import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, XCircle, Info, X } from 'lucide-react';
import { cn } from '../lib/utils';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  title?: string;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, title?: string) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info', title?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, title }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const success = (msg: string, title?: string) => showToast(msg, 'success', title);
  const error = (msg: string, title?: string) => showToast(msg, 'error', title);
  const warning = (msg: string, title?: string) => showToast(msg, 'warning', title);
  const info = (msg: string, title?: string) => showToast(msg, 'info', title);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95, transition: { duration: 0.2 } }}
              className="pointer-events-auto"
            >
              <div className={cn(
                "w-80 glass border rounded-2xl p-4 shadow-2xl relative overflow-hidden group",
                toast.type === 'success' && "border-emerald-500/30",
                toast.type === 'error' && "border-rose-500/30",
                toast.type === 'warning' && "border-brand-accent/30",
                toast.type === 'info' && "border-blue-500/30"
              )}>
                {/* Visual Progress Bar */}
                <motion.div 
                   initial={{ width: "100%" }}
                   animate={{ width: "0%" }}
                   transition={{ duration: 5, ease: "linear" }}
                   className={cn(
                     "absolute bottom-0 left-0 h-0.5 opacity-50",
                     toast.type === 'success' && "bg-emerald-500",
                     toast.type === 'error' && "bg-rose-500",
                     toast.type === 'warning' && "bg-brand-accent",
                     toast.type === 'info' && "bg-blue-500"
                   )}
                />

                <div className="flex gap-4">
                  <div className={cn(
                    "p-2 rounded-lg h-fit",
                    toast.type === 'success' && "bg-emerald-500/10 text-emerald-400",
                    toast.type === 'error' && "bg-rose-500/10 text-rose-400",
                    toast.type === 'warning' && "bg-brand-accent/10 text-brand-accent",
                    toast.type === 'info' && "bg-blue-500/10 text-blue-400"
                  )}>
                    {toast.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
                    {toast.type === 'error' && <XCircle className="w-5 h-5" />}
                    {toast.type === 'warning' && <AlertCircle className="w-5 h-5" />}
                    {toast.type === 'info' && <Info className="w-5 h-5" />}
                  </div>

                  <div className="flex-1 space-y-1">
                    {toast.title && (
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-white">{toast.title}</h4>
                    )}
                    <p className="text-xs text-brand-text-secondary leading-relaxed">{toast.message}</p>
                  </div>

                  <button 
                    onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                    className="h-fit p-1 text-brand-text-secondary hover:text-white transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
