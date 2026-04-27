import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { 
  Hospital as HospitalIcon, 
  PlusCircle, 
  Clock, 
  CheckCircle, 
  FileText,
  ChevronRight,
  Activity,
  AlertCircle,
  RefreshCw,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';

const HospitalDashboard = () => {
  const { data: claims, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['hospital-claims'],
    queryFn: async () => {
      const res = await api.get('/claims/my'); // Backend should filter by hospital_id for hospital users
      return res.data;
    },
    retry: 3
  });

  if (isLoading) return <div className="flex flex-col items-center justify-center h-[60vh] gap-4"><div className="w-10 h-10 border-4 border-slate-200 border-t-[var(--primary)] rounded-full animate-spin" /></div>;

  const stats = [
    { label: 'Pending Pre-Auth', count: claims?.filter(c => c.status === 'SUBMITTED').length || 0, color: 'bg-blue-50 text-blue-600', icon: <Zap size={20} /> },
    { label: 'Approved', count: claims?.filter(c => c.status === 'APPROVED').length || 0, color: 'bg-emerald-50 text-emerald-600', icon: <CheckCircle size={20} /> },
    { label: 'Total Cases', count: claims?.length || 0, color: 'bg-slate-50 text-slate-600', icon: <HospitalIcon size={20} /> },
  ];

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Hospital <span className="gold-text">Portal</span></h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] flex items-center gap-2">
            <HospitalIcon size={14} className="text-[var(--primary)]" />
            Network Provider Terminal
          </p>
        </div>
        <Link to="/claims/new" className="btn-gold !px-8 !py-4 flex items-center gap-3 group shadow-2xl">
          <PlusCircle size={20} />
          New Pre-Auth Request
          <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((s, i) => (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={i} className="card-premium flex items-center gap-6">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${s.color} shadow-sm border border-white`}>{s.icon}</div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
              <p className="text-3xl font-black text-slate-900">{s.count}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <Activity size={20} className="text-[var(--primary)]" />
          Active Hospital Cases
        </h3>

        <div className="grid gap-4">
          {claims?.length === 0 ? (
            <div className="card-premium p-20 text-center border-dashed border-2 border-slate-100">
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No active cases found for this facility</p>
            </div>
          ) : (
            claims?.map((claim) => (
              <Link key={claim.id} to={`/claims/${claim.id}`} className="card-premium hover:shadow-2xl transition-all group flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-white transition-all"><FileText size={24} /></div>
                  <div>
                    <p className="text-[10px] font-black text-[var(--primary)] tracking-widest uppercase">{claim.claim_number}</p>
                    <h4 className="text-lg font-black text-slate-900">{claim.diagnosis}</h4>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Patient: {claim.user?.name || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                   <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase ${
                    claim.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}>{claim.status}</span>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Estimated Cost</p>
                    <p className="text-xl font-black text-slate-900">₹{parseFloat(claim.amount_claimed).toLocaleString()}</p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HospitalDashboard;
