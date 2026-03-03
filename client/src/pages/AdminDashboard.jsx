import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Users, FileImage, UserMinus, FileX, BarChart3, TrendingUp, Loader2, DollarSign, Eye, Share2, DownloadCloud } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'react-hot-toast';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [cards, setCards] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [usersRes, cardsRes, analyticsRes] = await Promise.all([
                axios.get('https://visiting-card-app-server.vercel.app/api/admin/users', { headers: { Authorization: `Bearer ${user.token}` } }),
                axios.get('https://visiting-card-app-server.vercel.app/api/admin/cards', { headers: { Authorization: `Bearer ${user.token}` } }),
                axios.get('https://visiting-card-app-server.vercel.app/api/admin/analytics', { headers: { Authorization: `Bearer ${user.token}` } })
            ]);
            setUsers(usersRes.data);
            setCards(cardsRes.data);
            setAnalytics(analyticsRes.data);
        } catch (error) {
            toast.error('Failed to load admin data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const deleteUser = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            await axios.delete(`https://visiting-card-app-server.vercel.app/api/admin/user/${id}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setUsers(users.filter(u => u._id !== id));
            toast.success('User deleted');
            fetchData(); // Refresh to update cards
        } catch (error) {
            toast.error('Failed to delete user');
        }
    };

    const deleteCard = async (id) => {
        if (!window.confirm('Delete this card?')) return;
        try {
            await axios.delete(`https://visiting-card-app-server.vercel.app/api/admin/card/${id}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setCards(cards.filter(c => c._id !== id));
            toast.success('Card deleted');
        } catch (error) {
            toast.error('Failed to delete card');
        }
    };

    if (loading) return <div className="flex justify-center mt-20"><Loader2 className="animate-spin text-indigo-600 w-12 h-12" /></div>;

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const chartData = analytics?.monthlyGrowth?.map(m => ({
        name: monthNames[m._id - 1] || 'Unknown',
        views: m.views
    })) || [
            { name: 'Total Users', value: users.length },
            { name: 'Total Cards', value: cards.length },
            { name: 'Revenue ($)', value: cards.length * 10 }
        ];

    return (
        <div className="max-w-6xl mx-auto py-10">
            <h1 className="text-3xl font-extrabold text-indigo-900 mb-8 flex items-center gap-2">
                <BarChart3 size={32} /> Admin Dashboard
            </h1>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-50 flex items-center justify-between">
                    <div>
                        <p className="text-slate-500 font-bold mb-1">Total Users</p>
                        <h2 className="text-3xl font-extrabold text-indigo-900">{users.length}</h2>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center"><Users size={24} /></div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-50 flex items-center justify-between">
                    <div>
                        <p className="text-slate-500 font-bold mb-1">Total Cards</p>
                        <h2 className="text-3xl font-extrabold text-indigo-900">{cards.length}</h2>
                    </div>
                    <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-full flex items-center justify-center"><FileImage size={24} /></div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-50 flex items-center justify-between">
                    <div>
                        <p className="text-slate-500 font-bold mb-1">Proj. Revenue</p>
                        <h2 className="text-3xl font-extrabold text-emerald-600">${cards.length * 10}</h2>
                    </div>
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center"><DollarSign size={24} /></div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-50 flex items-center justify-between">
                    <div>
                        <p className="text-slate-500 font-bold mb-1">Profile Views</p>
                        <h2 className="text-3xl font-extrabold text-rose-600">{analytics?.totalViews || 0}</h2>
                    </div>
                    <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center"><Eye size={24} /></div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-50 flex items-center justify-between">
                    <div>
                        <p className="text-slate-500 font-bold mb-1">Total Shares</p>
                        <h2 className="text-3xl font-extrabold text-amber-600">{analytics?.totalShares || 0}</h2>
                    </div>
                    <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center"><Share2 size={24} /></div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-50 flex items-center justify-between">
                    <div>
                        <p className="text-slate-500 font-bold mb-1">Downloads</p>
                        <h2 className="text-3xl font-extrabold text-cyan-600">{analytics?.totalDownloads || 0}</h2>
                    </div>
                    <div className="w-12 h-12 bg-cyan-50 text-cyan-500 rounded-full flex items-center justify-center"><DownloadCloud size={24} /></div>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 mb-12">
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-50 relative overflow-hidden h-80">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-indigo-900"><TrendingUp /> Monthly Growth (Views)</h3>
                    <ResponsiveContainer width="100%" height="80%">
                        <BarChart data={chartData}>
                            <XAxis dataKey="name" stroke="#6366f1" />
                            <YAxis stroke="#6366f1" allowDecimals={false} />
                            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                            <Bar dataKey="views" fill="#e11d48" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-50 relative overflow-hidden h-80">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-indigo-900"><BarChart3 /> System Distribution</h3>
                    <ResponsiveContainer width="100%" height="80%">
                        <BarChart data={[{ name: 'Total Users', value: users.length }, { name: 'Total Cards', value: cards.length }]}>
                            <XAxis dataKey="name" stroke="#6366f1" />
                            <YAxis stroke="#6366f1" allowDecimals={false} />
                            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                            <Bar dataKey="value" fill="#4f46e5" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl shadow-lg border border-indigo-50 overflow-hidden">
                    <div className="bg-slate-50 p-4 border-b">
                        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Users size={20} /> Manage Users</h3>
                    </div>
                    <div className="p-4 max-h-96 overflow-y-auto">
                        {users.map(u => (
                            <div key={u._id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition border-b border-transparent hover:border-slate-100">
                                <div>
                                    <p className="font-bold text-indigo-900">{u.name}</p>
                                    <p className="text-sm text-slate-500">{u.email} • <span className="uppercase text-xs font-bold text-indigo-400">{u.role}</span></p>
                                </div>
                                {u.role !== 'admin' && (
                                    <button onClick={() => deleteUser(u._id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition" title="Delete User">
                                        <UserMinus size={20} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg border border-indigo-50 overflow-hidden">
                    <div className="bg-slate-50 p-4 border-b">
                        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><FileImage size={20} /> Manage Cards</h3>
                    </div>
                    <div className="p-4 max-h-96 overflow-y-auto">
                        {cards.map(c => (
                            <div key={c._id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition border-b border-transparent hover:border-slate-100">
                                <div>
                                    <p className="font-bold text-indigo-900">{c.name || 'Unnamed'}</p>
                                    <p className="text-sm text-slate-500">By: {c.userId?.name || 'Unknown User'}</p>
                                </div>
                                <button onClick={() => deleteCard(c._id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition" title="Delete Card">
                                    <FileX size={20} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
