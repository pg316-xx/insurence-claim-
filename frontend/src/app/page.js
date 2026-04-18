'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { 
  Users, FileText, CheckCircle, XCircle, Clock, Wallet, 
  LogOut, ShieldCheck, X, ExternalLink, FileIcon, Eye, CreditCard, 
  Smartphone, Trash2, Sparkles, Loader2, ShieldAlert, Fingerprint, Banknote,
  LayoutDashboard, BarChart3, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [selectedClaimDocs, setSelectedClaimDocs] = useState(null);
  const [showDirectPayout, setShowDirectPayout] = useState(null); 
  const [payoutStep, setPayoutStep] = useState('confirm'); 
  const [docsLoading, setDocsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) router.push('/login');
    else fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      const res = await api.get('/claims/admin/all');
      setClaims(res.data);
    } catch (err) {
      if (err.response?.status === 401) logout();
    } finally {
      setLoading(false);
    }
  };

  const handleManualPayout = async (claimId) => {
    setPayoutStep('processing');
    try {
      const mockTxnId = 'SETTLE-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      await api.put(`/claims/${claimId}/paid`, null, { params: { payment_id: mockTxnId } });
      
      setTimeout(() => {
        setPayoutStep('success');
        fetchClaims();
      }, 2000);
    } catch (err) {
      alert('Settlement database update failed. please run SQL.');
      setShowDirectPayout(null);
    }
  };

  const approveClaim = async (id) => {
    setProcessingId(id);
    try {
      await api.put(`/claims/${id}/approve`, null, { params: { deadline_hours: 24 } });
      fetchClaims();
    } finally {
      setProcessingId(null);
    }
  };

  const rejectClaim = async (id) => {
    if (!confirm('Are you sure you want to REJECT this claim?')) return;
    setProcessingId(id);
    try {
      await api.put(`/claims/${id}/reject`);
      alert('❌ Claim Officially Rejected.');
      fetchClaims();
    } catch (err) {
      alert('Rejection failed.');
    } finally {
      setProcessingId(null);
    }
  };

  const openDocs = async (claimId) => {
    setDocsLoading(true);
    const targetClaim = claims.find(c => c.id === claimId);
    setSelectedClaimDocs({ id: claimId, files: [], upi_id: targetClaim?.upi_id });
    try {
      const res = await api.get(`/claims/${claimId}/documents`);
      setSelectedClaimDocs({ id: claimId, files: res.data, upi_id: targetClaim?.upi_id });
    } catch (err) {
      alert('Failed to load documents.');
    } finally {
      setDocsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const stats = {
    pending: claims.filter(c => c.status === 'pending').length,
    settled: claims.filter(c => c.status === 'paid').reduce((acc, c) => acc + (c.amount || 0), 0)
  };

  const tabs = [
    { id: 'overview', label: 'Claims Queue', icon: LayoutDashboard },
    { id: 'underwriters', label: 'Underwriters', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  return (
    <div style={{ background: '#020617', display: 'flex', color: 'white', minHeight: '100vh' }}>
      
      {/* Sidebar */}
      <aside className="glass" style={{ width: '300px', padding: '40px', borderRight: '1px solid #1e293b', height: '100vh', position: 'sticky', top: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '60px' }}>
          <ShieldCheck size={30} color="#3b82f6" />
          <h2 style={{ fontSize: '1.4rem', fontWeight: '900' }}>AdminHub</h2>
        </div>
        <nav style={{ flex: 1, display: 'grid', gap: '10px', alignContent: 'start' }}>
          {tabs.map((tab) => (
            <div 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)}
              style={{ 
                padding: '12px 20px', borderRadius: '12px', 
                background: activeTab === tab.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                color: activeTab === tab.id ? '#3b82f6' : '#94a3b8',
                fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', transition: '0.2s'
              }}
            >
              <tab.icon size={18} /> {tab.label}
            </div>
          ))}
        </nav>
        <button onClick={logout} className="btn" style={{ color: '#ef4444', width: '100%', background: 'rgba(239, 68, 68, 0.05)' }}>
           <LogOut size={18} /> Logout
        </button>
      </aside>

      {/* Main Container */}
      <main style={{ flex: 1, padding: '40px 60px' }}>
        
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
              <header style={{ marginBottom: '40px' }}>
                 <h1 style={{ fontSize: '3rem', fontWeight: '900' }}>Claims Queue</h1>
                 <p style={{ color: '#94a3b8' }}>Authorized settlement node for INR payouts.</p>
              </header>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }}>
                 <div className="glass card" style={{ padding: '32px' }}>
                   <Clock size={20} color="#3b82f6" />
                   <div style={{ fontSize: '2rem', fontWeight: '900', marginTop: '10px' }}>{stats.pending}</div>
                   <div style={{ color: '#4b5563', fontSize: '0.8rem' }}>PENDING REVIEW</div>
                 </div>
                 <div className="glass card" style={{ padding: '32px' }}>
                   <Wallet size={20} color="#10b981" />
                   <div style={{ fontSize: '2rem', fontWeight: '900', marginTop: '10px', color: '#10b981' }}>₹{stats.settled.toLocaleString()}</div>
                   <div style={{ color: '#4b5563', fontSize: '0.8rem' }}>SETTLED INR</div>
                 </div>
                 <div className="glass card" style={{ padding: '32px' }}>
                   <Banknote size={20} color="#a855f7" />
                   <div style={{ fontSize: '2rem', fontWeight: '900', marginTop: '10px' }}>{claims.length}</div>
                   <div style={{ color: '#4b5563', fontSize: '0.8rem' }}>TOTAL VOLUME</div>
                 </div>
              </div>

              {/* Claims Table */}
              <div className="glass card" style={{ padding: '0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <tr style={{ textAlign: 'left' }}>
                      <th style={{ padding: '20px 32px', color: '#64748b' }}>POLICY ID</th>
                      <th style={{ padding: '20px 32px', color: '#64748b' }}>AMOUNT</th>
                      <th style={{ padding: '20px 32px', color: '#64748b' }}>STATUS</th>
                      <th style={{ padding: '20px 32px', color: '#64748b' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {claims.map(c => (
                      <tr key={c.id} style={{ borderBottom: '1px solid #1e293b' }}>
                        <td style={{ padding: '24px 32px', color: '#94a3b8' }}>{c.id.slice(0, 15)}...</td>
                        <td style={{ padding: '24px 32px', fontWeight: '900' }}>₹{c.amount}</td>
                        <td style={{ padding: '24px 32px' }}>
                           <span style={{ 
                             padding: '4px 12px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: '800',
                             background: c.status === 'paid' ? 'rgba(16,185,129,0.1)' : 
                                         c.status === 'rejected' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                             color: c.status === 'paid' ? '#10b981' : 
                                    c.status === 'rejected' ? '#ef4444' : '#3b82f6'
                           }}>{c.status.toUpperCase()}</span>
                        </td>
                        <td style={{ padding: '24px 32px' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                             {c.status === 'pending' && (
                               <>
                                 <button disabled={processingId === c.id} className="btn btn-primary" onClick={() => approveClaim(c.id)} style={{ padding: '8px 16px', fontSize: '0.8rem' }}>Approve</button>
                                 <button disabled={processingId === c.id} className="btn" onClick={() => rejectClaim(c.id)} style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.05)', padding: '8px 16px', fontSize: '0.8rem' }}>Reject</button>
                               </>
                             )}
                             {c.status === 'approved' && (
                               <button className="btn btn-primary" style={{ background: '#10b981', padding: '8px 16px', fontSize: '0.8rem' }} onClick={() => { setShowDirectPayout(c); setPayoutStep('confirm'); }}>Disburse INR</button>
                             )}
                             <button className="btn" onClick={() => openDocs(c.id)} style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 16px', fontSize: '0.8rem' }}>Docs</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'underwriters' && (
            <motion.div key="underwriters" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
               <header style={{ marginBottom: '40px' }}>
                  <h1 style={{ fontSize: '3rem', fontWeight: '900' }}>Underwriters</h1>
                  <p style={{ color: '#94a3b8' }}>Risk mitigation and policy verification engine.</p>
               </header>
               <div className="glass card" style={{ padding: '50px', textAlign: 'center' }}>
                  <Activity size={50} color="#3b82f6" style={{ margin: '0 auto 24px' }} />
                  <p style={{ color: '#94a3b8' }}>Underwriter network is currently monitoring all active INR flows.</p>
               </div>
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div key="analytics" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
               <header style={{ marginBottom: '40px' }}>
                  <h1 style={{ fontSize: '3rem', fontWeight: '900' }}>Analytics</h1>
                  <p style={{ color: '#94a3b8' }}>Real-time settlement data visualization.</p>
               </header>
               <div className="glass card" style={{ padding: '50px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '8px' }}>TOTAL DISTRIBUTED INR</div>
                  <div style={{ fontSize: '3rem', fontWeight: '900', color: '#10b981' }}>₹{stats.settled.toLocaleString()}</div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* DISBURSAL TERMINAL */}
      <AnimatePresence>
        {showDirectPayout && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(20px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="glass card" style={{ width: '450px', padding: '50px', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #3b82f6, #10b981)' }} />
                {payoutStep === 'confirm' && (
                   <div style={{ textAlign: 'center' }}>
                      <Fingerprint size={60} color="#3b82f6" style={{ margin: '0 auto 24px' }} />
                      <h2 style={{ fontSize: '1.8rem', fontWeight: '900' }}>Confirm Settlement</h2>
                      <p style={{ color: '#94a3b8', marginTop: '16px' }}>Target Account Verified</p>
                      <div style={{ background: 'rgba(255,255,255,0.03)', padding: '24px', borderRadius: '16px', margin: '32px 0' }}>
                         <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#10b981' }}>₹{showDirectPayout.amount}</div>
                      </div>
                      <button className="btn btn-primary" style={{ width: '100%', padding: '18px', background: '#10b981' }} onClick={() => handleManualPayout(showDirectPayout.id)}>
                         Confirm Bank Transfer
                      </button>
                      <button className="btn" style={{ width: '100%', marginTop: '12px' }} onClick={() => setShowDirectPayout(null)}>Cancel</button>
                   </div>
                )}
                {payoutStep === 'success' && (
                   <div style={{ textAlign: 'center' }}>
                      <CheckCircle size={80} color="#10b981" style={{ margin: '0 auto 24px' }} />
                      <h2 style={{ fontSize: '1.8rem', fontWeight: '900' }}>Disbursed</h2>
                      <button className="btn btn-primary" style={{ width: '100%', marginTop: '32px', padding: '16px' }} onClick={() => setShowDirectPayout(null)}>Finish</button>
                   </div>
                )}
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
