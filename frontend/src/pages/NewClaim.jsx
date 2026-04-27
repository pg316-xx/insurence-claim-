import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { supabase } from '../api/supabase';
import { 
  Shield, 
  Hospital as HospitalIcon, 
  ChevronRight, 
  CheckCircle, 
  Upload, 
  AlertCircle, 
  ArrowLeft, 
  X,
  FileText,
  RefreshCw,
  CloudUpload,
  Zap,
  CreditCard,
  HeartPulse
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NewClaim = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    policyId: '',
    hospitalId: '',
    type: 'REIMBURSEMENT', 
    diagnosis: '',
    admissionDate: '',
    dischargeDate: '',
    amountClaimed: '',
    documents: [] 
  });

  const { data: policies, isLoading: loadingPolicies } = useQuery({
    queryKey: ['my-policies'],
    queryFn: async () => {
      const res = await api.get('/policies/my');
      return res.data;
    },
  });

  const { data: hospitals, isLoading: loadingHospitals } = useQuery({
    queryKey: ['hospitals'],
    queryFn: async () => {
      const res = await api.get('/hospitals');
      return res.data;
    },
  });

  const mutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post('/claims', payload);
      return res.data;
    },
    onSuccess: (data) => {
      alert("CLAIM SUBMITTED! Your case is now under review.");
      navigate(`/claims/${data.claim.id}`);
    },
    onError: (err) => {
      alert(`SUBMISSION FAILED: ${err.response?.data?.message || err.message}`);
    }
  });

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadedDocs = [];
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `claims/${fileName}`;

        // Attempting Real Upload
        const { error: uploadError, data } = await supabase.storage
          .from('claims-docs')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error("Supabase Upload Error:", uploadError);
          throw new Error(`Bucket Error: ${uploadError.message}. Make sure 'claims-docs' bucket exists and is public!`);
        }

        // Get Public URL
        const { data: { publicUrl } } = supabase.storage
          .from('claims-docs')
          .getPublicUrl(filePath);

        uploadedDocs.push({ 
          url: publicUrl, 
          name: file.name, 
          type: 'BILL' 
        });
      }

      setFormData(prev => ({
        ...prev,
        documents: [...prev.documents, ...uploadedDocs]
      }));
      
      alert(`SUCCESS: ${uploadedDocs.length} file(s) uploaded and secured.`);

    } catch (err) {
      console.error("Detailed Upload Error:", err);
      alert(`UPLOAD FAILED: ${err.message}`);
      
      // Fallback for Demo ONLY if upload fails
      setFormData(prev => ({
        ...prev,
        documents: [...prev.documents, { 
          url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 
          name: "demo_fallback.pdf", 
          type: 'BILL' 
        }]
      }));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 p-4 md:p-0">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center gap-3 text-slate-400 hover:text-slate-900 font-black text-[10px] uppercase tracking-widest"><ArrowLeft size={16} /> Exit Wizard</button>
        <div className="flex items-center gap-4">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className={`h-1.5 rounded-full transition-all ${step >= s ? 'bg-[var(--primary)] w-12' : 'bg-slate-100 w-6'}`} />
          ))}
        </div>
      </div>

      <div className="card-premium !p-12 md:!p-20 relative min-h-[600px] flex flex-col border-t-8 border-t-[var(--primary)] shadow-2xl">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col">
              <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-10">Choose <span className="gold-text">Policy</span></h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                {policies?.map(p => (
                  <div key={p.id} onClick={() => setFormData({ ...formData, policyId: p.id })} 
                    className={`p-10 rounded-[40px] border-4 cursor-pointer transition-all relative ${formData.policyId === p.id ? 'border-[var(--primary)] bg-[var(--accent)] shadow-xl' : 'border-slate-50 bg-slate-50/50 hover:border-slate-100'}`}>
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Policy No: {p.policy_number}</p>
                    <h4 className="text-xl font-black text-slate-900">Health Shield Elite</h4>
                    <p className="text-2xl font-black text-[var(--primary)] mt-4">₹{parseFloat(p.coverage_amount).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-end pt-10"><button type="button" onClick={() => setStep(2)} disabled={!formData.policyId} className="btn-gold !px-16 !py-5 text-lg disabled:opacity-30">Next Step</button></div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">Treatment <span className="gold-text">Details</span></h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div onClick={() => setFormData({...formData, type: 'CASHLESS'})} className={`p-8 rounded-[32px] border-4 cursor-pointer transition-all relative ${formData.type === 'CASHLESS' ? 'border-[var(--primary)] bg-[var(--accent)]' : 'border-slate-50 bg-slate-50'}`}>
                   <Zap size={24} className={formData.type === 'CASHLESS' ? 'text-[var(--primary)]' : 'text-slate-300'} />
                   <h4 className="text-lg font-black text-slate-900 mt-4 uppercase">Cashless</h4>
                   <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Settled by Insurer</p>
                </div>
                <div onClick={() => setFormData({...formData, type: 'REIMBURSEMENT'})} className={`p-8 rounded-[32px] border-4 cursor-pointer transition-all relative ${formData.type === 'REIMBURSEMENT' ? 'border-[var(--primary)] bg-[var(--accent)]' : 'border-slate-50 bg-slate-50'}`}>
                   <CreditCard size={24} className={formData.type === 'REIMBURSEMENT' ? 'text-[var(--primary)]' : 'text-slate-300'} />
                   <h4 className="text-lg font-black text-slate-900 mt-4 uppercase">Reimbursement</h4>
                   <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Pay & Claim Later</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hospital Facility</label>
                  <select className="input-premium h-16" value={formData.hospitalId} onChange={e => setFormData({ ...formData, hospitalId: e.target.value })}>
                    <option value="">Select Facility</option>
                    {hospitals?.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Estimated Amount (₹)</label>
                  <input type="number" className="input-premium h-16" value={formData.amountClaimed} onChange={e => setFormData({ ...formData, amountClaimed: e.target.value })} placeholder="0.00" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reason / Diagnosis</label>
                  <textarea className="input-premium h-32 p-6" value={formData.diagnosis} onChange={e => setFormData({ ...formData, diagnosis: e.target.value })} placeholder="Enter medical condition..." />
                </div>
              </div>

              <div className="flex justify-between items-center pt-10">
                <button type="button" onClick={() => setStep(1)} className="font-black text-slate-400 uppercase text-[10px]">Back</button>
                <button type="button" onClick={() => setStep(3)} disabled={!formData.hospitalId || !formData.amountClaimed} className="btn-gold !px-16 !py-5 text-lg">Upload Evidence</button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">Upload <span className="gold-text">Originals</span></h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="border-4 border-dashed border-slate-100 rounded-[50px] p-20 text-center relative group hover:border-[var(--primary)] hover:bg-[var(--accent)] transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden">
                  <input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer z-20" onChange={handleFileUpload} disabled={uploading} />
                  <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center text-[var(--primary)] mb-6 z-10">
                    {uploading ? <RefreshCw className="animate-spin" size={32} /> : <CloudUpload size={32} />}
                  </div>
                  <h4 className="font-black text-slate-900 uppercase tracking-widest text-[10px] z-10">{uploading ? 'SECURING FILES...' : 'DROP MEDICAL FILES HERE'}</h4>
                  <p className="text-[8px] text-slate-400 font-bold uppercase mt-2 z-10">PDF, JPG, PNG accepted</p>
                </div>
                <div className="space-y-4">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Attached Evidence ({formData.documents.length})</h5>
                  <div className="space-y-3">
                    {formData.documents.map((d, i) => (
                      <div key={i} className="flex items-center justify-between p-5 bg-white rounded-3xl border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-3">
                           <FileText size={18} className="text-[var(--primary)]" />
                           <span className="text-[10px] font-black text-slate-900 truncate max-w-[120px]">{d.name}</span>
                        </div>
                        <button onClick={() => setFormData(prev => ({...prev, documents: prev.documents.filter((_, idx) => idx !== i)}))} className="p-2 hover:bg-red-50 text-red-300 hover:text-red-500 rounded-lg transition-all"><X size={16} /></button>
                      </div>
                    ))}
                    {formData.documents.length === 0 && <div className="py-10 text-center text-slate-300 font-black text-[10px] uppercase tracking-widest">No files selected</div>}
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center pt-10">
                <button type="button" onClick={() => setStep(2)} className="font-black text-slate-400 uppercase text-[10px]">Back</button>
                <button type="button" onClick={() => setStep(4)} className="btn-gold !px-16 !py-5 text-lg">Final Review</button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center justify-center text-center space-y-10">
              <div className="w-24 h-24 bg-[var(--accent)] rounded-full flex items-center justify-center text-[var(--primary)] shadow-inner"><Shield size={48} /></div>
              <div>
                <h2 className="text-5xl font-black text-slate-900 tracking-tight">Final <span className="gold-text">Submission</span></h2>
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-4">Confirming {formData.type} request for ₹{formData.amountClaimed}</p>
              </div>
              
              <div className="flex flex-col gap-4 w-full max-w-sm">
                <button type="button" onClick={() => mutation.mutate(formData)} className="btn-gold py-6 text-xs font-black uppercase tracking-widest shadow-2xl" disabled={mutation.isPending}>
                  {mutation.isPending ? 'TRANSMITTING...' : 'AUTHORIZE & SUBMIT'}
                </button>
                <button type="button" onClick={() => setStep(1)} className="text-slate-400 font-black uppercase text-[10px] hover:text-slate-900 transition-colors">Restart Wizard</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default NewClaim;
