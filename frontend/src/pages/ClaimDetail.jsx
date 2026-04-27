import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  FileText, 
  ArrowLeft,
  Hospital,
  User,
  MessageSquare,
  AlertCircle,
  ExternalLink,
  Activity,
  Zap
} from 'lucide-react';

const ClaimDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState('');

  const { data: claim, isLoading } = useQuery({
    queryKey: ['claim', id],
    queryFn: async () => {
      const res = await api.get(`/claims/${id}`);
      return res.data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ status, comment }) => {
      return api.patch(`/claims/${id}/status`, { status, comment });
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['claim', id]);
      queryClient.invalidateQueries(['tpa-queue']);
      alert(`SUCCESS: Claim updated to ${variables.status}`);
    },
    onError: (err) => {
      alert(`ERROR: ${err.response?.data?.message || err.message}`);
    }
  });

  if (isLoading) return <div className="flex h-screen items-center justify-center bg-[#FDFBF7]"><div className="w-12 h-12 border-4 border-slate-100 border-t-[var(--primary)] rounded-full animate-spin" /></div>;
  if (!claim) return <div className="p-20 text-center card-premium m-20">Case Not Found.</div>;

  const role = (user?.role || 'GUEST').toUpperCase();
  const isAdmin = role === 'ADMIN';
  const isTPA = role === 'TPA';
  const canAct = (isAdmin || isTPA) && claim.status !== 'APPROVED' && claim.status !== 'REJECTED';

  // Open document from Supabase - uses the REAL database column "file_url"
  const openDoc = (doc) => {
    // The database stores: file_url, file_name, document_type
    const url = doc.file_url || doc.url;
    if (!url || url === '#') {
      alert("This document has no file URL stored in the database.");
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Helper to get display name from a document row
  const getDocName = (doc) => doc.file_name || doc.name || 'Medical Document';
  const getDocType = (doc) => doc.document_type || doc.type || 'OTHER';

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 p-4 md:p-0">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <button onClick={() => navigate(-1)} className="group flex items-center gap-3 text-slate-400 hover:text-slate-900 font-black text-[10px] uppercase tracking-widest transition-all">
          <div className="p-2 bg-white rounded-lg shadow-sm group-hover:bg-slate-900 group-hover:text-white transition-all"><ArrowLeft size={16} /></div>
          Back to Dashboard
        </button>
        <div className="flex items-center gap-6">
          <span className={`px-6 py-2 rounded-full text-[10px] font-black tracking-widest uppercase border-2 shadow-sm ${
            claim.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
            claim.status === 'REJECTED' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-amber-50 text-amber-600 border-amber-200'
          }`}>
            {claim.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          {/* Main Info */}
          <div className="card-premium !p-12 relative overflow-hidden border-t-8 border-t-[var(--primary)]">
            <div className="flex flex-col md:flex-row justify-between items-start gap-10 mb-12">
              <div className="space-y-4">
                <p className="text-[10px] font-black text-[var(--primary)] uppercase tracking-widest flex items-center gap-2">
                  <Activity size={14} /> Clinical Diagnosis
                </p>
                <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-tight">{claim.diagnosis}</h1>
              </div>
              <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100 text-center min-w-[200px]">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Settlement Amount</p>
                <p className="text-4xl font-black text-slate-900 tracking-tighter">₹{parseFloat(claim.amount_claimed).toLocaleString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 py-10 border-y border-slate-50">
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient Name</p>
                <div className="flex items-center gap-3 font-black text-slate-900 capitalize"><User size={18} className="text-slate-300" /> {claim.user?.name}</div>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Facility</p>
                <div className="flex items-center gap-3 font-black text-slate-900"><Hospital size={18} className="text-slate-300" /> {claim.hospital?.name}</div>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Benefit Type</p>
                <div className="flex items-center gap-3 font-black text-[var(--primary)]"><Zap size={18} /> {claim.type}</div>
              </div>
            </div>

            {/* ===== DOCUMENT EVIDENCE VIEWER ===== */}
            <div className="pt-10 space-y-8">
              <div className="flex justify-between items-center">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <FileText size={16} /> Uploaded Evidence ({claim.documents?.length || 0} files)
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {claim.documents?.map((doc, i) => (
                  <div 
                    key={doc.id || i} 
                    onClick={() => openDoc(doc)} 
                    className="flex items-center justify-between p-6 bg-white rounded-3xl border-2 border-slate-50 group hover:border-[var(--primary)] hover:shadow-xl transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-[var(--primary)] group-hover:text-white transition-all">
                        <FileText size={24} />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900 truncate max-w-[180px]">{getDocName(doc)}</p>
                        <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mt-1">{getDocType(doc)} — Click to Open</p>
                      </div>
                    </div>
                    <ExternalLink size={20} className="text-slate-200 group-hover:text-[var(--primary)]" />
                  </div>
                ))}
                {(!claim.documents || claim.documents.length === 0) && (
                  <div className="col-span-2 py-20 text-center border-4 border-dashed border-slate-50 rounded-[40px] bg-slate-50/30">
                    <AlertCircle size={48} className="mx-auto mb-4 text-slate-200" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No documents uploaded for this claim</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Audit Trail */}
          {claim.reviews && claim.reviews.length > 0 && (
            <div className="card-premium !p-10 space-y-8">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Activity size={14} /> Audit Trail</h3>
              <div className="space-y-6">
                {claim.reviews.map((r, i) => (
                  <div key={r.id || i} className="flex gap-6 relative">
                    {i !== claim.reviews.length - 1 && <div className="absolute left-3 top-8 bottom-[-24px] w-0.5 bg-slate-100" />}
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 text-white shrink-0 ${
                      r.status_after === 'APPROVED' ? 'bg-emerald-500' : 
                      r.status_after === 'REJECTED' ? 'bg-red-500' : 'bg-amber-500'
                    }`}><CheckCircle size={10} /></div>
                    <div className="flex-1 pb-6 border-b border-slate-50">
                      <div className="flex justify-between mb-2">
                        <p className="text-xs font-black text-slate-900 uppercase">{r.status_before} → {r.status_after}</p>
                        <p className="text-[10px] font-bold text-slate-400">{new Date(r.created_at).toLocaleString()}</p>
                      </div>
                      <p className="text-[10px] text-slate-500">By: {r.reviewer?.name} ({r.role})</p>
                      {r.comments && <p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-xl border border-slate-100 mt-2">"{r.comments}"</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Panel */}
        <div className="space-y-8">
          {canAct && (
            <div className="card-premium space-y-8 border-2 border-[var(--primary)] shadow-2xl">
              <div className="flex items-center gap-3 text-[10px] font-black text-slate-900 uppercase tracking-widest">
                <div className="w-8 h-8 bg-[var(--primary)] text-white rounded-lg flex items-center justify-center"><MessageSquare size={16} /></div>
                Review Decision
              </div>
              <textarea 
                className="input-premium h-40 p-6 text-sm" 
                placeholder="Enter justification..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <div className="grid grid-cols-1 gap-4">
                <button 
                  onClick={() => updateStatusMutation.mutate({ status: isTPA ? 'UNDER_REVIEW' : 'APPROVED', comment })}
                  disabled={updateStatusMutation.isPending}
                  className="btn-gold !py-5 text-xs font-black uppercase shadow-2xl flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  <CheckCircle size={18} /> {isTPA ? 'Forward to Admin' : 'Authorize Approval'}
                </button>
                <button 
                  onClick={() => updateStatusMutation.mutate({ status: 'REJECTED', comment })}
                  disabled={updateStatusMutation.isPending}
                  className="bg-white border-4 border-red-50 text-red-500 py-5 rounded-[24px] text-xs font-black uppercase hover:bg-red-50 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  <XCircle size={18} /> Reject Case
                </button>
              </div>
            </div>
          )}

          <div className="card-premium !bg-slate-900 !text-white border-none shadow-2xl space-y-6">
             <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-[var(--primary)]"><Shield size={24} /></div>
               <div>
                 <h4 className="font-black uppercase tracking-tight">Access Level</h4>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Logged in as {role}</p>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClaimDetail;
