import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Save, Loader2, ArrowLeft, Type, Layout, Image as ImageIcon, Move } from 'lucide-react';
import Draggable from 'react-draggable';

const EditCard = () => {
    const { state } = useLocation();
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const mapRef = useRef(null);
    const logoRef = useRef(null);
    const nameRef = useRef(null);
    const designationRef = useRef(null);
    const companyRef = useRef(null);

    const [formData, setFormData] = useState({
        name: 'John Doe',
        designation: 'Software Engineer',
        company: 'Tech Corp',
        phone: '+1 234 567 890',
        email: 'john@example.com',
        website: 'www.johndoe.com',
        address: '123 Street Name',
        theme: 'light',
        layoutType: 'horizontal',
        fontFamily: 'Inter',
        baseFontSize: 16,
        frontImage: '',
        backImage: '',
        logo: '',
        customLayout: {
            name: { x: 0, y: 0 },
            designation: { x: 0, y: 0 },
            company: { x: 0, y: 0 },
            logo: { x: 0, y: 0 }
        }
    });

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [activeTab, setActiveTab] = useState('data'); // data, design, layout

    useEffect(() => {
        if (id) {
            const fetchCard = async () => {
                setFetching(true);
                try {
                    const res = await axios.get(`http://localhost:5000/api/card/${id}`, {
                        headers: { Authorization: `Bearer ${user.token}` }
                    });
                    setFormData(prev => ({ ...prev, ...res.data, customLayout: res.data.customLayout || prev.customLayout }));
                } catch (error) {
                    toast.error('Failed to load card details');
                    navigate('/dashboard');
                } finally {
                    setFetching(false);
                }
            };
            fetchCard();
        } else if (state?.extractedData) {
            setFormData(prev => ({
                ...prev,
                ...state.extractedData,
                frontImage: state.frontUrl || '',
                backImage: state.backUrl || ''
            }));
        }
    }, [id, state, user.token, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleContentEdit = (e, field) => {
        setFormData({ ...formData, [field]: e.target.innerText });
    };

    const handleDrag = (e, data, field) => {
        setFormData(prev => ({
            ...prev,
            customLayout: {
                ...prev.customLayout,
                [field]: { x: data.x, y: data.y }
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (id) {
                await axios.put(`http://localhost:5000/api/card/${id}`, formData, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                toast.success('Card updated successfully!');
                navigate(`/preview/${id}`);
            } else {
                const res = await axios.post(`http://localhost:5000/api/card/create`, formData, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                toast.success('Card created successfully!');
                navigate(`/preview/${res.data._id}`);
            }
        } catch (error) {
            toast.error('Failed to save card details');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="text-center mt-20 text-indigo-600 font-bold text-xl">Loading card details...</div>;

    // Theme & Layout Styles for Preview
    const themeStyles = {
        light: 'bg-white text-slate-800 border-slate-200',
        dark: 'bg-slate-900 text-slate-100 border-slate-700',
        gradient: 'bg-gradient-to-br from-indigo-900 via-blue-900 to-indigo-800 text-white border-indigo-700/50',
    };

    const isDark = formData.theme !== 'light';
    const selectedTheme = themeStyles[formData.theme] || themeStyles.light;

    // Layout Dimensions
    const layoutStyles = {
        horizontal: 'w-[400px] h-[250px]',
        vertical: 'w-[250px] h-[400px]',
        square: 'w-[300px] h-[300px]',
        linkedin: 'w-[400px] h-[200px]',
        nfc: 'w-[250px] h-[400px] rounded-3xl mx-auto shadow-2xl bg-gradient-to-tr from-slate-900 to-slate-800 border-[8px] border-slate-900 relative overflow-hidden',
    };

    const selectedLayout = layoutStyles[formData.layoutType] || layoutStyles.horizontal;

    const fonts = ['Inter', 'Roboto', 'Outfit', 'Playfair Display', 'Montserrat'];

    return (
        <div className="max-w-7xl mx-auto py-6 px-4 flex flex-col h-[calc(100vh-80px)]">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-lg transition">
                        <ArrowLeft size={24} className="text-slate-600" />
                    </button>
                    <h1 className="text-2xl font-extrabold text-indigo-900">{id ? 'Live Card Editor' : 'Design Your Card'}</h1>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition shadow-lg"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                    {id ? 'Save Changes' : 'Generate Digital Card'}
                </button>
            </div>

            <div className="grid lg:grid-cols-12 gap-6 flex-1 min-h-0">
                {/* Tools Panel */}
                <div className="lg:col-span-4 bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden border border-indigo-50">
                    <div className="flex border-b">
                        <button
                            className={`flex-1 p-4 font-bold text-sm ${activeTab === 'data' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500'}`}
                            onClick={() => setActiveTab('data')}
                        >
                            <Type size={16} className="mx-auto mb-1" /> Data
                        </button>
                        <button
                            className={`flex-1 p-4 font-bold text-sm ${activeTab === 'design' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500'}`}
                            onClick={() => setActiveTab('design')}
                        >
                            <ImageIcon size={16} className="mx-auto mb-1" /> Design
                        </button>
                        <button
                            className={`flex-1 p-4 font-bold text-sm ${activeTab === 'layout' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500'}`}
                            onClick={() => setActiveTab('layout')}
                        >
                            <Layout size={16} className="mx-auto mb-1" /> Layout
                        </button>
                    </div>

                    <div className="p-6 overflow-y-auto flex-1">
                        {activeTab === 'data' && (
                            <div className="space-y-4">
                                {['name', 'designation', 'company', 'phone', 'email', 'website', 'address'].map(field => (
                                    <div key={field}>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{field}</label>
                                        <input
                                            name={field} value={formData[field] || ''} onChange={handleChange}
                                            className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none transition text-sm text-slate-800"
                                            placeholder={`Enter ${field}`}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'design' && (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Color Theme</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['light', 'dark', 'gradient'].map(thm => (
                                            <button
                                                key={thm} type="button" onClick={() => setFormData({ ...formData, theme: thm })}
                                                className={`p-2 rounded-lg text-sm font-bold capitalize transition border
                                                    ${formData.theme === thm ? 'ring-2 ring-indigo-500 border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 hover:bg-slate-50'}
                                                `}
                                            >
                                                {thm}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Font Family</label>
                                    <select
                                        name="fontFamily" value={formData.fontFamily} onChange={handleChange}
                                        className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none text-sm font-medium"
                                    >
                                        {fonts.map(f => <option key={f} value={f}>{f}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Base Font Size ({formData.baseFontSize || 16}px)</label>
                                    <input
                                        type="range" name="baseFontSize" min="12" max="24"
                                        value={formData.baseFontSize || 16} onChange={handleChange}
                                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Logo URL (Optional)</label>
                                    <input
                                        name="logo" value={formData.logo || ''} onChange={handleChange}
                                        className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none text-sm"
                                        placeholder="https://example.com/logo.png"
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'layout' && (
                            <div className="space-y-4">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Select Card Layout</label>
                                <div className="space-y-2">
                                    {['horizontal', 'vertical', 'square', 'linkedin', 'nfc'].map(l => (
                                        <button
                                            key={l} onClick={() => setFormData({ ...formData, layoutType: l })}
                                            className={`w-full p-3 rounded-lg text-left text-sm font-bold capitalize transition border flex items-center justify-between
                                                ${formData.layoutType === l ? 'ring-2 ring-indigo-500 border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 hover:bg-slate-50 text-slate-700'}
                                            `}
                                        >
                                            {l} Card
                                            {formData.layoutType === l && <span className="w-2 h-2 rounded-full bg-indigo-500"></span>}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-xs text-slate-400 mt-4"><Move size={12} className="inline mr-1" /> Pro Tip: Drag elements on the right panel to reposition them!</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Editor Preview Panel */}
                <div className="lg:col-span-8 bg-slate-100 rounded-2xl shadow-inner border border-slate-200 flex flex-col items-center justify-center p-8 overflow-hidden relative">
                    <p className="absolute top-4 left-4 text-xs font-bold text-slate-400 uppercase tracking-widest"><Move size={14} className="inline mr-1" /> Live Preview & Drag to Edit</p>

                    <div
                        style={{ fontFamily: formData.fontFamily, fontSize: `${formData.baseFontSize || 16}px` }}
                        className={`relative shadow-2xl rounded-2xl border transition-all duration-300 ${selectedTheme} ${selectedLayout} flex flex-col justify-center shrink-0 p-6`}
                    >
                        {formData.layoutType === 'nfc' && <div className="absolute top-4 right-4 animate-pulse"><div className="w-6 h-6 border-4 border-slate-600 rounded-full bg-transparent"></div></div>}

                        <Draggable nodeRef={logoRef} bounds="parent" position={formData.customLayout.logo} onStop={(e, d) => handleDrag(e, d, 'logo')}>
                            <div ref={logoRef} className={`cursor-move absolute z-20 ${!formData.logo ? 'hidden' : ''}`}>
                                <img src={formData.logo} alt="Logo" className="w-[3em] h-[3em] object-contain rounded" crossOrigin="anonymous" draggable="false" />
                            </div>
                        </Draggable>

                        <Draggable nodeRef={nameRef} bounds="parent" position={formData.customLayout.name} onStop={(e, d) => handleDrag(e, d, 'name')}>
                            <div ref={nameRef} className="cursor-move absolute z-10 p-1 border border-transparent hover:border-dashed hover:border-indigo-400 rounded-md">
                                <h1
                                    className="font-black outline-none w-max min-w-[50px] leading-none" style={{ fontSize: '1.5em' }}
                                    contentEditable
                                    suppressContentEditableWarning
                                    onBlur={(e) => handleContentEdit(e, 'name')}
                                >
                                    {formData.name || 'Your Name'}
                                </h1>
                            </div>
                        </Draggable>

                        <Draggable nodeRef={designationRef} bounds="parent" position={formData.customLayout.designation} onStop={(e, d) => handleDrag(e, d, 'designation')}>
                            <div ref={designationRef} className="cursor-move absolute z-10 p-1 border border-transparent hover:border-dashed hover:border-indigo-400 rounded-md" style={{ top: '60px' }}>
                                <p
                                    className={`font-bold outline-none w-max leading-tight ${isDark ? 'text-blue-300' : 'text-indigo-600'}`} style={{ fontSize: '0.875em' }}
                                    contentEditable
                                    suppressContentEditableWarning
                                    onBlur={(e) => handleContentEdit(e, 'designation')}
                                >
                                    {formData.designation || 'Your Designation'}
                                </p>
                            </div>
                        </Draggable>

                        <Draggable nodeRef={companyRef} bounds="parent" position={formData.customLayout.company} onStop={(e, d) => handleDrag(e, d, 'company')}>
                            <div ref={companyRef} className="cursor-move absolute z-10 p-1 border border-transparent hover:border-dashed hover:border-indigo-400 rounded-md" style={{ top: '80px' }}>
                                <p
                                    className={`uppercase font-extrabold outline-none w-max leading-tight ${isDark ? 'text-slate-400' : 'text-slate-500'}`} style={{ fontSize: '0.75em' }}
                                    contentEditable
                                    suppressContentEditableWarning
                                    onBlur={(e) => handleContentEdit(e, 'company')}
                                >
                                    {formData.company || 'Company Name'}
                                </p>
                            </div>
                        </Draggable>

                        {/* Static Footer Data for context */}
                        <div className="mt-auto pt-10 text-[10px] space-y-1 opacity-80 pointer-events-none">
                            {formData.phone && <p>📞 {formData.phone}</p>}
                            {formData.email && <p>✉️ {formData.email}</p>}
                            {formData.website && <p>🌐 {formData.website}</p>}
                            {formData.address && <p>📍 {formData.address}</p>}
                        </div>

                        {/* Aesthetic Blur Accents for Live Canvas that change per theme */}
                        <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-50 pointer-events-none ${isDark ? 'bg-indigo-500' : 'bg-rose-100'}`}></div>
                        <div className={`absolute -bottom-10 -left-10 w-32 h-32 rounded-full blur-3xl opacity-50 pointer-events-none ${isDark ? 'bg-purple-500' : 'bg-blue-100'}`}></div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditCard;
