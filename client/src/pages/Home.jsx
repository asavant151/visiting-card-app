import { Link } from 'react-router-dom';
import { ArrowRight, ImagePlus, BrainCircuit, PenTool, LayoutDashboard } from 'lucide-react';

const FeatureCard = ({ icon, title, description }) => (
    <div className="bg-white p-8 rounded-3xl shadow-xl border border-indigo-50 hover:-translate-y-2 transition-transform duration-300">
        <div className="bg-indigo-100 w-16 h-16 rounded-2xl flex items-center justify-center text-indigo-600 mb-6">
            {icon}
        </div>
        <h3 className="text-xl font-bold mb-3">{title}</h3>
        <p className="text-slate-500 leading-relaxed">{description}</p>
    </div>
);

const Home = () => {
    return (
        <div className="max-w-6xl mx-auto pt-10 pb-20">
            <div className="text-center mb-24 anim-fade-in">
                <h1 className="text-6xl font-extrabold mb-6 leading-tight tracking-tight">
                    Turn Physical Cards into <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                        Digital Gold
                    </span>
                </h1>
                <p className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto">
                    Upload any visiting card. Our advanced AI instantly extracts details and generates a beautiful, shareable digital profile.
                </p>
                <div className="flex justify-center gap-4">
                    <Link to="/upload" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl text-lg font-bold transition-all shadow-lg hover:shadow-indigo-500/30 flex items-center gap-2">
                        Upload Card Now <ArrowRight size={20} />
                    </Link>
                    <Link to="/dashboard" className="bg-white hover:bg-slate-50 text-slate-700 px-8 py-4 rounded-xl text-lg font-bold transition-all shadow-md flex items-center gap-2">
                        View My Cards
                    </Link>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8 px-4">
                <FeatureCard
                    icon={<ImagePlus size={32} />}
                    title="Easy Upload"
                    description="Simply snap a photo or select an image of your visiting card. We support front and back images."
                />
                <FeatureCard
                    icon={<BrainCircuit size={32} />}
                    title="AI Extraction"
                    description="Our intelligent OCR engine reads text like magic, automatically categorizing names, emails, and phones."
                />
                <FeatureCard
                    icon={<PenTool size={32} />}
                    title="Editable Smart Profile"
                    description="Refine extracted data and instantly generate an elegant digital vCard to share anywhere."
                />
            </div>
        </div>
    );
};

export default Home;
