import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  Calendar,
  Zap,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const PoliciesPage = () => {
  const { data: policies, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['my-policies'],
    queryFn: async () => {
      const res = await api.get('/policies/my');
      return res.data;
    },
    retry: 3
  });

  if (isLoading) return <div className="flex h-[60vh] items-center justify-center"><div className="w-10 h-10 border-4 border-slate-200 border-t-[var(--primary)] rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-12 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">My <span className="gold-text">Policies</span></h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest flex items-center gap-2">
            <Shield size={14} className="text-[var(--primary)]" />
            Active Insurance Coverage
          </p>
        </div>
        <button onClick={() => refetch()} className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-[var(--primary)] transition-all"><RefreshCw size={20} /></button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {policies?.map((policy, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={policy.id} 
            className="card-premium group hover:shadow-2xl transition-all border-l-8 border-l-[var(--primary)]"
          >
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{policy.policy_number}</p>
                <h3 className="text-2xl font-black text-slate-900 group-hover:text-[var(--primary)] transition-colors">Health Shield Elite</h3>
              </div>
              <div className="bg-emerald-50 text-emerald-600 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                Active
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 py-8 border-y border-slate-50 mb-8">
               <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Coverage Limit</p>
                 <p className="text-2xl font-black text-slate-900">₹{parseFloat(policy.coverage_amount).toLocaleString()}</p>
               </div>
               <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Renewal Date</p>
                 <p className="text-sm font-black text-slate-800">{new Date(policy.end_date).toLocaleDateString()}</p>
               </div>
            </div>

            <div className="flex justify-between items-center">
               <div className="flex items-center gap-2 text-[var(--primary)]">
                 <CheckCircle size={16} />
                 <span className="text-[10px] font-black uppercase tracking-widest">Network Hospitals Included</span>
               </div>
               <button className="text-slate-400 group-hover:text-[var(--primary)] transition-colors"><ArrowRight size={20} /></button>
            </div>
          </motion.div>
        ))}

        {(!policies || policies.length === 0) && (
          <div className="col-span-2 p-20 text-center card-premium border-dashed border-2 border-slate-100 bg-slate-50/20">
             <AlertCircle size={48} className="mx-auto mb-4 text-slate-200" />
             <p className="text-slate-400 font-black uppercase text-xs tracking-widest">No policies found in your account</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PoliciesPage;
