import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Mail, Lock, User, Phone, MapPin, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../api/supabase';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    role: 'CUSTOMER'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            role: formData.role,
            phone: formData.phone,
            address: formData.address
          }
        }
      });

      if (signUpError) throw signUpError;
      
      alert('Registration successful! Please check your email for verification (if enabled) or login now.');
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FCFAF7] relative overflow-hidden py-20">
      {/* Decorative Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--primary-light)] opacity-[0.05] rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--primary-dark)] opacity-[0.05] rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl w-full flex flex-col items-center z-10 p-4"
      >
        <div className="mb-10 text-center">
          <motion.div 
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-xl mb-6 border border-slate-100"
          >
            <Shield size={32} className="text-[var(--primary)]" />
          </motion.div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Create <span className="gold-text">Account</span></h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-2">
            <Sparkles size={14} className="text-[var(--primary)]" />
            Join the Elite Network
          </p>
        </div>

        <div className="w-full bg-white rounded-[40px] shadow-[0_40px_100px_rgba(0,0,0,0.04)] border border-slate-100 p-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-[var(--gold-gradient)]" />
          
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm mb-8 border border-red-100 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[var(--primary)] transition-colors"><User size={18} /></div>
                <input name="name" required className="input-premium pl-12" placeholder="John Doe" value={formData.name} onChange={handleChange} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[var(--primary)] transition-colors"><Mail size={18} /></div>
                <input name="email" type="email" required className="input-premium pl-12" placeholder="name@company.com" value={formData.email} onChange={handleChange} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[var(--primary)] transition-colors"><Lock size={18} /></div>
                <input name="password" type="password" required className="input-premium pl-12" placeholder="••••••••" value={formData.password} onChange={handleChange} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[var(--primary)] transition-colors"><Phone size={18} /></div>
                <input name="phone" className="input-premium pl-12" placeholder="+91 XXXXX XXXXX" value={formData.phone} onChange={handleChange} />
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Residential Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[var(--primary)] transition-colors"><MapPin size={18} /></div>
                <input name="address" className="input-premium pl-12" placeholder="Full address details..." value={formData.address} onChange={handleChange} />
              </div>
            </div>

            <div className="md:col-span-2 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-gold py-5 text-lg flex items-center justify-center gap-3 group shadow-2xl"
              >
                {loading ? 'Creating Account...' : 'Register Account'}
                {!loading && <ArrowRight size={20} className="group-hover:translate-x-1.5 transition-transform" />}
              </button>
            </div>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-50 text-center">
            <p className="text-sm text-slate-400 font-medium">
              Already have an account? <Link to="/login" className="text-[var(--primary)] font-black hover:underline">Login Now</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
