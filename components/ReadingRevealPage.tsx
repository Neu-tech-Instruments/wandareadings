import React from 'react';
import { UserData, ReadingResponse, Review } from '../types';
import { FullReadingContent } from '../services/geminiService';
import { ReviewSection } from './ReviewSection';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ReadingRevealPageProps {
    userData: UserData;
    reviews: Review[];
    isLoading: boolean;
    reading: ReadingResponse | null;
    fullReading: FullReadingContent | null;
}

// Get today's date in a readable format
const getTodayDate = () => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
};

export const ReadingRevealPage: React.FC<ReadingRevealPageProps> = ({ userData, reviews, isLoading, reading, fullReading }) => {
    const pdfRef = React.useRef<HTMLDivElement>(null);
    const [isGeneratingPdf, setIsGeneratingPdf] = React.useState(false);

    // Audio State
    const [isMuted, setIsMuted] = React.useState(false);
    const audioRef = React.useRef<HTMLAudioElement | null>(null);

    React.useEffect(() => {
        // Initialize Audio
        const audio = new Audio('/audio/ethereal_ambience.mp3');
        audio.loop = true;
        audio.volume = 0.3;
        audioRef.current = audio;

        const playAudio = async () => {
            try {
                await audio.play();
            } catch (err) {
                console.log("Autoplay prevented by browser. User interaction needed.", err);
                setIsMuted(true); // Sync state to reality
            }
        };

        if (!isMuted) {
            playAudio();
        }

        return () => {
            audio.pause();
            audio.src = '';
        };
    }, []);

    const toggleAudio = () => {
        if (!audioRef.current) return;
        if (isMuted) {
            audioRef.current.play().catch(e => console.error(e));
            setIsMuted(false);
        } else {
            audioRef.current.pause();
            setIsMuted(true);
        }
    };

    if (!fullReading) return null;

    const handleDownloadPDF = async () => {
        if (!pdfRef.current) return;
        setIsGeneratingPdf(true);
        try {
            const canvas = await html2canvas(pdfRef.current, {
                scale: 2, // Higher quality
                backgroundColor: '#ffffff', // Ensure white background for PDF
                useCORS: true // For images if any
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Wanda_Reading_${userData.name.replace(/\s+/g, '_')}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    const [isGeneratingCard, setIsGeneratingCard] = React.useState(false);
    const cardRef = React.useRef<HTMLDivElement>(null);

    const handleShareCard = async () => {
        if (!cardRef.current) return;
        setIsGeneratingCard(true);
        try {
            const canvas = await html2canvas(cardRef.current, {
                scale: 2,
                backgroundColor: null, // Transparent/use css background
                useCORS: true
            });
            const link = document.createElement('a');
            link.download = `Wanda_Energy_Card_${userData.name.replace(/\s+/g, '_')}.png`;
            link.href = canvas.toDataURL();
            link.click();
        } catch (error) {
            console.error('Error sharing card:', error);
            alert('Failed to generate energy card.');
        } finally {
            setIsGeneratingCard(false);
        }
    };

    const getTodayDate = () => {
        const today = new Date();
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        return today.toLocaleDateString('en-US', options);
    };

    return (
        <div className="flex-grow flex flex-col items-center justify-center px-6 text-center relative w-full pb-12">

            {/* Hidden PDF Template */}
            <div className="absolute top-0 left-0 w-[210mm] min-h-[297mm] bg-white text-black p-12 pointer-events-none opacity-0 z-[-1]" ref={pdfRef}>
                <div className="border-4 border-double border-yellow-600 h-full p-8 flex flex-col items-center text-center space-y-6">
                    <h1 className="font-serif text-4xl text-indigo-900 mb-2">Ethereal Insights</h1>
                    <div className="w-16 h-1 bg-yellow-600 mb-4"></div>

                    <div className="space-y-1">
                        <p className="uppercase tracking-widest text-xs text-gray-500">Prepared For</p>
                        <h2 className="text-2xl font-bold text-indigo-950">{userData.name}</h2>
                        <p className="text-sm text-gray-500">{userData.birthDate}</p>
                    </div>

                    {reading && (
                        <div className="my-6 bg-yellow-50 p-6 rounded-lg border border-yellow-200 w-full">
                            <h3 className="text-yellow-700 font-bold uppercase tracking-widest text-sm mb-2">Energy Signature</h3>
                            <p className="font-serif italic text-2xl text-indigo-900">"{reading.energySignature}"</p>
                        </div>
                    )}

                    <div className="text-left space-y-6 w-full px-4">
                        <div>
                            <h4 className="font-bold text-indigo-900 border-b border-gray-200 pb-1 mb-2">The Connection</h4>
                            <p className="text-gray-800 leading-relaxed text-sm font-serif">{fullReading.paragraph1}</p>
                        </div>
                        <div>
                            <h4 className="font-bold text-indigo-900 border-b border-gray-200 pb-1 mb-2">The Truth</h4>
                            <p className="text-gray-800 leading-relaxed text-sm font-serif">{fullReading.paragraph2}</p>
                        </div>
                        <div>
                            <h4 className="font-bold text-indigo-900 border-b border-gray-200 pb-1 mb-2">The Path Forward</h4>
                            <p className="text-gray-800 leading-relaxed text-sm font-serif">{fullReading.paragraph3}</p>
                        </div>
                    </div>

                    <div className="mt-auto pt-8 border-t border-gray-300 w-full">
                        <p className="font-serif italic text-lg text-yellow-700">{fullReading.closing}</p>
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 mt-2">Certified by Wanda • Practitioner ID: #W882</p>
                    </div>
                </div>
            </div>

            {/* Hidden Social Card Template */}
            <div className="absolute top-0 left-0 pointer-events-none opacity-0 z-[-1]" ref={cardRef}>
                <div className="w-[400px] h-[600px] bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900 flex flex-col items-center justify-between p-8 text-center border-4 border-yellow-500/50 relative overflow-hidden">
                    {/* Background Accents */}
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
                    <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"></div>

                    <div className="z-10 mt-4">
                        <p className="text-[10px] text-yellow-500 uppercase tracking-[0.3em]">The Stars Have Spoken</p>
                        <h1 className="font-serif-mystic text-3xl text-indigo-100 mt-2">Ethereal Insights</h1>
                    </div>

                    <div className="z-10 flex flex-col items-center justify-center flex-grow space-y-4">
                        <div className="w-20 h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>
                        <h2 className="text-yellow-400 font-serif-mystic text-4xl leading-tight drop-shadow-lg">"{reading?.energySignature}"</h2>
                        <div className="w-20 h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>
                        <p className="text-indigo-200 text-sm font-light italic max-w-xs mt-4">"{reading?.teaser}"</p>
                    </div>

                    <div className="z-10 mb-4 space-y-1">
                        <p className="font-serif-mystic text-indigo-100 text-lg">{userData.name}</p>
                        <p className="text-[9px] text-indigo-400 uppercase tracking-widest">{getTodayDate()}</p>
                    </div>
                </div>
            </div>

            <div className="glass-effect rounded-3xl border border-yellow-500/20 overflow-hidden relative shadow-2xl mt-8 max-w-4xl w-full">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent"></div>

                {/* Audio Toggle */}
                <button
                    onClick={toggleAudio}
                    className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-indigo-900/40 border border-yellow-500/30 text-yellow-500 flex items-center justify-center hover:bg-indigo-900/60 transition-all text-xs"
                    title={isMuted ? "Unmute Ambient Sound" : "Mute Ambient Sound"}
                >
                    <i className={`fas ${isMuted ? 'fa-volume-mute' : 'fa-volume-up'}`}></i>
                </button>

                <div className="p-6 md:p-12 space-y-10 md:space-y-12">
                    <div className="flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center border-b border-indigo-900/50 pb-8">
                        <div className="space-y-1 text-left">
                            <p className="text-[9px] uppercase tracking-widest text-yellow-500/60 font-bold">Seeker Profile</p>
                            <p className="font-serif-mystic text-indigo-100 text-sm md:text-base">{userData.name} <span className="text-indigo-400 font-sans text-xs">({userData.birthDate})</span></p>
                        </div>
                        {userData.partnerName && (
                            <div className="space-y-1 sm:text-right text-left">
                                <p className="text-[9px] uppercase tracking-widest text-yellow-500/60 font-bold">Intertwined Soul</p>
                                <p className="font-serif-mystic text-indigo-100 text-sm md:text-base">{userData.partnerName} <span className="text-indigo-400 font-sans text-xs">({userData.partnerBirthDate})</span></p>
                            </div>
                        )}
                    </div>

                    {reading && (
                        <div className="bg-yellow-500/5 p-6 rounded-2xl border border-yellow-500/10 shadow-inner text-left">
                            <h4 className="text-[10px] text-yellow-500 uppercase tracking-[0.2em] mb-2 font-black">Your Energy Signature</h4>
                            <p className="text-indigo-50 font-serif-mystic italic text-lg md:text-xl mb-3">"{reading.energySignature}"</p>
                            <p className="text-indigo-200/80 text-sm leading-relaxed italic">{reading.teaser}</p>
                        </div>
                    )}

                    <div className="bg-yellow-500/5 p-6 md:p-10 rounded-2xl border border-yellow-500/10 shadow-inner text-left space-y-8">
                        <div className="space-y-4">
                            <h3 className="text-sm md:text-base font-bold text-yellow-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                <i className="fas fa-link"></i> The Connection
                            </h3>
                            <p className="text-indigo-100/90 leading-relaxed font-serif-mystic text-lg md:text-xl font-light">
                                {fullReading.paragraph1}
                            </p>
                        </div>

                        <div className="w-full h-px bg-yellow-500/20"></div>

                        <div className="space-y-4">
                            <h3 className="text-sm md:text-base font-bold text-yellow-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                <i className="fas fa-eye"></i> The Truth
                            </h3>
                            <p className="text-indigo-50 leading-relaxed font-serif-mystic text-lg md:text-xl font-light pl-4 border-l-2 border-yellow-500/40">
                                "{fullReading.paragraph2}"
                            </p>
                        </div>

                        <div className="w-full h-px bg-yellow-500/20"></div>

                        <div className="space-y-4">
                            <h3 className="text-sm md:text-base font-bold text-yellow-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                <i className="fas fa-route"></i> The Path Forward
                            </h3>
                            <p className="text-indigo-100/90 leading-relaxed font-serif-mystic text-lg md:text-xl font-light">
                                {fullReading.paragraph3}
                            </p>
                        </div>
                    </div>


                    <div className="text-center pt-8 border-t border-indigo-900/50">
                        <p className="font-serif-mystic text-yellow-500/90 italic text-xl md:text-2xl mb-2">{fullReading.closing}</p>
                        <p className="text-[9px] md:text-[10px] uppercase tracking-widest text-indigo-500 font-bold">Certified Ethereal Reading • Practitioner ID: #W882</p>
                    </div>
                </div>

                <div className="bg-indigo-900/10 p-4 md:p-6 border-t border-indigo-900/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex gap-4">
                        <button onClick={handleDownloadPDF} disabled={isGeneratingPdf} className="text-[10px] text-indigo-400 hover:text-indigo-100 flex items-center gap-2 transition-colors py-2 disabled:opacity-50">
                            <i className={`fas ${isGeneratingPdf ? 'fa-spinner fa-spin' : 'fa-file-pdf'}`}></i> {isGeneratingPdf ? 'Generating...' : 'Download PDF'}
                        </button>
                        <button onClick={handleShareCard} disabled={isGeneratingCard} className="text-[10px] text-indigo-400 hover:text-indigo-100 flex items-center gap-2 transition-colors py-2 disabled:opacity-50">
                            <i className={`fas ${isGeneratingCard ? 'fa-spinner fa-spin' : 'fa-share-alt'}`}></i> {isGeneratingCard ? 'Creating...' : 'Share Energy'}
                        </button>
                    </div>
                    <button onClick={() => window.location.href = window.location.pathname} className="w-full sm:w-auto text-[10px] bg-indigo-600/40 px-8 py-3 rounded-full text-indigo-100 font-bold hover:bg-indigo-600 transition-all uppercase tracking-widest border border-indigo-500/20">Return Home</button>
                </div>
            </div>

            <div className="mt-12 w-full max-w-4xl">
                <ReviewSection reviews={reviews} isLoading={isLoading} enableSubmission={true} />
            </div>
        </div>
    );
};
