import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(name, email, password, role);
            toast.success('Registration successful!');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="flex justify-center items-center h-[80vh]">
            <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md border border-indigo-50">
                <h2 className="text-3xl font-bold mb-6 text-center text-indigo-900">Create Account</h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <input
                        type="text"
                        placeholder="Full Name"
                        required
                        className="border p-3 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none transition"
                        value={name} onChange={e => setName(e.target.value)}
                    />
                    <input
                        type="email"
                        placeholder="Email Address"
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

                    <div className="flex gap-4">
                        <label className={`flex items-center gap-2 cursor-pointer p-3 border rounded-xl flex-1 transition ${role === 'user' ? 'bg-indigo-50 border-indigo-400 shadow-sm' : 'bg-white hover:bg-slate-50'}`}>
                            <input type="radio" name="role" value="user" checked={role === 'user'} onChange={(e) => setRole(e.target.value)} className="w-4 h-4 text-indigo-600" />
                            <span className="font-bold text-slate-700 text-sm">Standard</span>
                        </label>
                        <label className={`flex items-center gap-2 cursor-pointer p-3 border rounded-xl flex-1 transition ${role === 'admin' ? 'bg-indigo-50 border-indigo-400 shadow-sm' : 'bg-white hover:bg-slate-50'}`}>
                            <input type="radio" name="role" value="admin" checked={role === 'admin'} onChange={(e) => setRole(e.target.value)} className="w-4 h-4 text-indigo-600" />
                            <span className="font-bold text-slate-700 text-sm">Admin</span>
                        </label>
                    </div>
                    <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-xl font-bold transition shadow-lg mt-2">
                        Register
                    </button>
                </form>
                <p className="mt-6 text-center text-slate-500">
                    Already have an account? <Link to="/login" className="text-indigo-600 font-medium">Log in</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
