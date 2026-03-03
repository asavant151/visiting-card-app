import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { UploadCloud, Image as ImageIcon, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const UploadCard = () => {
    const [frontImage, setFrontImage] = useState(null);
    const [backImage, setBackImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [extractedData, setExtractedData] = useState(null);
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleProcess = async () => {
        if (!frontImage && !backImage) {
            toast.error('Please upload at least one side of the card.');
            return;
        }

        setLoading(true);
        try {
            let combinedData = {};
            let frontUrl = '';
            let backUrl = '';

            if (frontImage) {
                const formData = new FormData();
                formData.append('image', frontImage);
                const res = await axios.post('http://localhost:5000/api/ocr/extract', formData, {
                    headers: { Authorization: `Bearer ${user.token}`, 'Content-Type': 'multipart/form-data' }
                });
                combinedData = { ...combinedData, ...res.data.extractedData };
                frontUrl = res.data.imageUrl;
            }

            if (backImage) {
                const formData = new FormData();
                formData.append('image', backImage);
                const res = await axios.post('http://localhost:5000/api/ocr/extract', formData, {
                    headers: { Authorization: `Bearer ${user.token}`, 'Content-Type': 'multipart/form-data' }
                });
                // Merge without overwriting truthy values unnecessarily, or just merge
                Object.keys(res.data.extractedData).forEach(key => {
                    if (!combinedData[key]) combinedData[key] = res.data.extractedData[key];
                });
                backUrl = res.data.imageUrl;
            }

            toast.success('Extraction successful!');
            // Navigate to Edit with data
            navigate('/edit', { state: { extractedData: combinedData, frontUrl, backUrl } });

        } catch (error) {
            toast.error('Failed to process image');
            setLoading(false);
        }
    };

    const ImageUploader = ({ label, file, setFile }) => {
        const fileInputRef = useRef(null);
        return (
            <div
                className={`border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center transition-all cursor-pointer ${file ? 'border-green-400 bg-green-50' : 'border-indigo-200 hover:border-indigo-400 bg-white'}`}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={(e) => {
                        if (e.target.files[0]) setFile(e.target.files[0]);
                    }}
                />
                {file ? (
                    <>
                        <CheckCircle className="text-green-500 w-16 h-16 mb-4" />
                        <span className="font-bold text-green-700">{file.name}</span>
                        <span className="text-sm text-green-600 mt-2">Click to replace</span>
                    </>
                ) : (
                    <>
                        <div className="bg-indigo-50 w-20 h-20 rounded-full flex items-center justify-center mb-6">
                            <UploadCloud className="text-indigo-600 w-10 h-10" />
                        </div>
                        <span className="font-bold text-indigo-900 text-lg mb-2">{label}</span>
                        <span className="text-sm text-slate-500 text-center max-w-xs">Drag and drop or click to select image</span>
                    </>
                )}
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto py-10">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-indigo-900 mb-4">Upload Visiting Card</h1>
                <p className="text-lg text-slate-500 max-w-2xl mx-auto">Upload the front and back of your visiting card. Our AI will automatically extract the details to create your digital vCard.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-10">
                <ImageUploader label="Upload Front Side (Recommended)" file={frontImage} setFile={setFrontImage} />
                <ImageUploader label="Upload Back Side (Optional)" file={backImage} setFile={setBackImage} />
            </div>

            <div className="flex justify-center">
                <button
                    onClick={handleProcess}
                    disabled={loading || (!frontImage && !backImage)}
                    className={`px-10 py-4 rounded-xl font-bold text-xl flex items-center gap-3 transition-all shadow-xl ${loading || (!frontImage && !backImage) ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white hover:scale-105'}`}
                >
                    {loading ? (
                        <><Loader2 className="animate-spin w-6 h-6" /> Processing with AI...</>
                    ) : (
                        <><ImageIcon className="w-6 h-6" /> Extract Details</>
                    )}
                </button>
            </div>

            {loading && (
                <div className="mt-12 max-w-md mx-auto relative h-2 bg-indigo-100 rounded-full overflow-hidden">
                    <div className="absolute top-0 left-0 h-full bg-indigo-600 animate-pulse w-full"></div>
                </div>
            )}
        </div>
    );
};

export default UploadCard;
