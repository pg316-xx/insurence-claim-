import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Layout
import MainLayout from './layout/MainLayout';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CustomerDashboard from './pages/CustomerDashboard';
import TPAQueue from './pages/TPAQueue';
import ClaimDetail from './pages/ClaimDetail';
import NewClaim from './pages/NewClaim';
import HospitalDashboard from './pages/HospitalDashboard';
import PoliciesPage from './pages/PoliciesPage';
import ClaimsPage from './pages/ClaimsPage';
import PaymentsPage from './pages/PaymentsPage';
import AdminDashboard from './pages/AdminDashboard';
import HospitalsPage from './pages/HospitalsPage';

const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#FDFBF7] gap-4">
      <div className="w-12 h-12 border-4 border-slate-100 border-t-[var(--primary)] rounded-full animate-spin" />
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resuming Session...</p>
    </div>
  );

  if (!isAuthenticated) return <Navigate to="/login" />;
  
  const userRole = user?.role || 'CUSTOMER';
  if (roles.length > 0 && !roles.includes(userRole)) return <Navigate to="/" />;

  return <MainLayout>{children}</MainLayout>;
};

const DashboardRedirect = () => {
  const { user } = useAuth();
  const role = user?.role || 'CUSTOMER';
  
  if (role === 'ADMIN') return <AdminDashboard />;
  if (role === 'TPA') return <TPAQueue />;
  if (role === 'HOSPITAL') return <HospitalDashboard />;
  return <CustomerDashboard />;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 5,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            <Route path="/" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />
            <Route path="/policies" element={<ProtectedRoute><PoliciesPage /></ProtectedRoute>} />
            <Route path="/my-claims" element={<ProtectedRoute><ClaimsPage /></ProtectedRoute>} />
            <Route path="/premium-payments" element={<ProtectedRoute><PaymentsPage /></ProtectedRoute>} />
            <Route path="/hospitals" element={<ProtectedRoute roles={['ADMIN']}><HospitalsPage /></ProtectedRoute>} />
            
            <Route path="/claims/new" element={<ProtectedRoute roles={['CUSTOMER', 'HOSPITAL']}><NewClaim /></ProtectedRoute>} />
            <Route path="/claims/:id" element={<ProtectedRoute><ClaimDetail /></ProtectedRoute>} />
            <Route path="/all-claims" element={<ProtectedRoute roles={['ADMIN', 'TPA']}><TPAQueue /></ProtectedRoute>} />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
