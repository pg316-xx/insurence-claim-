import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { 
  FileText, 
  PlusCircle, 
  CheckCircle, 
  Shield, 
  Activity, 
  RefreshCw, 
  Calendar, 
  CreditCard, 
  ChevronRight, 
  XCircle, 
  Zap 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CustomerDashboard = () => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [processing, setProcessing] = useState(false);

  const { data: claims, isLoading, refetch: refetchClaims } = useQuery({
    queryKey: ['my-claims'],
    queryFn: async () => {
      const res = await api.get('/claims/my');
      return res.data;
    },
    retry: 3
  });

  const { data: policies, refetch: refetchPolicies } = useQuery({
    queryKey: ['my-policies'],
    queryFn: async () => {
      const res = await api.get('/policies/my');
      return res.data;
    },
  });

  if (isLoading) return <div className="flex flex-col items-center justify-center h-[60vh] gap-4"><div className="w-10 h-10 border-4 border-slate-200 border-t-[var(--primary)] rounded-full animate-spin" /></div>;

  const handlePayment = (e) => {
    e.preventDefault();
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setIsPaid(true);
      setTimeout(() => setShowPaymentModal(false), 2000);
    }, 2000);
  };

  const activePolicy = policies?.[0];

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Member <span className="gold-text">Hub</span></h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest flex items-center gap-2">
            <Activity size={14} className="text-[var(--primary)]" /> System Operational
          </p>
        </div>
        <Link to="/claims/new" className="btn-gold !px-8 !py-4 flex items-center gap-3 group shadow-2xl">
          <PlusCircle size={20} /> File Claim <ChevronRight size={18} />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 card-premium !bg-slate-900 !text-white border-none relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--primary)] opacity-10 rounded-full blur-3xl -mr-20 -mt-20" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between gap-10">
            <div className="space-y-6">
              <h3 className="text-xl font-black flex items-center gap-3"><Calendar size={22} className="text-[var(--primary)]" /> Premium Schedule</h3>
              <div className="flex gap-16">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Upcoming Deadline</p>
                  <p className="text-2xl font-black">{isPaid ? 'Next Month' : 'May 05, 2026'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                  <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border ${
                    isPaid ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/20 text-amber-500 border-amber-500/20'
                  }`}>
                    {isPaid ? 'PAID' : 'Awaiting Payment'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-end">
              {!isPaid && (
                <button onClick={() => setShowPaymentModal(true)} className="bg-white text-slate-900 px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-2 hover:bg-[var(--primary)] hover:text-white transition-all">
                  <CreditCard size={16} /> Pay Online Now
                </button>
              )}
              {isPaid && (
                <div className="flex items-center gap-2 text-emerald-500 font-black text-xs uppercase tracking-widest">
                  <CheckCircle size={20} /> Payment Confirmed
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="card-premium flex flex-col justify-between">
           <div className="space-y-4">
             <div className="w-12 h-12 bg-[var(--accent)] rounded-2xl flex items-center justify-center text-[var(--primary)]"><Shield size={24} /></div>
             <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Active Policy</h3>
             <p className="text-xs text-slate-400 font-medium">Policy #: {activePolicy?.policy_number || 'HS-9922'}</p>
           </div>
           <div className="pt-6 border-t border-slate-50 mt-6 flex justify-between items-end">
             <p className="text-2xl font-black text-slate-900">₹{parseFloat(activePolicy?.coverage_amount || 500000).toLocaleString()}</p>
             <button onClick={() => {refetchPolicies(); refetchClaims();}} className="p-2 text-slate-300 hover:text-[var(--primary)] transition-all"><RefreshCw size={16} /></button>
           </div>
        </div>
      </div>

      {/* Claims List */}
      <div className="space-y-6">
        <h3 className="text-xl font-black text-slate-900 flex items-center gap-3 uppercase tracking-tighter">
          <FileText size={20} className="text-[var(--primary)]" /> Claim History
        </h3>
        <div className="grid gap-4">
          {claims?.map((claim) => (
            <Link key={claim.id} to={`/claims/${claim.id}`} className="card-premium hover:shadow-xl transition-all group flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 group-hover:bg-[var(--primary)] transition-all"><FileText size={20} /></div>
                <div>
                   <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase border ${
                      claim.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}>{claim.status}</span>
                  <h4 className="text-lg font-black text-slate-900 mt-1">{claim.diagnosis}</h4>
                </div>
              </div>
              <p className="text-xl font-black text-slate-900 tracking-tighter">₹{parseFloat(claim.amount_claimed).toLocaleString()}</p>
            </Link>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showPaymentModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[40px] p-12 max-w-md w-full shadow-2xl relative text-center">
              {isPaid ? (
                <div className="py-10 space-y-4">
                  <CheckCircle size={56} className="mx-auto text-emerald-500" />
                  <h2 className="text-2xl font-black">Transaction Successful</h2>
                </div>
              ) : (
                <form onSubmit={handlePayment} className="space-y-6">
                  <h2 className="text-3xl font-black mb-8">Secure Payment</h2>
                  <input required className="input-premium h-14" placeholder="Card Number" />
                  <div className="grid grid-cols-2 gap-4">
                    <input required className="input-premium h-14" placeholder="MM/YY" />
                    <input required className="input-premium h-14" placeholder="CVV" />
                  </div>
                  <button type="submit" className="w-full btn-gold py-5 text-xs font-black uppercase shadow-2xl" disabled={processing}>
                    {processing ? 'Authorizing...' : 'Pay Premium Now'}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomerDashboard;
