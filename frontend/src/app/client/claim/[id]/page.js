'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { 
  ArrowLeft, Upload, FileCheck, File as FileIcon, 
  Clock, AlertCircle, CheckCircle2, CircleDashed, Wallet 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function ClaimDetail() {
  const { id } = useParams();
  const [claim, setClaim] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState('Land Title');
  const router = useRouter();

  const fetchDetail = async () => {
    try {
      // 1. Fetch Claim Status
      const claimRes = await api.get(`/claims/${id}`);
      setClaim(claimRes.data);

      // 2. Fetch Associated Documents
      const docsRes = await api.get(`/claims/${id}/documents`);
      setDocuments(docsRes.data);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 403) router.push('/client');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) router.push('/login');
    else fetchDetail();
  }, [id]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('doc_type', docType);

    try {
      await api.post(`/claims/${id}/documents`, formData);
      fetchDetail();
    } catch (err) {
      alert('Upload failed: ' + (err.response?.data?.detail || 'Storage error'));
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '100px', color: '#94a3b8' }}>Establishing secure connection...</div>;
  if (!claim) return <div style={{ textAlign: 'center', padding: '100px' }}>Claim not found or access denied.</div>;

  const steps = [
    { label: 'Submitted', status: 'completed', icon: <FileCheck size={20}/> },
    { label: 'Under Review', status: claim.status === 'pending' ? 'active' : 'completed', icon: <CircleDashed size={20}/> },
    { label: 'Approved', status: claim.status === 'approved' ? 'completed' : 'pending', icon: <CheckCircle2 size={20}/> },
    { label: 'Disbursed', status: 'pending', icon: <Wallet size={20}/> }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#030712', padding: '40px 20px' }}>
      <header style={{ maxWidth: '1000px', margin: '0 auto 40px' }}>
        <Link href="/client" style={{ color: '#94a3b8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
          <ArrowLeft size={18} /> Back to My Portfolio
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
           <div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'white', marginBottom: '8px' }}>Claim Status Tracking</h1>
              <p style={{ color: '#94a3b8' }}>Policy ID: <span style={{ color: 'var(--primary)', fontFamily: 'monospace' }}>{claim.id}</span></p>
           </div>
           {claim.status === 'approved' && (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass" style={{ padding: '16px 24px', borderRadius: '16px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--accent)' }}>
                 <div style={{ color: 'var(--accent)', fontSize: '0.8rem', fontWeight: '800', marginBottom: '4px' }}>VERIFIED FOR PAYOUT</div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white' }}>
                    <Clock size={16} color="var(--accent)"/> <span>Deadline: {new Date(claim.payment_deadline).toLocaleTimeString()}</span>
                 </div>
              </motion.div>
           )}
        </div>
      </header>

      <main style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Progress Tracker */}
        <section className="glass card" style={{ padding: '40px', marginBottom: '40px', display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
           <div style={{ position: 'absolute', top: '56px', left: '80px', right: '80px', height: '2px', background: 'rgba(255,255,255,0.05)', zIndex: 0 }}></div>
           {steps.map((step, idx) => (
              <div key={idx} style={{ position: 'relative', zIndex: 1, textAlign: 'center', flex: 1 }}>
                 <div style={{ 
                    width: '40px', height: '40px', borderRadius: '50%', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: step.status === 'completed' ? 'var(--accent)' : step.status === 'active' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                    color: step.status === 'pending' ? '#4b5563' : 'white',
                    boxShadow: step.status === 'active' ? '0 0 20px var(--primary-glow)' : 'none'
                 }}>
                    {step.icon}
                 </div>
                 <div style={{ fontSize: '0.9rem', fontWeight: '700', color: step.status === 'pending' ? '#4b5563' : 'white' }}>{step.label}</div>
              </div>
           ))}
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '32px' }}>
           <div>
              <section className="glass card" style={{ padding: '32px' }}>
                 <h3 style={{ marginBottom: '24px', fontSize: '1.2rem', color: 'white' }}>Policy Information</h3>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div>
                       <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '4px' }}>INSURANCE TYPE</div>
                       <div style={{ fontWeight: '700' }}>{claim.type} Professional</div>
                    </div>
                    <div>
                       <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '4px' }}>CLAIMED AMOUNT</div>
                       <div style={{ fontSize: '1.3rem', fontWeight: '900', color: 'var(--primary)' }}>₹{claim.amount}</div>
                    </div>
                 </div>
                 <div style={{ marginTop: '24px' }}>
                    <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '4px' }}>INCIDENT DESCRIPTION</div>
                    <p style={{ lineHeight: '1.6', color: '#e5e7eb' }}>{claim.description}</p>
                 </div>
              </section>

              <section className="glass card" style={{ padding: '32px', marginTop: '32px' }}>
                 <h3 style={{ marginBottom: '24px', fontSize: '1.2rem', color: 'white' }}>Evidence Log</h3>
                 <div style={{ display: 'grid', gap: '12px' }}>
                    {documents.map((doc) => (
                       <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={doc.id} className="glass" style={{ padding: '16px', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                             <FileIcon size={24} color="var(--primary)" />
                             <div>
                                <div style={{ fontWeight: '600' }}>{doc.type}</div>
                                <div style={{ fontSize: '0.75rem', color: doc.verified ? 'var(--accent)' : '#94a3b8' }}>
                                   {doc.verified ? '✓ Verified by Admin' : '⏳ Awaiting Review'}
                                </div>
                             </div>
                          </div>
                          <a href={doc.file_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '0.9rem', textDecoration: 'none' }}>Open Document</a>
                       </motion.div>
                    ))}
                    {documents.length === 0 && <div style={{ textAlign: 'center', padding: '40px', color: '#4b5563' }}>No files provided yet.</div>}
                 </div>
              </section>
           </div>

           <aside>
              <section className="glass card" style={{ padding: '32px', position: 'sticky', top: '40px' }}>
                 <h3 style={{ marginBottom: '16px', color: 'white' }}>Secure Upload</h3>
                 <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '24px' }}>
                    Attach your land titles or bank statements to speed up the approval process.
                 </p>

                 <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '8px' }}>DOCUMENT TYPE</label>
                 <select className="input-field" value={docType} onChange={(e) => setDocType(e.target.value)}>
                    <option value="Land Title">📜 Land Title</option>
                    <option value="ID Proof">🆔 Identity Document</option>
                    <option value="Bank Statement">🏦 Bank Statement</option>
                    <option value="Medical Report">🏥 Medical Report</option>
                 </select>

                 <label className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', transition: '0.3s', opacity: uploading ? 0.6 : 1 }}>
                    {uploading ? 'Processing File...' : <><Upload size={20} /> Upload Evidence</>}
                    <input type="file" hidden disabled={uploading} onChange={handleFileUpload} />
                 </label>

                 <div style={{ marginTop: '32px', padding: '16px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.05)', display: 'flex', gap: '12px' }}>
                    <AlertCircle size={32} color="var(--danger)" />
                    <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                       Unauthorized or manipulated documents will result in immediate policy termination and account freeze.
                    </p>
                 </div>
              </section>
           </aside>
        </div>
      </main>
    </div>
  );
}
