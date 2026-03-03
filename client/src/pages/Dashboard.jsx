import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Dashboard = () => {
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();

    const fetchCards = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/card/my-cards', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setCards(res.data);
        } catch (error) {
            toast.error('Failed to load cards');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCards();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this card?')) return;
        try {
            await axios.delete(`http://localhost:5000/api/card/${id}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            toast.success('Card deleted');
            setCards(cards.filter(c => c._id !== id));
        } catch (error) {
            toast.error('Delete failed');
        }
    };

    if (loading) return <div className="text-center mt-20 text-indigo-600 font-bold text-xl">Loading...</div>;

    return (
        <div className="max-w-6xl mx-auto py-10">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-extrabold text-indigo-900">My Digital Cards</h1>
                    <p className="text-slate-500 mt-2">Manage and share your digital profiles.</p>
                </div>
                <Link to="/upload" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-transform hover:scale-105">
                    <Plus size={20} /> New Card
                </Link>
            </div>

            {cards.length === 0 ? (
                <div className="bg-white rounded-3xl p-16 text-center shadow-xl border border-indigo-50">
                    <div className="w-24 h-24 bg-indigo-50 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Plus size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-indigo-900 mb-3">No cards yet!</h2>
                    <p className="text-slate-500 mb-8 max-w-md mx-auto">Upload your first visiting card to automatically extract details and start your digital journey.</p>
                    <Link to="/upload" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold transition inline-block">
                        Create First Card
                    </Link>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {cards.map(card => (
                        <div key={card._id} className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden hover:shadow-2xl transition-all group">
                            <div className="h-40 bg-indigo-50 relative">
                                {card.frontImage ? (
                                    <img src={card.frontImage} alt="Card Front" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-blue-200">
                                        <span className="text-indigo-400 font-medium">No Image</span>
                                    </div>
                                )}
                                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-xs font-bold text-indigo-700 shadow">
                                    {card.theme.toUpperCase()}
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-indigo-950 mb-1 truncate">{card.name || 'Unnamed'}</h3>
                                <p className="text-sm font-medium text-slate-500 mb-4 truncate">{card.designation || 'No Designation'} • {card.company || 'No Company'}</p>
                                <div className="flex justify-between items-center pt-4 border-t border-slate-100 gap-2">
                                    <button onClick={() => navigate(`/preview/${card._id}`)} className="flex-1 flex justify-center items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-2 rounded-xl font-medium transition text-sm">
                                        <Eye size={16} /> Preview
                                    </button>
                                    <button onClick={() => navigate(`/edit/${card._id}`)} className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 rounded-lg transition">
                                        <Edit size={18} />
                                    </button>
                                    <button onClick={() => handleDelete(card._id)} className="p-2 text-slate-400 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 rounded-lg transition">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
