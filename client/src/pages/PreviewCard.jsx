import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { MapPin, Phone, Mail, Globe, DownloadCloud, Image as ImageIcon, Briefcase, Share2, Copy, Send } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'react-hot-toast';

const PreviewCard = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [card, setCard] = useState(null);
    const cardRef = useRef(null);
    const [showShare, setShowShare] = useState(false);

    useEffect(() => {
        const fetchCard = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/card/${id}`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                setCard(res.data);
            } catch (error) {
                toast.error('Card not found');
                navigate('/dashboard');
            }
        };
        fetchCard();
    }, [id, user.token, navigate]);

    const trackEvent = async (eventType) => {
        if (!card) return;
        try {
            await axios.post(`http://localhost:5000/api/card/${card._id}/analytics`, { eventType, device: 'Desktop' });
        } catch (e) { }
    };

    const handleDownloadPNG = async () => {
        if (!cardRef.current) return;
        trackEvent('download_png');
        const canvas = await html2canvas(cardRef.current, { scale: 3, useCORS: true, logging: false, backgroundColor: '#f8fafc' });
        const imgData = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = imgData;
        link.download = `${card.name || 'vcard'}_digital.png`;
        link.click();
        toast.success('Downloaded as PNG!');
    };

    const handleDownloadPDF = async () => {
        if (!cardRef.current) return;
        trackEvent('download_pdf');
        const canvas = await html2canvas(cardRef.current, { scale: 3, useCORS: true, logging: false, backgroundColor: '#f8fafc' });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${card.name || 'vcard'}_digital.pdf`);
        toast.success('Downloaded as PDF!');
    };

    const handleDownloadVCF = () => {
        if (!card) return;
        trackEvent('download_vcf');
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
        toast.success('Downloaded VCF!');
    };

    const handleCopyLink = () => {
        const link = `${window.location.origin}/card/${card.slug || card._id}`;
        navigator.clipboard.writeText(link);
        toast.success('Public Profile link copied to clipboard!');
    };

    const handleWhatsAppShare = () => {
        trackEvent('share_whatsapp');
        const link = `${window.location.origin}/card/${card.slug || card._id}`;
        window.open(`https://wa.me/?text=Check out my digital visiting card: ${link}`, '_blank');
    };

    const handleEmailShare = () => {
        trackEvent('share_email');
        const link = `${window.location.origin}/card/${card.slug || card._id}`;
        window.open(`mailto:?subject=My Digital Visiting Card&body=Check out my digital visiting card here: ${link}`, '_self');
    };

    if (!card) return <div className="text-center mt-20 text-indigo-600 font-bold text-xl">Loading Digital Card...</div>;

    // Theme Styles
    const themeStyles = {
        light: 'bg-white text-slate-800 border-slate-200',
        dark: 'bg-slate-900 text-slate-100 border-slate-700',
        gradient: 'bg-gradient-to-br from-indigo-900 via-blue-900 to-indigo-800 text-white border-indigo-700/50',
    };

    const selectedTheme = themeStyles[card.theme] || themeStyles.light;
    const isDark = card.theme !== 'light';

    // Layout Dimensions
    const layoutStyles = {
        horizontal: 'w-[400px] h-[250px]',
        vertical: 'w-[250px] h-[400px]',
        square: 'w-[300px] h-[300px]',
        linkedin: 'w-[400px] h-[200px]',
        nfc: 'w-[250px] h-[400px] rounded-3xl shadow-2xl bg-gradient-to-tr from-slate-900 to-slate-800 border-[8px] border-slate-900 relative overflow-hidden',
    };

    const selectedLayout = layoutStyles[card.layoutType || 'horizontal'] || layoutStyles.horizontal;

    // vCard Generation for QR
    const vCardStr = `BEGIN:VCARD\nVERSION:3.0\nN:${card.name}\nFN:${card.name}\nORG:${card.company}\nTITLE:${card.designation}\nTEL:${card.phone}\nEMAIL:${card.email}\nURL:${card.website}\nADR:;;${card.address}\nEND:VCARD`;

    return (
        <div className="max-w-5xl mx-auto py-10 flex flex-col items-center">

            {/* Context Toolbars */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-4">
                <button onClick={() => window.open(`/card/${card.slug || card._id}`, '_blank')} className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow transition text-sm">
                    <Globe size={18} /> Public Profile
                </button>
                <button onClick={handleDownloadPNG} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow transition text-sm">
                    <ImageIcon size={18} /> Save PNG
                </button>
                <button onClick={handleDownloadVCF} className="bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow transition text-sm">
                    <DownloadCloud size={18} /> Save VCF
                </button>
                <button onClick={() => setShowShare(!showShare)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow transition text-sm">
                    <Share2 size={18} /> Share Card
                </button>
                <button onClick={() => navigate(`/edit/${id}`)} className="bg-white text-slate-700 border hover:bg-slate-50 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow transition text-sm">
                    <Briefcase size={18} /> Edit Canvas
                </button>
            </div>

            {showShare && (
                <div className="flex bg-white shadow-xl rounded-xl p-4 gap-4 border border-emerald-100 mb-8 animate-in slide-in-from-top-4 fade-in">
                    <button onClick={handleCopyLink} className="flex flex-col items-center gap-1 text-slate-600 hover:text-indigo-600 p-2 rounded-lg hover:bg-indigo-50"><Copy size={24} /><span className="text-xs font-bold">Copy</span></button>
                    <button onClick={handleWhatsAppShare} className="flex flex-col items-center gap-1 text-slate-600 hover:text-green-600 p-2 rounded-lg hover:bg-green-50"><Share2 size={24} /><span className="text-xs font-bold">WhatsApp</span></button>
                    <button onClick={handleEmailShare} className="flex flex-col items-center gap-1 text-slate-600 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50"><Send size={24} /><span className="text-xs font-bold">Email</span></button>
                    <div className="border-l pl-4 ml-2 flex flex-col items-center justify-center">
                        <span className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-widest">Or Scan</span>
                        <QRCodeSVG value={window.location.origin + `/preview/${id}`} size={40} />
                    </div>
                </div>
            )}

            <div className="w-full flex justify-center py-6" ref={cardRef}>
                <div
                    style={{ fontFamily: card.fontFamily || 'Inter', fontSize: `${card.baseFontSize || 16}px` }}
                    className={`relative shadow-2xl border transition-all duration-300 ${selectedTheme} ${selectedLayout} flex flex-col justify-center shrink-0 p-6`}
                >
                    {card.layoutType === 'nfc' && <div className="absolute top-4 right-4 animate-pulse"><div className="w-6 h-6 border-4 border-slate-600 rounded-full bg-transparent"></div></div>}

                    {/* Custom draggable components mapped */}
                    {card.logo && (
                        <div className="absolute" style={{ transform: `translate(${card.customLayout?.logo?.x || 0}px, ${card.customLayout?.logo?.y || 0}px)` }}>
                            <img src={card.logo} alt="Logo" className="w-[3em] h-[3em] object-contain rounded" crossOrigin="anonymous" draggable="false" />
                        </div>
                    )}

                    <div className="absolute" style={{ transform: `translate(${card.customLayout?.name?.x || 0}px, ${card.customLayout?.name?.y || 0}px)` }}>
                        <h1 className="font-black leading-none" style={{ fontSize: '1.5em' }}>{card.name || 'Your Name'}</h1>
                    </div>

                    <div className="absolute" style={{ transform: `translate(${card.customLayout?.designation?.x || 0}px, ${card.customLayout?.designation?.y || 0}px)`, top: '60px' }}>
                        <p className={`font-bold leading-tight ${isDark ? 'text-blue-300' : 'text-indigo-600'}`} style={{ fontSize: '0.875em' }}>{card.designation || 'Your Designation'}</p>
                    </div>

                    <div className="absolute" style={{ transform: `translate(${card.customLayout?.company?.x || 0}px, ${card.customLayout?.company?.y || 0}px)`, top: '80px' }}>
                        <p className={`uppercase font-extrabold leading-tight ${isDark ? 'text-slate-400' : 'text-slate-500'}`} style={{ fontSize: '0.75em' }}>{card.company || 'Company Name'}</p>
                    </div>

                    {/* Static Footer Data for context */}
                    <div className="mt-auto pt-10 text-[10px] space-y-1 relative z-10 w-2/3">
                        {card.phone && <p>📞 {card.phone}</p>}
                        {card.email && <p>✉️ {card.email}</p>}
                        {card.website && <p>🌐 {card.website}</p>}
                        {card.address && <p>📍 {card.address}</p>}
                    </div>

                    <div className="absolute bottom-4 right-4 p-1.5 bg-white rounded-lg shadow-lg border border-slate-100 z-20">
                        <QRCodeSVG value={`${window.location.origin}/card/${card.slug || card._id}`} size={50} />
                        <p className="text-[8px] text-center mt-0.5 font-bold text-slate-800">Scan Profile</p>
                    </div>

                    {/* Aesthetic Blur Accents for Live Canvas that change per theme */}
                    <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-50 pointer-events-none ${isDark ? 'bg-indigo-500' : 'bg-rose-100'}`}></div>
                    <div className={`absolute -bottom-10 -left-10 w-32 h-32 rounded-full blur-3xl opacity-50 pointer-events-none ${isDark ? 'bg-purple-500' : 'bg-blue-100'}`}></div>

                </div>
            </div>

        </div>
    );
};

export default PreviewCard;
