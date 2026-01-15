import React, { useState } from 'react';
import { UserData } from '../types';

interface PickACardLandingProps {
    onComplete: (data: Partial<UserData>) => void;
    onSkip: () => void;
}

export const PickACardLanding: React.FC<PickACardLandingProps> = ({ onComplete, onSkip }) => {
    const [step, setStep] = useState<'PILES' | 'TOPIC'>('PILES');
    const [selectedPile, setSelectedPile] = useState<string | null>(null);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const handlePileSelect = (pile: string) => {
        setIsTransitioning(true);
        setSelectedPile(pile);
        setTimeout(() => {
            setStep('TOPIC');
            setIsTransitioning(false);
        }, 800);
    };

    const handleTopicSelect = (category: string) => {
        setIsTransitioning(true);
        setTimeout(() => {
            onComplete({
                cardPile: selectedPile || undefined,
                readingCategory: category as any
            });
        }, 800);
    };

    return (
        <div className="min-h-screen w-full bg-[#0a0510] text-[#D4AF37] flex flex-col items-center justify-center p-6 font-sans overflow-hidden relative">

            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/10 rounded-full blur-[120px] animate-pulse-slow delay-1000"></div>
            </div>

            <div className={`relative z-10 w-full max-w-4xl transition-all duration-700 ease-out transform ${isTransitioning ? 'opacity-0 scale-95 blur-sm' : 'opacity-100 scale-100 blur-0'}`}>

                {step === 'PILES' && (
                    <div className="text-center space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        <div className="space-y-4">
                            <h1 className="text-3xl md:text-5xl font-serif-mystic text-indigo-100 tracking-wide drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                                The Universe speaks in symbols.
                            </h1>
                            <p className="text-indigo-200/80 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
                                Focus on your burning question—whether it is about love, career, or your future. Let your intuition guide you.
                            </p>
                            <p className="text-[#D4AF37] font-bold tracking-widest text-sm uppercase pt-4 animate-pulse">
                                Which pile draws your eye immediately?
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center perspective-1000">
                            {[1, 2, 3].map((num) => (
                                <button
                                    key={num}
                                    onClick={() => handlePileSelect(`Pile ${num}`)}
                                    className="group relative w-full aspect-[2/3] max-w-[240px] rounded-2xl transition-all duration-500 hover:-translate-y-4 hover:shadow-[0_0_40px_rgba(212,175,55,0.3)] active:scale-95"
                                >
                                    {/* Glassmorphism Card Container */}
                                    <div className="absolute inset-0 bg-indigo-900/20 backdrop-blur-md border border-indigo-500/30 rounded-2xl overflow-hidden group-hover:border-[#D4AF37]/60 transition-colors">
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50"></div>

                                        {/* Card Back Design Placeholder */}
                                        <div className="absolute inset-4 border border-indigo-500/20 rounded-xl flex items-center justify-center bg-black/20 group-hover:bg-[#D4AF37]/5 transition-colors">
                                            <div className="text-4xl opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500">
                                                {num === 1 ? '✨' : num === 2 ? '🔮' : '🌙'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Label */}
                                    <div className="absolute -bottom-12 left-0 right-0 text-center">
                                        <span className="text-indigo-300 font-bold tracking-[0.2em] text-sm group-hover:text-[#D4AF37] transition-colors">
                                            PILE {num}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="pt-12">
                            <button
                                onClick={onSkip}
                                className="text-indigo-400/50 hover:text-indigo-300 text-xs uppercase tracking-widest border-b border-transparent hover:border-indigo-300 transition-all pb-1"
                            >
                                I have a specific question (Skip)
                            </button>
                        </div>
                    </div>
                )}

                {step === 'TOPIC' && (
                    <div className="text-center space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="space-y-6">
                            <div className="w-16 h-16 mx-auto rounded-full bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.2)] mb-8">
                                <span className="text-2xl">
                                    {selectedPile === 'Pile 1' ? '✨' : selectedPile === 'Pile 2' ? '🔮' : '🌙'}
                                </span>
                            </div>

                            <h2 className="text-2xl md:text-3xl font-serif-mystic text-indigo-100 leading-tight">
                                "I feel a strong energy of transformation in this pile."
                            </h2>
                            <p className="text-indigo-200/80 text-lg max-w-xl mx-auto">
                                To interpret this accurately for you, I need to know where to focus this energy.
                                <br />
                                <span className="block mt-4 text-[#D4AF37] font-semibold">
                                    What area of life is your question about?
                                </span>
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                            {[
                                { id: 'Love', label: 'Love & Relationships', icon: '❤️' },
                                { id: 'Career', label: 'Career & Wealth', icon: '💼' },
                                { id: 'General', label: 'General Life Path', icon: '🌟' },
                            ].map((topic) => (
                                <button
                                    key={topic.id}
                                    onClick={() => handleTopicSelect(topic.id)}
                                    className="group relative p-8 rounded-xl bg-indigo-900/20 border border-indigo-500/30 hover:border-[#D4AF37] hover:bg-indigo-900/40 transition-all duration-300 hover:shadow-[0_0_30px_rgba(212,175,55,0.15)] backdrop-blur-sm active:scale-95"
                                >
                                    <div className="text-4xl mb-4 grayscale group-hover:grayscale-0 transition-all duration-300 transform group-hover:scale-110">
                                        {topic.icon}
                                    </div>
                                    <div className="text-indigo-100 font-bold tracking-wider text-sm group-hover:text-[#D4AF37]">
                                        {topic.label.toUpperCase()}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};
