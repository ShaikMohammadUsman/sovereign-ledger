import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Send,
  Sparkles,
  ArrowRight,
  Trash2,
  FileCheck,
  Ban
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { requestService, poService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ShieldCheck, MoreVertical, ChevronRight, FileText, TrendingUp, AlertCircle, Package } from 'lucide-react';

const RequestDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const toast = useToast();

  const canApprove = user?.role === 'ADMIN' || user?.role === 'FINANCE';
  const canModifyVendors = user?.role === 'ADMIN' || user?.role === 'FINANCE';

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        if (id) {
          const res = await requestService.getById(id);
          setRequest(res.data);
        }
      } catch (err) {
        console.error('Error fetching request', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequest();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this requisition?')) return;
    try {
      if (id) {
        await requestService.delete(id);
        navigate('/requests');
      }
    } catch (err) {
      console.error('Failed to delete request', err);
    }
  };

  const handleApprove = async () => {
    try {
      if (id) {
        await requestService.updateStatus(id, 'APPROVED');
        // Refresh
        const res = await requestService.getById(id);
        setRequest(res.data);
      }
    } catch (err) {
      console.error('Failed to approve request', err);
    }
  };

  const handleReject = async () => {
    try {
      if (id) {
        await requestService.updateStatus(id, 'REJECTED');
        // Refresh
        const res = await requestService.getById(id);
        setRequest(res.data);
      }
    } catch (err) {
      console.error('Failed to reject request', err);
    }
  };

  const handleGeneratePO = async () => {
    try {
      if (id) {
        const res = await poService.generate(id);
        if (res.data) {
          toast.success(`Purchase order ${res.data.poNumber} created.`, 'PO created');
          if (res.data.zohoSync?.synced) {
            toast.success('Synced to Zoho Books.', 'Zoho Books');
          } else if (res.data.zohoSync?.error) {
            toast.error(res.data.zohoSync.error, 'Zoho sync — check Settings');
          }
          const updatedRequestResp = await requestService.getById(id);
          setRequest(updatedRequestResp.data);
        }
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to generate PO. It might already exist.';
      toast.error(msg, 'PO failed');
    }
  };

  if (loading) {
    return <div className="text-white text-center py-20 uppercase tracking-widest text-[10px] font-bold">Loading...</div>;
  }

  if (!request) {
    return <div className="text-rose-500 text-center py-20 uppercase tracking-widest text-[10px] font-bold">Request Not Found</div>;
  }

  // Map API response to UI shape
  const displayRequest = {
    id: request.id,
    title: request.title,
    status: request.status,
    totalValue: request.amount,
    currency: request.currency || 'USD',
    specs: {
      vendor: request.vendor?.name || 'Unknown Vendor',
      requester: request.createdBy?.name || 'Unknown User',
      department: request.department,
      justification: request.description,
    },
    approvalTrace: [
      { id: 1, title: 'SUBMISSION', details: `${request.createdBy?.name || 'N/A'}`, status: 'completed' },
      { id: 2, title: 'REVIEW', details: 'System checks', status: request.status === 'SUBMITTED' ? 'pending' : 'completed' },
      { id: 3, title: 'FINAL DECISION', details: 'Awaiting Executive', status: (request.status === 'APPROVED' || request.status === 'PO_CREATED' || request.status === 'REJECTED') ? 'completed' : 'locked' },
      { id: 4, title: 'PO GENERATION', details: 'Generation Pending', status: request.status === 'PO_CREATED' ? 'completed' : 'locked' }
    ],
  };

  return (
    <div className="space-y-12 pb-20 font-sans">
      {/* Header Section */}
      <div className="flex items-start justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-4 text-[10px] font-bold tracking-widest text-brand-text-secondary uppercase">
            <span>Requests</span>
            <ArrowRight className="w-3 h-3 text-brand-text-secondary/50" />
            <span className="text-brand-accent">Details</span>
          </div>
          <h1 className="text-7xl font-light tracking-tight text-white mb-2">
            {displayRequest.title}
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold tracking-widest text-brand-text-secondary">
              REQ-ID: {displayRequest.id.substring(displayRequest.id.length - 6).toUpperCase()}
            </span>
            <span className="bg-brand-accent/10 border border-brand-accent/30 text-brand-accent text-[9px] font-black px-2 py-0.5 rounded tracking-widest flex items-center gap-1.5 uppercase">
              {displayRequest.status === 'IN REVIEW' && <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse" />}
              {displayRequest.status === 'APPROVED' && <CheckCircle2 className="w-3 h-3" />}
              {displayRequest.status}
            </span>
          </div>
        </div>

        <div className="text-right flex flex-col items-end">
          <span className="block text-[10px] font-bold tracking-[0.2em] text-brand-text-secondary uppercase mb-2">
            Total Acquisition Value
          </span>
          <span className="text-6xl font-light tracking-tighter text-brand-accent drop-shadow-[0_0_15px_rgba(251,176,59,0.2)]">
            {formatCurrency(displayRequest.totalValue, displayRequest.currency)}
          </span>

           {/* Actions */}
           <div className="flex gap-4 mt-6">
             {displayRequest.status === 'PO_CREATED' ? (
                <button 
                  onClick={() => navigate('/purchase-orders')}
                  className="bg-brand-accent text-black px-6 py-3 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] hover:bg-brand-accent/90 transition-all flex items-center gap-2"
                >
                  View POs <ArrowRight className="w-4 h-4" />
                </button>
             ) : (
                <>
                  {displayRequest.status !== 'APPROVED' && displayRequest.status !== 'REJECTED' && canApprove && (
                    <>
                      <button 
                        onClick={handleApprove}
                        className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-500 px-6 py-3 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-500/20 transition-all flex items-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Approve
                      </button>
                      <button 
                        onClick={handleReject}
                        className="bg-rose-500/10 border border-rose-500/50 text-rose-500 px-6 py-3 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] hover:bg-rose-500/20 transition-all flex items-center gap-2"
                      >
                        <Ban className="w-4 h-4" /> Reject
                      </button>
                    </>
                  )}
                  {displayRequest.status !== 'APPROVED' && displayRequest.status !== 'REJECTED' && !canApprove && (
                    <div className="flex items-center gap-2 px-6 py-3 bg-brand-sidebar/50 rounded-lg border border-brand-border">
                       <ShieldCheck className="w-4 h-4 text-brand-text-secondary" />
                       <span className="text-[10px] font-bold text-brand-text-secondary uppercase tracking-widest">Awaiting Management Validation</span>
                    </div>
                  )}
                  {displayRequest.status === 'APPROVED' && (
                     <button 
                      onClick={handleGeneratePO}
                      className="bg-brand-accent text-black px-6 py-3 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] hover:bg-brand-accent/90 transition-all flex items-center gap-2"
                    >
                      <FileCheck className="w-4 h-4" /> Generate PO
                    </button>
                  )}
                  <button 
                    onClick={handleDelete}
                    className="bg-red-500/10 border border-red-500/50 text-red-500 px-6 py-3 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-500/20 transition-all flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                  {displayRequest.status !== 'PO_CREATED' && displayRequest.status !== 'REJECTED' && (
                    <button 
                      onClick={() => navigate(`/requests/${displayRequest.id}/edit`)}
                      className="bg-brand-sidebar border border-brand-border text-brand-text-secondary px-6 py-3 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] hover:text-white transition-all flex items-center gap-2"
                    >
                      Edit
                    </button>
                  )}
                </>
             )}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-12">
        {/* Left Column */}
        <div className="col-span-8 space-y-12">
          {/* Requisition Specifications */}
          <div className="glass rounded-2xl p-10 border border-brand-border bg-brand-card/30 relative overflow-hidden group">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,176,59,0.06),transparent_70%)]" />
            <h3 className="text-[10px] font-black tracking-[0.3em] uppercase text-brand-accent mb-10 border-b border-brand-accent/30 pb-4 relative z-10">
              Requisition Specifications
            </h3>
            
            <div className="grid grid-cols-2 gap-x-12 gap-y-10 relative z-10">
              <div className="space-y-1.5">
                <span className="text-[9px] font-bold text-brand-text-secondary/50 uppercase tracking-widest">Vendor</span>
                <p className="text-lg font-light text-white">{displayRequest.specs.vendor}</p>
              </div>
              <div className="space-y-1.5">
                <span className="text-[9px] font-bold text-brand-text-secondary/50 uppercase tracking-widest">Requester</span>
                <p className="text-lg font-light text-white">{displayRequest.specs.requester}</p>
              </div>
              <div className="space-y-1.5">
                <span className="text-[9px] font-bold text-brand-text-secondary/50 uppercase tracking-widest">Department</span>
                <p className="text-lg font-light text-white">{displayRequest.specs.department}</p>
              </div>
              <div className="col-span-2 space-y-1.5 mt-4">
                <span className="text-[9px] font-bold text-brand-text-secondary/50 uppercase tracking-widest">Justification</span>
                <p className="text-base font-light text-brand-text-secondary leading-relaxed max-w-2xl">
                  {displayRequest.specs.justification}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="col-span-4 space-y-12">
          {/* Approval Trace */}
          <div className="glass rounded-2xl p-10 border border-brand-border bg-brand-card/30 relative overflow-hidden group">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(251,176,59,0.04),transparent_70%)]" />
            <h3 className="text-[10px] font-black tracking-[0.3em] uppercase text-brand-accent mb-10 border-b border-brand-accent/30 pb-4 relative z-10">
              Approval Trace
            </h3>

            <div className="space-y-10 relative z-10">
              {displayRequest.approvalTrace.map((step) => (
                <div key={step.id} className="relative flex gap-6">
                  {step.id !== displayRequest.approvalTrace.length && (
                    <div className="absolute left-[9px] top-6 w-px h-10 bg-brand-border" />
                  )}
                  <div className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center z-10",
                    step.status === 'completed' ? "bg-brand-accent text-black shadow-[0_0_10px_rgba(251,176,59,0.5)]" :
                    step.status === 'pending' ? "border-2 border-brand-accent bg-transparent text-brand-accent shadow-[0_0_8px_rgba(251,176,59,0.3)]" :
                    "border border-brand-border bg-brand-card"
                  )}>
                    {step.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {step.status === 'pending' && <Circle className="w-2 h-2 fill-brand-accent" />}
                  </div>
                  <div className="space-y-1">
                    <h4 className={cn(
                      "text-[10px] font-bold uppercase tracking-wider",
                      step.status === 'locked' ? "text-brand-text-secondary/30" : "text-white"
                    )}>
                      {step.title}
                    </h4>
                    <p className="text-[10px] text-brand-text-secondary/60 font-medium">
                      {step.details}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestDetail;
