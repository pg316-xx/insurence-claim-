import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { 
  Hospital as HospitalIcon, 
  MapPin, 
  Phone, 
  Mail, 
  Activity, 
  PlusCircle, 
  RefreshCw,
  Search,
  Filter,
  CheckCircle,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';

const HospitalsPage = () => {
  const { data: hospitals, isLoading, refetch } = useQuery({
    queryKey: ['admin-hospitals-full'],
    queryFn: async () => {
      const res = await api.get('/hospitals');
      return res.data;
    }
  });

  if (isLoading) return <div className="flex h-[60vh] items-center justify-center"><div className="w-10 h-10 border-4 border-slate-200 border-t-[var(--primary)] rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Hospital <span className="gold-text">Network</span></h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest flex items-center gap-2">
            <Activity size={14} className="text-[var(--primary)]" />
            Active Medical Facilities
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="bg-white border border-slate-100 rounded-2xl pl-12 pr-6 py-4 text-xs font-bold w-64 shadow-sm focus:ring-2 focus:ring-[var(--primary)] outline-none" placeholder="Search facilities..." />
          </div>
          <button onClick={() => refetch()} className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-[var(--primary)] shadow-sm transition-all"><RefreshCw size={20} /></button>
        </div>
      </div>

      <div className="card-premium !p-0 overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-slate-900 text-white">
            <tr>
              <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest">Medical Facility</th>
              <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest">Location Details</th>
              <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest">Network Status</th>
              <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-right">Verification</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {hospitals?.map((h, i) => (
              <motion.tr 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                key={h.id} 
                className="hover:bg-slate-50/50 transition-all group"
              >
                <td className="px-10 py-8">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-[var(--primary)] group-hover:text-white transition-all shadow-sm">
                      <HospitalIcon size={24} />
                    </div>
                    <div>
                      <p className="text-lg font-black text-slate-900">{h.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Facility ID: {h.id.slice(0, 8)}</p>
                    </div>
                  </div>
                </td>
                <td className="px-10 py-8">
                  <div className="flex items-center gap-3 text-slate-500 mb-1">
                    <MapPin size={14} className="text-[var(--primary)]" />
                    <span className="text-xs font-bold">{h.location}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400">
                    <Mail size={14} />
                    <span className="text-[10px] font-medium tracking-tight">network.contact@{h.name.toLowerCase().replace(/\s+/g, '')}.com</span>
                  </div>
                </td>
                <td className="px-10 py-8">
                   <div className="flex items-center gap-2">
                     <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                     <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Active & Cashless Ready</span>
                   </div>
                </td>
                <td className="px-10 py-8 text-right">
                  <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                    <CheckCircle size={14} />
                    Verified Partner
                  </div>
                </td>
              </motion.tr>
            ))}
            {(!hospitals || hospitals.length === 0) && (
               <tr>
                 <td colSpan="4" className="px-10 py-32 text-center text-slate-300 font-black uppercase text-xs tracking-[0.2em]">No hospitals found in database</td>
               </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center pt-8">
        <button className="btn-gold !px-12 !py-5 flex items-center gap-3 shadow-2xl">
          <PlusCircle size={20} /> Onboard New Hospital
        </button>
      </div>
    </div>
  );
};

export default HospitalsPage;
