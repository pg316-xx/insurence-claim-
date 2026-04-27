'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { 
  FilePlus, FileText, CheckCircle, Clock, Wallet, 
  LogOut, ArrowRight, ShieldCheck, CreditCard, Sparkles, Smartphone, 
  Settings, Edit, Check, X, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function ClientDashboard() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Client');
  const [userUpi, setUserUpi] = useState('pavan@okaxis');
  const [isEditingUpi, setIsEditingUpi] = useState(false);
  const [newUpi, setNewUpi] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token) {
      router.push('/login');
    } else if (role === 'admin') {
      router.push('/');
    } else {
      fetchMyData();
    }
  }, []);

  const fetchMyData = async () => {
    try {
      const [claimsRes, userRes] = await Promise.all([
        api.get('/claims/'),
        api.get('/users/me')
      ]);
      setClaims(claimsRes.data);
      setUserName(userRes.data.name);
      setUserUpi(userRes.data.upi_id || 'not_provided');
      setNewUpi(userRes.data.upi_id || '');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUpi = async () => {
    try {
      await api.patch('/users/me/upi', null, { params: { upi_id: newUpi } });
      setUserUpi(newUpi);
      setIsEditingUpi(false);
      alert('✅ Payout Profile Updated!');
    } catch (err) {
      alert('Failed to update UPI. Please check your data.');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    router.push('/login');
  };

  const totals = {
    active: claims.length,
    payout: claims.filter(c => c.status === 'approved').reduce((acc, c) => acc + c.amount, 0)
  };

  return (
    <div style={{ minHeight: '100vh', background: '#030712', color: 'white', overflowY: 'visible' }}>
      {/* Header */}
      <nav style={{ padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', background: 'rgba(3, 7, 18, 0.9)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 100 }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'var(--primary)', padding: '8px', borderRadius: '12px' }}>
               <ShieldCheck size={24} color="white" />
            </div>
            <span style={{ fontWeight: '900', fontSize: '1.2rem' }}>SECURE PORTAL</span>
         </div>
         <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <div style={{ textAlign: 'right' }}>
               <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>AUTHORIZED CLIENT</div>
               <div style={{ fontWeight: '700' }}>{userName}</div>
            </div>
            <button onClick={logout} className="btn" style={{ background: 'rgba(239, 68, 68, 0.05)', color: 'var(--danger)', padding: '10px 20px', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
               <LogOut size={18} />
            </button>
         </div>
      </nav>

      <main style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
        
        <header style={{ marginBottom: '48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <div>
              <h1 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '8px' }}>Policy Dashboard</h1>
              <p style={{ color: '#94a3b8' }}>Welcome back, {userName}. Your risk management is active.</p>
           </div>
           <Link href="/client/new-claim">
              <button className="btn btn-primary" style={{ padding: '16px 32px' }}>
                 <FilePlus size={20} /> New Claim (INR)
              </button>
           </Link>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '32px' }}>
           
           {/* Claims Section */}
           <div style={{ display: 'grid', gap: '24px' }}>
              <section className="glass card" style={{ padding: '32px' }}>
                 <h3 style={{ marginBottom: '24px', fontSize: '1.2rem' }}>Policy Status Tracker</h3>
                 <div style={{ display: 'grid', gap: '12px' }}>
                    {loading ? (
                       <p style={{ textAlign: 'center', padding: '40px' }}>Syncing claims...</p>
                    ) : claims.length === 0 ? (
                       <div style={{ textAlign: 'center', padding: '60px', borderRadius: '20px', background: 'rgba(255,255,255,0.02)' }}>
                          No active claims found in your profile.
                       </div>
                    ) : (
                       claims.map((claim) => (
                          <motion.div key={claim.id} whileHover={{ x: 5 }} onClick={() => router.push(`/client/claim/${claim.id}`)} style={{ padding: '20px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                             <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                <FileText size={20} color="var(--primary)" />
                                <div>
                                   <div style={{ fontWeight: '700' }}>{claim.type} Policy</div>
                                   <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Settlement: ₹{claim.amount}</div>
                                </div>
                             </div>
                             <div style={{ fontSize: '0.75rem', fontWeight: '800', color: claim.status === 'approved' ? 'var(--accent)' : 'var(--primary)', textTransform: 'uppercase' }}>
                                {claim.status}
                             </div>
                          </motion.div>
                       ))
                    )}
                 </div>
              </section>
           </div>

           {/* Sidebar Info */}
           <div style={{ display: 'grid', gap: '24px', alignContent: 'start' }}>
              <div className="glass card" style={{ padding: '32px', background: 'linear-gradient(135deg, #1e40af, #3b82f6)', color: 'white', border: 'none' }}>
                 <div style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: '4px' }}>ESTIMATED PAYOUT</div>
                 <div style={{ fontSize: '2.5rem', fontWeight: '900' }}>₹{totals.payout.toLocaleString()}</div>
                 <div style={{ fontSize: '0.75rem', marginTop: '16px', background: 'rgba(255,255,255,0.1)', padding: '8px 12px', borderRadius: '8px' }}>
                    Connected to IRDAI Secure Node
                 </div>
              </div>

              {/* UPI Card with Edit Mode */}
              <div className="glass card" style={{ padding: '32px' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                       <Smartphone size={18} color="var(--primary)" />
                       <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>Payout Method</span>
                    </div>
                    {!isEditingUpi ? (
                       <button onClick={() => setIsEditingUpi(true)} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                          <Edit size={16} />
                       </button>
                    ) : (
                       <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={handleUpdateUpi} style={{ background: 'transparent', border: 'none', color: 'var(--accent)', cursor: 'pointer' }}><Check size={18}/></button>
                          <button onClick={() => setIsEditingUpi(false)} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}><X size={18}/></button>
                       </div>
                    )}
                 </div>

                 {isEditingUpi ? (
                    <input 
                       className="input-field" 
                       value={newUpi} 
                       onChange={(e) => setNewUpi(e.target.value)} 
                       style={{ padding: '12px', paddingLeft: '16px', fontSize: '0.85rem' }}
                       placeholder="Enter new UPI ID"
                    />
                 ) : (
                    <div style={{ background: 'rgba(59, 130, 246, 0.05)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                       <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px' }}>LINKED UPI ID</div>
                       <div style={{ fontWeight: '700', fontFamily: 'monospace', color: 'white' }}>{userUpi}</div>
                    </div>
                 )}
              </div>

              <div className="glass card" style={{ padding: '32px', background: 'rgba(16, 185, 129, 0.02)', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                 <div style={{ display: 'flex', gap: '16px' }}>
                    <CheckCircle size={28} color="var(--accent)" />
                    <div>
                       <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--accent)' }}>VERIFIED STATUS</div>
                       <p style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>Your profile has been cleared for automated INR disbursal.</p>
                    </div>
                 </div>
              </div>
           </div>

        </div>
      </main>
    </div>
  );
}
