'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { 
  User as UserIcon, Lock, Mail, ArrowRight, 
  Sparkles, ShieldCheck, Wallet, Smartphone 
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [upiId, setUpiId] = useState(''); // New field
  const [role, setRole] = useState('customer');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/users/register', {
        name,
        email,
        password,
        role,
        upi_id: upiId // Pass UPI ID
      });
      alert('Registration successful! Please check your email for verification if prompted.');
      router.push('/login');
    } catch (err) {
      alert('Registration failed: ' + (err.response?.data?.detail || 'User already exists or network error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#030712', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <main style={{ width: '100%', maxWidth: '480px' }}>
        <header style={{ textAlign: 'center', marginBottom: '40px' }}>
           <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'white', marginBottom: '8px' }}>Join the Network</h1>
           <p style={{ color: '#94a3b8' }}>Create your account to secure your policy today.</p>
        </header>

        <form onSubmit={handleRegister} className="glass card" style={{ padding: '40px' }}>
          <div style={{ marginBottom: '20px' }}>
             <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '8px', fontWeight: '700' }}>FULL NAME</label>
             <div style={{ position: 'relative' }}>
                <UserIcon size={18} color="#4b5563" style={{ position: 'absolute', left: '16px', top: '18px' }}/>
                <input type="text" required className="input-field" placeholder="Pavan Kumar" value={name} onChange={(e) => setName(e.target.value)} style={{ paddingLeft: '48px' }} />
             </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
             <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '8px', fontWeight: '700' }}>EMAIL ADDRESS</label>
             <div style={{ position: 'relative' }}>
                <Mail size={18} color="#4b5563" style={{ position: 'absolute', left: '16px', top: '18px' }}/>
                <input type="email" required className="input-field" placeholder="pavan@example.com" value={email} onChange={(e) => setEmail(e.target.value)} style={{ paddingLeft: '48px' }} />
             </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
             <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '8px', fontWeight: '700' }}>UPI ID (FOR PAYOUTS)</label>
             <div style={{ position: 'relative' }}>
                <Smartphone size={18} color="var(--primary)" style={{ position: 'absolute', left: '16px', top: '18px' }}/>
                <input type="text" required className="input-field" placeholder="pavan@okaxis" value={upiId} onChange={(e) => setUpiId(e.target.value)} style={{ paddingLeft: '48px' }} />
             </div>
          </div>

          <div style={{ marginBottom: '32px' }}>
             <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '8px', fontWeight: '700' }}>SECURITY KEY</label>
             <div style={{ position: 'relative' }}>
                <Lock size={18} color="#4b5563" style={{ position: 'absolute', left: '16px', top: '18px' }}/>
                <input type="password" required className="input-field" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} style={{ paddingLeft: '48px' }} />
             </div>
          </div>

          <div style={{ marginBottom: '32px' }}>
             <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '8px', fontWeight: '700' }}>ACCESS ROLE</label>
             <select className="input-field" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="customer">🛡️ Policy Subscriber (Client)</option>
                <option value="admin">🏢 Risk Manager (Admin)</option>
             </select>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '16px' }}>
            {loading ? 'Creating Profile...' : <><ShieldCheck size={20} /> Register & Secure Account</>}
          </button>

          <p style={{ textAlign: 'center', marginTop: '32px', color: '#94a3b8', fontSize: '0.9rem' }}>
            Already have an account? <Link href="/login" style={{ color: 'var(--primary)', fontWeight: '700', textDecoration: 'none' }}>Back to Secure Login</Link>
          </p>
        </form>

        <div style={{ marginTop: '32px', padding: '20px', borderRadius: '16px', background: 'rgba(16, 185, 129, 0.05)', display: 'flex', gap: '16px' }}>
           <Wallet size={32} color="var(--accent)" />
           <p style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: '1.4' }}>
              Your **UPI ID** is encrypted and only used for direct bank transfers upon insurance claim approval. Never share your UPI PIN with anyone.
           </p>
        </div>
      </main>
    </div>
  );
}
