import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Navbar from './components/Navbar';
import { useAuth } from './context/AuthContext';
import { Loader2 } from 'lucide-react';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const UploadCard = lazy(() => import('./pages/UploadCard'));
const EditCard = lazy(() => import('./pages/EditCard'));
const PreviewCard = lazy(() => import('./pages/PreviewCard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const PublicProfile = lazy(() => import('./pages/PublicProfile'));
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-sans text-slate-800">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<div className="flex justify-center items-center mt-20"><Loader2 className="animate-spin text-indigo-600 w-12 h-12" /></div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/upload" element={<ProtectedRoute><UploadCard /></ProtectedRoute>} />
            <Route path="/edit" element={<ProtectedRoute><EditCard /></ProtectedRoute>} />
            <Route path="/edit/:id" element={<ProtectedRoute><EditCard /></ProtectedRoute>} />
            <Route path="/preview/:id" element={<ProtectedRoute><PreviewCard /></ProtectedRoute>} />
            <Route path="/card/:slug" element={<PublicProfile />} />
            <Route path="/admin" element={<ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute>} />
          </Routes>
        </Suspense>
      </div>
    </div>
  );
}

export default App;
