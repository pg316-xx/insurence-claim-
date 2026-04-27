'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { 
  ShieldCheck, User as UserIcon, Lock, Mail, 
  ArrowRight, Sparkles, ShieldAlert 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer'); // Role selection added
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Clear old session
    localStorage.removeItem('token');
    localStorage.removeItem('role');

    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    try {
      const res = await api.post('/users/login', formData);
      console.log('Login response:', res.data); // Debug log

      if (!res.data || !res.data.role) {
        throw new Error('Authentication followed, but user permissions were not received. Please contact an Admin.');
      }

      const userRole = res.data.role.toLowerCase();
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('role', userRole);

      // Verify if the logged-in role matches the selected role
      if (userRole !== role) {
        alert(`Warning: You logged in as ${userRole}, but you selected ${role}. We are redirecting you to your correct dashboard.`);
      }

      if (userRole === 'admin') {
        router.push('/');
      } else {
        router.push('/client');
      }
    } catch (err) {
      console.error('Login error:', err);
      const detail = err.response?.data?.detail;
      const errorMsg = typeof detail === 'string' ? detail : JSON.stringify(detail) || 'Invalid credentials';
      alert('Login failed: ' + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#030712', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <main style={{ width: '100%', maxWidth: '450px' }}>
        
        <header style={{ textAlign: 'center', marginBottom: '40px' }}>
           <div style={{ display: 'inline-flex', background: 'linear-gradient(45deg, #3b82f6, #2563eb)', padding: '12px', borderRadius: '20px', marginBottom: '20px', boxShadow: '0 0 30px rgba(59, 130, 246, 0.4)' }}>
              <Sparkles size={32} color="white" />
           </div>
           <h1 style={{ fontSize: '2.2rem', fontWeight: '900', color: 'white', marginBottom: '8px' }}>Security Login</h1>
           <p style={{ color: '#94a3b8' }}>Please select your access level to continue</p>
        </header>

        {/* Role Selector */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
           <button 
             onClick={() => setRole('customer')}
             className="glass" 
             style={{ 
               padding: '20px', borderRadius: '16px', cursor: 'pointer', transition: '0.3s',
               border: role === 'customer' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
               opacity: role === 'customer' ? 1 : 0.6,
               background: role === 'customer' ? 'rgba(59, 130, 246, 0.1)' : 'transparent'
             }}
           >
              <UserIcon size={24} color={role === 'customer' ? 'var(--primary)' : '#94a3b8'} style={{ marginBottom: '8px' }}/>
              <div style={{ fontWeight: '700', color: 'white' }}>Client Portal</div>
           </button>
           <button 
             onClick={() => setRole('admin')}
             className="glass" 
             style={{ 
               padding: '20px', borderRadius: '16px', cursor: 'pointer', transition: '0.3s',
               border: role === 'admin' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
               opacity: role === 'admin' ? 1 : 0.6,
               background: role === 'admin' ? 'rgba(59, 130, 246, 0.1)' : 'transparent'
             }}
           >
              <ShieldCheck size={24} color={role === 'admin' ? 'var(--primary)' : '#94a3b8'} style={{ marginBottom: '8px' }}/>
              <div style={{ fontWeight: '700', color: 'white' }}>Admin Control</div>
           </button>
        </div>

        <form onSubmit={handleLogin} className="glass card" style={{ padding: '40px' }}>
          <div style={{ marginBottom: '24px' }}>
             <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '8px', fontWeight: '700' }}>IDENTIFICATION (EMAIL)</label>
             <div style={{ position: 'relative' }}>
                <Mail size={18} color="#4b5563" style={{ position: 'absolute', left: '16px', top: '18px' }}/>
                <input 
                  type="email" required className="input-field" placeholder="pavan@example.com" value={email} onChange={(e) => setEmail(e.target.value)} 
                  style={{ paddingLeft: '48px' }}
                />
             </div>
          </div>

          <div style={{ marginBottom: '32px' }}>
             <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '8px', fontWeight: '700' }}>ACCESS KEY (PASSWORD)</label>
             <div style={{ position: 'relative' }}>
                <Lock size={18} color="#4b5563" style={{ position: 'absolute', left: '16px', top: '18px' }}/>
                <input 
                  type="password" required className="input-field" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} 
                  style={{ paddingLeft: '48px' }}
                />
             </div>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: '1.1rem', padding: '16px' }}>
            {loading ? 'Authenticating...' : <><ArrowRight size={20} /> Authorize Access</>}
          </button>

          <p style={{ textAlign: 'center', marginTop: '32px', color: '#94a3b8', fontSize: '0.9rem' }}>
            New to the system? <Link href="/register" style={{ color: 'var(--primary)', fontWeight: '700', textDecoration: 'none' }}>Create Account</Link>
          </p>
        </form>

        <div style={{ marginTop: '32px', display: 'flex', gap: '12px', padding: '16px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.05)' }}>
           <ShieldAlert size={28} color="var(--primary)" />
           <p style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: '1.4' }}>
              All login attempts are logged for security audits. Unauthorized access to the Admin Control Panel is strictly prohibited.
           </p>
        </div>
      </main>
    </div>
  );
}
