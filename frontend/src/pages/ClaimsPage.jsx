import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { 
  FileText, 
  RefreshCw,
  AlertCircle,
  ChevronRight,
  Shield,
  Search,
  Filter
} from 'lucide-react';
import { motion } from 'framer-motion';

const ClaimsPage = () => {
  const { data: claims, isLoading, refetch } = useQuery({
    queryKey: ['my-claims-full'],
    queryFn: async () => {
      const res = await api.get('/claims/my');
      return res.data;
    },
    retry: 3
  });

  if (isLoading) return <div className="flex h-[60vh] items-center justify-center"><div className="w-10 h-10 border-4 border-slate-200 border-t-[var(--primary)] rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Claim <span className="gold-text">History</span></h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest flex items-center gap-2">
            <FileText size={14} className="text-[var(--primary)]" />
            Complete Audit of your Submissions
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="bg-white border border-slate-100 rounded-2xl pl-12 pr-6 py-4 text-xs font-bold w-64 shadow-sm focus:ring-2 focus:ring-[var(--primary)] outline-none" placeholder="Search claims..." />
          </div>
          <button onClick={() => refetch()} className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-[var(--primary)] shadow-sm transition-all"><RefreshCw size={20} /></button>
        </div>
      </div>

      <div className="grid gap-6">
        {claims?.map((claim, i) => (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            key={claim.id}
          >
            <Link 
              to={`/claims/${claim.id}`}
              className="card-premium hover:shadow-2xl hover:translate-x-1 transition-all group flex flex-col md:flex-row md:items-center justify-between gap-8"
            >
              <div className="flex items-center gap-8">
                <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-[var(--primary)] group-hover:text-white transition-all shadow-sm">
                  <Shield size={28} />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <p className="text-[10px] font-black text-[var(--primary)] tracking-widest uppercase">{claim.claim_number}</p>
                    <span className={`px-4 py-1 rounded-full text-[9px] font-black tracking-widest uppercase border ${
                      claim.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      claim.status === 'REJECTED' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>
                      {claim.status}
                    </span>
                  </div>
                  <h4 className="text-xl font-black text-slate-900 group-hover:text-[var(--primary)] transition-colors">{claim.diagnosis}</h4>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2 mt-2">
                    {claim.hospital?.name || 'Medical Facility'} • {new Date(claim.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-10 border-t md:border-t-0 pt-6 md:pt-0 border-slate-50">
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Claimed Amount</p>
                  <p className="text-2xl font-black text-slate-900 tracking-tighter">₹{parseFloat(claim.amount_claimed).toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-200 group-hover:bg-[var(--primary)] group-hover:text-white transition-all shadow-sm">
                  <ChevronRight size={24} />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}

        {(!claims || claims.length === 0) && (
          <div className="p-32 text-center card-premium border-dashed border-2 border-slate-100 bg-slate-50/20 space-y-6">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto text-slate-200 shadow-xl border border-slate-50">
              <FileText size={48} />
            </div>
            <p className="text-slate-400 font-black uppercase text-xs tracking-widest">No claim history recorded yet</p>
            <Link to="/claims/new" className="btn-gold !px-10 inline-flex">Submit Your First Claim</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClaimsPage;
