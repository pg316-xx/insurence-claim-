import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ArrowUpRight, AlertCircle, RefreshCw } from 'lucide-react';

const TPAQueue = () => {
  const navigate = useNavigate();
  const { data: claims, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['claim-queue'],
    queryFn: async () => {
      try {
        const res = await api.get('/claims/queue');
        return res.data;
      } catch (err) {
        console.error("Fetch Error:", err);
        throw new Error(err.response?.data?.message || "Could not connect to database. Please check your Supabase connection.");
      }
    },
    retry: 1,
  });

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <div className="w-12 h-12 border-4 border-[var(--primary-light)] border-t-[var(--primary)] rounded-full animate-spin" />
      <p className="text-slate-400 font-medium">Loading claim queue...</p>
    </div>
  );

  if (isError) return (
    <div className="flex flex-col items-center justify-center h-[60vh] p-6 text-center">
      <div className="bg-red-50 border border-red-200 text-red-700 p-8 rounded-2xl max-w-md shadow-sm">
        <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
        <h2 className="text-xl font-bold mb-2">Connection Error</h2>
        <p className="text-sm text-red-600 mb-6">{error.message}</p>
        <button 
          onClick={() => refetch()} 
          className="btn-gold flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold"
        >
          <RefreshCw size={18} />
          Retry Connection
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            className="input-field pl-10"
            placeholder="Search by claim #, patient name..."
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium transition-colors">
            <Filter size={18} />
            Filter
          </button>
        </div>
      </div>

      <div className="card !p-0 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Claim Details</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Patient</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Type</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Amount</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {claims?.map((claim) => (
              <tr key={claim.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-bold text-slate-800">{claim.claim_number}</p>
                  <p className="text-xs text-slate-400">Submitted {new Date(claim.created_at).toLocaleDateString()}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-slate-800">{claim.user?.name || 'Unknown'}</p>
                  <p className="text-xs text-slate-500">{claim.user?.email || 'N/A'}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    claim.type === 'CASHLESS' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {claim.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                  ₹{claim.amount_claimed?.toLocaleString() || '0'}
                </td>
                <td className="px-6 py-4">
                  <span className="flex items-center gap-1.5 text-blue-600 text-sm font-medium">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                    {claim.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => navigate(`/claims/${claim.id}`)}
                    className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-bold text-sm"
                  >
                    Review
                    <ArrowUpRight size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {(!claims || claims.length === 0) && (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-slate-400 italic">Queue is empty.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TPAQueue;
