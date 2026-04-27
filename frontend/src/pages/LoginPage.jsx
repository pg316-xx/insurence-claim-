import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FCFAF7] relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--primary-light)] opacity-[0.05] rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--primary-dark)] opacity-[0.05] rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-xl w-full flex flex-col items-center z-10 p-4"
      >
        <div className="mb-10 text-center">
          <motion.div 
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-[0_20px_50px_rgba(197,160,40,0.2)] mb-6 border border-[var(--primary-light)]"
          >
            <Shield size={40} className="text-[var(--primary)]" />
          </motion.div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">
            Health<span className="gold-text font-black">Guard</span>
          </h1>
          <p className="text-slate-500 font-medium tracking-wide uppercase text-xs flex items-center justify-center gap-2">
            <Sparkles size={14} className="text-[var(--primary)]" />
            Elite Claim Management
          </p>
        </div>

        <div className="w-full bg-white rounded-[40px] shadow-[0_40px_100px_rgba(0,0,0,0.04)] border border-slate-100 p-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-[var(--gold-gradient)]" />
          
          {error && (
            <motion.div 
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm mb-8 border border-red-100 font-medium"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-800 ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[var(--primary)] transition-colors">
                  <Mail size={20} />
                </div>
                <input
                  type="email"
                  required
                  className="input-premium pl-14"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-bold text-slate-800">Password</label>
                <a href="#" className="text-xs font-bold text-[var(--primary)] hover:underline">Forgot?</a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[var(--primary)] transition-colors">
                  <Lock size={20} />
                </div>
                <input
                  type="password"
                  required
                  className="input-premium pl-14"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-gold py-4 text-lg flex items-center justify-center gap-3 group"
            >
              {loading ? 'Authenticating...' : 'Enter Dashboard'}
              {!loading && <ArrowRight size={20} className="group-hover:translate-x-1.5 transition-transform" />}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-slate-50 text-center space-y-4">
            <p className="text-xs text-slate-400 font-medium">
              Secured with Enterprise-Grade Encryption
            </p>
            <p className="text-sm text-slate-500 font-medium">
              New to HealthGuard? <Link to="/register" className="text-[var(--primary)] font-black hover:underline">Create Account</Link>
            </p>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 grid grid-cols-4 gap-4 w-full max-w-lg opacity-60 hover:opacity-100 transition-opacity"
        >
          {[
            { role: 'ADMIN', email: 'admin@gmail.com' },
            { role: 'TPA', email: 'tpa@gmail.com' },
            { role: 'CUSTOMER', email: 'client@gmail.com' },
            { role: 'HOSPITAL', email: 'hospital@gmail.com' }
          ].map((item) => (
            <div key={item.role} className="text-center cursor-pointer" onClick={() => { setEmail(item.email); setPassword('pavan12345'); }}>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.role}</p>
              <p className="text-[10px] font-bold text-slate-600">{item.email}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
