'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, Send, Upload, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function NewClaim() {
  const [formData, setFormData] = useState({
    type: 'Health',
    amount: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount)
      };
      await api.post('/claims/', payload);
      alert('🔒 CLAIM SECURED: Your request has been written to the ledger.');
      router.push('/client');
    } catch (err) {
      alert('Submission failed: ' + (err.response?.data?.detail || 'Database transaction error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', padding: '40px' }}>
      <header style={{ maxWidth: '600px', margin: '0 auto 40px' }}>
        <Link href="/client" style={{ color: 'var(--text-dim)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <ArrowLeft size={18} /> Back Dashboard
        </Link>
        <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Submit New Claim</h1>
      </header>

      <main style={{ maxWidth: '600px', margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass card">
          <form onSubmit={handleSubmit}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-dim)' }}>Insurance Type</label>
            <select 
              className="input-field" 
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              style={{ paddingRight: '40px' }}
            >
              <option value="Health">⚕️ Health Insurance</option>
              <option value="Vehicle">🚗 Vehicle Damage</option>
              <option value="Life">🕊️ Life Insurance</option>
              <option value="Property">🏠 Property / Land</option>
            </select>

            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-dim)' }}>Estimated Amount (₹)</label>
            <input 
              className="input-field" 
              type="number" 
              placeholder="0.00"
              required
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
            />

            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-dim)' }}>Detailed Description</label>
            <textarea 
              className="input-field" 
              rows="4" 
              placeholder="Describe the incident and documents you will provide..."
              required
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              style={{ resize: 'none' }}
            />

            <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '16px', borderRadius: '8px', marginBottom: '24px', display: 'flex', gap: '12px' }}>
               <Info size={20} color="var(--primary)" />
               <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                 After submitting this form, you will be able to upload your supporting documents (Land titles, medical reports, etc.) from the claim detail page.
               </p>
            </div>

            <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Submitting...' : <><Send size={18} /> Submit Claim</>}
            </button>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
