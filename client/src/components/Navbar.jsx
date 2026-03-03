import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Settings, FolderOpen } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="glass sticky top-0 z-50 px-6 py-4 flex justify-between items-center transition-all">
            <Link to="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                Cardify
            </Link>

            <div className="flex items-center gap-4">
                {user ? (
                    <>
                        {user.role === 'admin' && (
                            <Link to="/admin" className="text-indigo-600 hover:text-indigo-800 font-medium">
                                Admin Panel
                            </Link>
                        )}
                        <Link to="/dashboard" className="flex items-center gap-1 text-slate-600 hover:text-indigo-600 font-medium transition-colors">
                            <FolderOpen size={18} /> My Cards
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-1 text-rose-500 hover:text-rose-700 font-medium ml-4 transition-colors"
                        >
                            <LogOut size={18} /> Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="text-indigo-600 hover:text-indigo-800 font-medium">Login</Link>
                        <Link to="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl transition-all shadow-md">
                            Get Started
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
