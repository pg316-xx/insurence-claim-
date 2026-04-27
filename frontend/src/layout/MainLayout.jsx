import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  FileText, 
  PlusCircle, 
  LogOut, 
  User, 
  ShieldCheck, 
  Hospital,
  ClipboardList,
  ChevronRight,
  Bell,
  CreditCard
} from 'lucide-react';
import { motion } from 'framer-motion';

const MainLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = {
    CUSTOMER: [
      { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
      { name: 'My Policies', path: '/policies', icon: <ShieldCheck size={20} /> },
      { name: 'My Claims', path: '/my-claims', icon: <FileText size={20} /> },
      { name: 'Premium Payments', path: '/premium-payments', icon: <CreditCard size={20} /> },
      { name: 'Submit Claim', path: '/claims/new', icon: <PlusCircle size={20} /> },
    ],
    TPA: [
      { name: 'Review Queue', path: '/', icon: <ClipboardList size={20} /> },
      { name: 'All Claims', path: '/all-claims', icon: <FileText size={20} /> },
    ],
    ADMIN: [
      { name: 'Admin Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
      { name: 'Manage Claims', path: '/all-claims', icon: <FileText size={20} /> },
      { name: 'Hospitals', path: '/hospitals', icon: <Hospital size={20} /> },
    ],
    HOSPITAL: [
      { name: 'Hospital Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
      { name: 'Pre-Auth Request', path: '/claims/new', icon: <PlusCircle size={20} /> },
      { name: 'Hospital Claims', path: '/my-claims', icon: <FileText size={20} /> },
    ]
  };

  const role = user?.role?.toUpperCase() || 'CUSTOMER';
  const currentNavItems = navItems[role] || navItems['CUSTOMER'];

  const getPortalName = () => {
    if (role === 'ADMIN') return 'Administrator Console';
    if (role === 'TPA') return 'TPA Review Terminal';
    if (role === 'HOSPITAL') return 'Medical Facility Portal';
    return 'Premium Member Hub';
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-100 flex flex-col z-20">
        <div className="p-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-[var(--gold-gradient)] rounded-xl flex items-center justify-center text-white shadow-lg">
            <ShieldCheck size={24} />
          </div>
          <span className="font-black text-2xl tracking-tighter text-slate-900">
            Health<span className="text-[var(--primary)]">Guard</span>
          </span>
        </div>

        <nav className="flex-1 px-6 space-y-2 overflow-y-auto mt-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-4">Main Menu</p>
          {currentNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                location.pathname === item.path
                  ? 'bg-[var(--accent)] text-[var(--primary)] shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-4">
                <span className={`${location.pathname === item.path ? 'text-[var(--primary)]' : 'group-hover:text-[var(--primary)] transition-colors'}`}>
                  {item.icon}
                </span>
                <span className="font-bold text-sm">{item.name}</span>
              </div>
              {location.pathname === item.path && <ChevronRight size={14} />}
            </Link>
          ))}
        </nav>

        <div className="p-8">
          <div className="bg-[var(--accent)] rounded-[32px] p-6 border border-[var(--primary-light)]/20">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-black text-[var(--primary)] shadow-sm border border-slate-100">
                {user?.name?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-slate-900 truncate">{user?.name}</p>
                <p className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-wider">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3 bg-white text-slate-600 hover:text-red-600 rounded-xl font-bold text-xs transition-all shadow-sm border border-slate-50 hover:border-red-100"
            >
              <LogOut size={16} />
              Logout Session
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-24 bg-white/80 backdrop-blur-md border-b border-slate-50 flex items-center justify-between px-12 shrink-0 z-10">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {getPortalName()}
            </h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">
              {currentNavItems.find(i => i.path === location.pathname)?.name || 'HealthGuard System'}
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative p-3 bg-slate-50 text-slate-400 hover:text-[var(--primary)] rounded-2xl cursor-pointer transition-colors border border-slate-100">
              <Bell size={20} />
              <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </div>
            <div className="flex items-center gap-3 pl-6 border-l border-slate-100">
              <div className="text-right">
                <p className="text-xs font-black text-slate-900">Need Help?</p>
                <p className="text-[10px] font-bold text-[var(--primary)]">Elite Support</p>
              </div>
              <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center cursor-pointer shadow-lg shadow-slate-200">
                <User size={20} />
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-12 bg-[#FDFBF7]/30">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
