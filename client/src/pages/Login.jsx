import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            toast.success('Welcome back!');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="flex justify-center items-center h-[80vh]">
            <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md border border-indigo-50">
                <h2 className="text-3xl font-bold mb-6 text-center text-indigo-900">Sign In</h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <input
                        type="email"
                        placeholder="Email"
                        required
                        className="border p-3 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none transition"
                        value={email} onChange={e => setEmail(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        required
                        className="border p-3 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none transition"
                        value={password} onChange={e => setPassword(e.target.value)}
                    />
                    <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-xl font-bold transition shadow-lg mt-2">
                        Login
                    </button>
                </form>
                <p className="mt-6 text-center text-slate-500">
                    New here? <Link to="/register" className="text-indigo-600 font-medium">Create an account</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
