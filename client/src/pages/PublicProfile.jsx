import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Phone, Mail, Globe, MessageCircle, UserPlus, MapPin, Share2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const PublicProfile = () => {
    const { slug } = useParams();
    const [card, setCard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCard = async () => {
            try {
                const res = await axios.get(`https://visiting-card-app-server.vercel.app/api/card/public/${slug}`);
                setCard(res.data);

                // Update SEO Meta Tags
                document.title = `${res.data.name} - Digital Visiting Card`;
                updateMeta('description', `Digital Visiting Card for ${res.data.name}, ${res.data.designation} at ${res.data.company}`);

                // Track View Analytics
                await axios.post(`https://visiting-card-app-server.vercel.app/api/card/${res.data._id}/analytics`, { eventType: 'view', device: getDeviceType() });
            } catch (err) {
                setError('Card not found or is private.');
            } finally {
                setLoading(false);
            }
        };
        fetchCard();
    }, [slug]);

    const updateMeta = (name, content) => {
        let meta = document.querySelector(`meta[name="${name}"]`);
        if (!meta) {
            meta = document.createElement('meta');
            meta.name = name;
            document.head.appendChild(meta);
        }
        meta.content = content;
    };

    const getDeviceType = () => {
        const ua = navigator.userAgent;
        if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return 'Tablet';
        if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) return 'Mobile';
        return 'Desktop';
    };

    const trackEvent = async (eventType) => {
        if (!card) return;
        try {
            await axios.post(`https://visiting-card-app-server.vercel.app/api/card/${card._id}/analytics`, { eventType, device: getDeviceType() });
        } catch (e) {
            // silent fail
        }
    };

    const handleAction = (type, url, eventType) => {
        trackEvent(eventType);
        if (type === 'vcf') {
            downloadVCF();
        } else {
            window.open(url, '_blank');
        }
    };

    const downloadVCF = () => {
        const vCardStr = `BEGIN:VCARD\nVERSION:3.0\nN:${card.name}\nFN:${card.name}\nORG:${card.company}\nTITLE:${card.designation}\nTEL:${card.phone}\nEMAIL:${card.email}\nURL:${card.website}\nADR:;;${card.address}\nEND:VCARD`;
        const blob = new Blob([vCardStr], { type: 'text/vcard' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${card.name.replace(/\s+/g, '_')}.vcf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-indigo-600 font-bold">Loading Digital Profile...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-rose-500 font-bold">{error}</div>;

    const isDark = card.theme !== 'light';
    const bgClass = card.theme === 'dark' ? 'bg-slate-900 text-white' : card.theme === 'gradient' ? 'bg-gradient-to-br from-indigo-900 to-blue-900 text-white' : 'bg-white text-slate-800';
    const accentClass = isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-slate-100 hover:bg-slate-200';
    const primaryIconClass = isDark ? 'text-blue-400' : 'text-indigo-600';

    return (
        <div className={`min-h-screen flex items-center justify-center px-4 py-8 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
            <div className={`w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative border ${isDark ? 'border-slate-800' : 'border-slate-200'} ${bgClass}`}>

                {/* Banner / Header */}
                <div className="h-32 bg-indigo-600/20 backdrop-blur-3xl relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-current opacity-10"></div>
                </div>

                <div className="px-8 pb-8 -mt-16 flex flex-col items-center relative z-10 text-center">
                    {/* Logo/Avatar placeholder */}
                    <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl bg-white overflow-hidden flex items-center justify-center mb-6">
                        {card.logo ? (
                            <img src={card.logo} alt={card.name} className="w-full h-full object-contain p-2" crossOrigin="anonymous" />
                        ) : (
                            <div className="text-4xl font-black text-indigo-100 bg-indigo-600 w-full h-full flex items-center justify-center">
                                {card.name.charAt(0)}
                            </div>
                        )}
                    </div>

                    <h1 className="text-3xl font-extrabold mb-1">{card.name}</h1>
                    <p className={`text-lg font-bold mb-1 ${isDark ? 'text-blue-300' : 'text-indigo-600'}`}>{card.designation}</p>
                    <p className={`uppercase text-sm tracking-widest font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{card.company}</p>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-4 gap-4 w-full mt-8 mb-8">
                        {card.phone && (
                            <button onClick={() => handleAction('link', `tel:${card.phone.replace(/[\s+]/g, '')}`, 'call')} className="flex flex-col items-center gap-2 group">
                                <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-md group-hover:scale-110 ${accentClass}`}>
                                    <Phone className={primaryIconClass} size={24} />
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Call</span>
                            </button>
                        )}
                        {card.phone && (
                            <button onClick={() => handleAction('link', `https://wa.me/${card.phone.replace(/[\s+]/g, '')}`, 'share_whatsapp')} className="flex flex-col items-center gap-2 group">
                                <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-md group-hover:scale-110 ${accentClass}`}>
                                    <MessageCircle className="text-emerald-500" size={24} />
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>WhatsApp</span>
                            </button>
                        )}
                        {card.email && (
                            <button onClick={() => handleAction('link', `mailto:${card.email}`, 'email')} className="flex flex-col items-center gap-2 group">
                                <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-md group-hover:scale-110 ${accentClass}`}>
                                    <Mail className={primaryIconClass} size={24} />
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Email</span>
                            </button>
                        )}
                        {card.website && (
                            <button onClick={() => handleAction('link', card.website.startsWith('http') ? card.website : `https://${card.website}`, 'website_click')} className="flex flex-col items-center gap-2 group">
                                <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-md group-hover:scale-110 ${accentClass}`}>
                                    <Globe className={primaryIconClass} size={24} />
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Website</span>
                            </button>
                        )}
                    </div>

                    <button
                        onClick={() => handleAction('vcf', null, 'download_vcf')}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-indigo-500/30 active:scale-[0.98]"
                    >
                        <UserPlus size={20} /> Save Contact
                    </button>

                    <button
                        onClick={() => handleAction('link', `https://wa.me/?text=Here is my digital card: ${window.location.href}`, 'share')}
                        className={`w-full mt-4 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] ${accentClass}`}
                    >
                        <Share2 size={20} className={primaryIconClass} /> Share Profile
                    </button>
                </div>

                <div className={`p-8 border-t ${isDark ? 'border-white/10' : 'border-slate-100'} flex flex-col items-center`}>
                    <p className={`text-xs font-bold uppercase tracking-widest mb-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Scan & Save</p>
                    <div className="bg-white p-3 rounded-2xl shadow-md inline-block">
                        <QRCodeSVG value={window.location.href} size={100} />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default PublicProfile;
