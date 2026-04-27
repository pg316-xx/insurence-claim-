import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { 
  BarChart3, 
  ShieldCheck, 
  Clock, 
  Hospital as HospitalIcon, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  Activity
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await api.get('/claims/all');
      const claims = res.data;
      
      return {
        total: claims.length,
        pending: claims.filter(c => c.status === 'UNDER_REVIEW' || c.status === 'PENDING').length,
        approved: claims.filter(c => c.status === 'APPROVED' || c.status === 'SETTLED').length,
        rejected: claims.filter(c => c.status === 'REJECTED').length,
        claimsList: claims.slice(0, 5) 
      };
    }
  });

  const { data: hospitals, isLoading: loadingHospitals } = useQuery({
    queryKey: ['admin-hospitals'],
    queryFn: async () => {
      const res = await api.get('/hospitals');
      return res.data;
    }
  });

  if (loadingStats || loadingHospitals) return <div className="flex h-[60vh] items-center justify-center"><div className="w-10 h-10 border-4 border-slate-200 border-t-[var(--primary)] rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-12 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Network <span className="gold-text">Intelligence</span></h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest flex items-center gap-2">
            <Activity size={14} className="text-[var(--primary)]" />
            Live Ecosystem Monitoring
          </p>
        </div>
        <div className="bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100 flex items-center gap-3">
           <TrendingUp size={20} className="text-emerald-500" />
           <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Efficiency: 94%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="card-premium relative overflow-hidden group">
          <div className="relative z-10 space-y-4">
            <div className="w-12 h-12 bg-[var(--accent)] rounded-2xl flex items-center justify-center text-[var(--primary)] shadow-sm"><CheckCircle2 size={24} /></div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Approved Claims</p>
              <p className="text-3xl font-black text-slate-900">{stats?.approved}</p>
            </div>
          </div>
        </div>

        <div className="card-premium relative overflow-hidden group">
          <div className="relative z-10 space-y-4">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 shadow-sm"><Clock size={24} /></div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pending Review</p>
              <p className="text-3xl font-black text-slate-900">{stats?.pending}</p>
            </div>
          </div>
        </div>

        <div className="card-premium relative overflow-hidden group">
          <div className="relative z-10 space-y-4">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 shadow-sm"><HospitalIcon size={24} /></div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Network Hospitals</p>
              <p className="text-3xl font-black text-slate-900">{hospitals?.length}</p>
            </div>
          </div>
        </div>

        <div className="card-premium relative overflow-hidden group">
          <div className="relative z-10 space-y-4">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 shadow-sm"><AlertCircle size={24} /></div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Declined Total</p>
              <p className="text-3xl font-black text-slate-900">{stats?.rejected}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-6">
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-3 uppercase tracking-tighter">
            <HospitalIcon size={20} className="text-[var(--primary)]" /> Hospital Partners
          </h3>
          <div className="card-premium !p-0 overflow-hidden shadow-2xl">
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Facility Name</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Network Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {hospitals?.slice(0, 5).map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50/30 transition-all">
                    <td className="px-8 py-6">
                      <p className="text-sm font-black text-slate-900">{h.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{h.location}</p>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <span className="text-[8px] font-black px-2 py-1 bg-emerald-50 text-emerald-500 rounded uppercase tracking-widest border border-emerald-100">Verified</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Link to="/hospitals" className="block text-center py-4 text-[10px] font-black text-[var(--primary)] uppercase tracking-widest hover:bg-slate-50 transition-all border-t border-slate-50">
              View Full Hospital Directory <ArrowUpRight size={14} className="inline ml-1" />
            </Link>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-3 uppercase tracking-tighter">
            <BarChart3 size={20} className="text-[var(--primary)]" /> Recent Claim Actions
          </h3>
          <div className="space-y-4">
            {stats?.claimsList.map((claim) => (
              <Link key={claim.id} to={`/claims/${claim.id}`} className="card-premium hover:shadow-xl transition-all group flex items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${
                    claim.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-500' : 
                    claim.status === 'REJECTED' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-600'
                  }`}>
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">{claim.diagnosis}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{claim.claim_number}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-slate-900">₹{parseFloat(claim.amount_claimed).toLocaleString()}</p>
                  <p className={`text-[8px] font-black uppercase tracking-widest ${
                    claim.status === 'APPROVED' ? 'text-emerald-500' : 
                    claim.status === 'REJECTED' ? 'text-red-500' : 'text-amber-500'
                  }`}>{claim.status}</p>
                </div>
              </Link>
            ))}
            <Link to="/all-claims" className="flex items-center justify-center gap-2 text-[10px] font-black text-[var(--primary)] uppercase tracking-widest hover:translate-x-1 transition-transform pt-4">
              View All Claims Database <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
