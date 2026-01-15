import React, { useState } from 'react';
import { UserData, IntakeSubStep, Review } from '../types';
import { VideoBackground } from "../src/components/VideoBackground";
import { ReviewSection } from './ReviewSection';

interface IntakeFlowProps {
    userData: UserData;
    setUserData: (data: UserData) => void;
    onComplete: () => void;
    onBack: () => void;
    intakeContent: {
        greeting: string;
        whatYouReceive: string;
        instructions: string;
        footer: string;
    };
    reviews: Review[];
    isLoading: boolean;
    onStepChange?: (step: IntakeSubStep) => void;
    initialStep?: IntakeSubStep;
}

export const IntakeFlow: React.FC<IntakeFlowProps> = ({
    userData,
    setUserData,
    onComplete,
    onBack,
    reviews,
    isLoading,
    onStepChange,
    initialStep = IntakeSubStep.NAME
}) => {
    const [intakeSubStep, setIntakeSubStep] = useState<IntakeSubStep>(initialStep);
    const [showDateError, setShowDateError] = useState(false);
    const [isExiting, setIsExiting] = useState(false);

    // Carousel State
    const [activePileIndex, setActivePileIndex] = useState(0);
    const pilesScrollRef = React.useRef<HTMLDivElement>(null);
    const dragStartRef = React.useRef<number>(0);
    const isDraggingRef = React.useRef(false);

    const handleScroll = () => {
        if (pilesScrollRef.current) {
            const scrollLeft = pilesScrollRef.current.scrollLeft;
            const width = pilesScrollRef.current.clientWidth;
            const index = Math.round(scrollLeft / (width * 0.85));
            setActivePileIndex(Math.min(Math.max(index, 0), 2));
        }
    };


    const handleTransition = (callback: () => void) => {
        setIsExiting(true);
        setTimeout(() => {
            callback();
            setIsExiting(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 1200);
    };

    const nextIntakeStep = () => {
        if (intakeSubStep === IntakeSubStep.DELIVERY_INFO) {
            onComplete();
        } else {
            handleTransition(() => {
                let nextStep = intakeSubStep + 1;

                // Branching Logic
                if (intakeSubStep === IntakeSubStep.SUB_PATH) {
                    // After Sub-Path, decide where to go
                    if (userData.readingCategory === 'Love') {
                        nextStep = IntakeSubStep.PARTNER_QUERY;
                    } else if (userData.readingCategory === 'CardPile') {
                        nextStep = IntakeSubStep.CARD_REVEAL;
                    } else {
                        // Skip Partner logic for Career, General
                        nextStep = IntakeSubStep.SITUATION;
                    }
                } else if (intakeSubStep === IntakeSubStep.CARD_REVEAL) {
                    nextStep = IntakeSubStep.SITUATION;
                }

                setIntakeSubStep(nextStep);
                onStepChange?.(nextStep);
            });
        }
    };

    const handleBack = () => {
        handleTransition(() => {
            let prevStep = intakeSubStep - 1;

            // Branching Back Logic
            if (intakeSubStep === IntakeSubStep.SITUATION) {
                if (userData.readingCategory === 'Love') {
                    // Love goes back to partner details (default flow)
                } else if (userData.readingCategory === 'CardPile') {
                    // Card Pile goes back to Reveal
                    prevStep = IntakeSubStep.CARD_REVEAL;
                } else {
                    // Others go back to SUB_PATH
                    prevStep = IntakeSubStep.SUB_PATH;
                }
            } else if (intakeSubStep === IntakeSubStep.CARD_REVEAL) {
                prevStep = IntakeSubStep.SUB_PATH;
            }

            setIntakeSubStep(prevStep);
            onStepChange?.(prevStep);
        });
    };

    const handleDateSubmit = () => {
        if (!userData.birthDate) return;
        const year = parseInt(userData.birthDate.split('-')[0]);
        const currentYear = new Date().getFullYear();
        if (year > 1900 && year <= currentYear) {
            setShowDateError(false);
            nextIntakeStep();
        } else {
            setShowDateError(true);
        }
    };

    const renderInlineBack = () => (
        <button
            onClick={intakeSubStep === IntakeSubStep.NAME ? onBack : handleBack}
            className="mt-8 text-[10px] text-indigo-500 hover:text-indigo-300 uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-2 mx-auto opacity-70 hover:opacity-100 w-full animate-in fade-in duration-1000 delay-1000 fill-mode-forwards"
        >
            <i className="fas fa-arrow-left"></i> {intakeSubStep === IntakeSubStep.NAME ? "Restart Journey" : "Retrace Steps"}
        </button>
    );

    return (
        <div className="flex-grow flex items-center justify-center py-12 px-6 w-full">
            <div className="max-w-xl w-full">
                {/* Question container */}
                <div
                    key={intakeSubStep}
                    className={`w-full ease-in-out ${isExiting
                        ? 'opacity-0 blur-xl scale-90 transition-all duration-1000'
                        : 'animate-ethereal-fade-in'
                        }`}
                >

                    {intakeSubStep === IntakeSubStep.NAME && (
                        <div className="space-y-8 text-center">
                            <h2 className="text-2xl md:text-4xl font-serif-mystic text-indigo-100 animate-ethereal-slide-up delay-200">"First, let me feel your presence. What is your full name?"</h2>
                            <div className="relative animate-ethereal-slide-up delay-1000">
                                <input
                                    autoFocus
                                    type="text"
                                    className="w-full bg-transparent border-b-2 border-indigo-900 focus:border-yellow-500 text-2xl md:text-3xl text-center py-4 outline-none text-indigo-100 transition-all font-light placeholder-indigo-900"
                                    placeholder="Type your name..."
                                    value={userData.name}
                                    onChange={e => setUserData({ ...userData, name: e.target.value })}
                                    onKeyDown={e => e.key === 'Enter' && userData.name && nextIntakeStep()}
                                />
                                {userData.name && (
                                    <button onClick={nextIntakeStep} className="mt-12 bg-indigo-600 text-white px-8 py-3 rounded-full font-bold tracking-widest text-xs md:text-sm transition-all animate-in fade-in zoom-in">CONTINUE</button>
                                )}
                            </div>
                            {renderInlineBack()}
                        </div>
                    )}

                    {intakeSubStep === IntakeSubStep.BIRTHDATE && (
                        <div className="space-y-8 text-center">
                            <h2 className="text-2xl md:text-4xl font-serif-mystic text-indigo-100 animate-ethereal-slide-up delay-200">"A powerful name. And when did your soul first enter this world?"</h2>
                            <div className="flex flex-col items-center gap-8 animate-ethereal-slide-up delay-1000">
                                <input
                                    autoFocus
                                    type="date"
                                    min="1900-01-01"
                                    max={new Date().toISOString().split('T')[0]}
                                    className="w-full max-w-xs bg-black/40 border border-indigo-900 rounded-2xl px-6 py-4 text-xl text-center outline-none text-indigo-100 focus:border-yellow-500 transition-all"
                                    value={userData.birthDate}
                                    onChange={e => {
                                        setUserData({ ...userData, birthDate: e.target.value });
                                        setShowDateError(false);
                                    }}
                                />
                                {userData.birthDate && (
                                    <button onClick={handleDateSubmit} className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold tracking-widest text-xs transition-all animate-in fade-in zoom-in">REVEAL THE STARS</button>
                                )}
                                {showDateError && (
                                    <p className="text-red-400 text-xs animate-pulse">Please enter a valid birth year.</p>
                                )}
                            </div>
                            {renderInlineBack()}
                        </div>
                    )}

                    {intakeSubStep === IntakeSubStep.CATEGORY && (
                        <div className="space-y-8 text-center">
                            <h2 className="text-2xl md:text-4xl font-serif-mystic text-indigo-100 animate-ethereal-slide-up delay-200">"Which path of destiny are we exploring today?"</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-ethereal-slide-up delay-1000">
                                {[
                                    { label: 'LOVE & RELATIONSHIPS', value: 'Love' },
                                    { label: 'CAREER & WEALTH', value: 'Career' },
                                    { label: 'LIFE PURPOSE & SPIRITUALITY', value: 'General' },
                                    { label: 'I PICKED A CARD PILE', value: 'CardPile' }
                                ].map(option => (
                                    <button
                                        key={option.value}
                                        onClick={() => {
                                            handleTransition(() => {
                                                setUserData({ ...userData, readingCategory: option.value as any });
                                                const nextStep = IntakeSubStep.SUB_PATH;
                                                setIntakeSubStep(nextStep);
                                                onStepChange?.(nextStep);
                                            });
                                        }}
                                        className={`p-6 rounded-2xl border transition-all text-sm font-bold tracking-widest uppercase
                      ${userData.readingCategory === option.value ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500' : 'border-indigo-900 hover:border-indigo-500 text-indigo-300'}
                    `}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                            {renderInlineBack()}
                        </div>
                    )}
                    {intakeSubStep === IntakeSubStep.SUB_PATH && (
                        <div className="space-y-8 text-center w-full">
                            {userData.readingCategory === 'CardPile' ? (
                                // New "Pick a Card" Immersive UI
                                <div className="animate-ethereal-fade-in w-full max-w-4xl mx-auto relative">
                                    <div className="mb-4 space-y-2">
                                        <h2 className="text-2xl md:text-5xl font-serif-mystic text-yellow-500 tracking-wider drop-shadow-lg">
                                            "The Universe speaks in symbols."
                                        </h2>
                                        <p className="text-indigo-200/80 font-light text-sm md:text-lg max-w-2xl mx-auto leading-relaxed">
                                            Focus on your burning question—whether it is about love, career, or the future.
                                            Let your intuition guide you. Which pile draws your eye?
                                        </p>
                                    </div>

                                    <div
                                        ref={pilesScrollRef}
                                        onScroll={handleScroll}
                                        className="flex md:grid md:grid-cols-3 overflow-x-auto md:overflow-visible snap-x snap-mandatory gap-4 md:gap-6 pb-4 px-[7.5vw] md:px-0 -mx-6 md:mx-0 w-[calc(100%+3rem)] md:w-full [&::-webkit-scrollbar]:hidden"
                                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                                    >
                                        {[
                                            { id: 'Pile 1', img: '/images/piles/pile1.png', label: '✨ PILE 1' },
                                            { id: 'Pile 2', img: '/images/piles/pile2.png', label: '🔮 PILE 2' },
                                            { id: 'Pile 3', img: '/images/piles/pile3.png', label: '🌙 PILE 3' }
                                        ].map((pile, idx) => (
                                            <div
                                                key={pile.id}
                                                className="group flex flex-col items-center gap-6 md:gap-4 cursor-pointer min-w-[85vw] md:min-w-0 md:w-auto snap-center"
                                                onTouchStart={(e) => {
                                                    dragStartRef.current = e.touches[0].clientX;
                                                    isDraggingRef.current = false;
                                                }}
                                                onTouchMove={(e) => {
                                                    if (Math.abs(e.touches[0].clientX - dragStartRef.current) > 10) {
                                                        isDraggingRef.current = true;
                                                    }
                                                }}
                                                onClick={() => {
                                                    if (isDraggingRef.current) return;

                                                    handleTransition(() => {
                                                        setUserData({ ...userData, readingType: pile.id, cardPile: pile.id });
                                                        const nextStep = IntakeSubStep.CARD_REVEAL;
                                                        setIntakeSubStep(nextStep);
                                                        onStepChange?.(nextStep);
                                                    });
                                                }}
                                            >
                                                {/* Image Container with Glow */}
                                                <div className="relative w-full h-72 md:h-auto md:aspect-[3/4] overflow-hidden rounded-xl border border-indigo-500/30 group-hover:border-yellow-500/70 transition-all duration-500 shadow-2xl shadow-indigo-900/40 group-hover:shadow-yellow-500/20">
                                                    <div className="absolute inset-0 bg-indigo-900/20 group-hover:bg-transparent transition-colors z-10"></div>
                                                    <img
                                                        src={pile.img}
                                                        alt={pile.id}
                                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                                                    />
                                                </div>

                                                {/* Glassmorphism Button - HIDDEN ON MOBILE, Visible on Desktop */}
                                                <button
                                                    className="hidden md:block w-full bg-indigo-950/40 backdrop-blur-md border border-indigo-500/30 text-indigo-100 py-4 rounded-xl font-bold tracking-[0.2em] text-sm group-hover:bg-indigo-900/60 group-hover:border-yellow-500 group-hover:text-yellow-400 group-hover:shadow-[0_0_15px_rgba(234,179,8,0.2)] transition-all duration-300"
                                                >
                                                    {pile.label}
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Mobile Indicators - Standard Layout */}
                                    <div className="flex md:hidden justify-center gap-3 my-4">
                                        {[0, 1, 2].map(i => (
                                            <div
                                                key={i}
                                                className={`h-1.5 rounded-full transition-all duration-300 ${i === activePileIndex ? 'w-8 bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]' : 'w-1.5 bg-indigo-900/50'}`}
                                            />
                                        ))}
                                    </div>

                                    {/* Mobile Action Button */}
                                    <div className="md:hidden px-4 pb-8">
                                        <button
                                            onClick={() => {
                                                const piles = [
                                                    { id: 'Pile 1', label: '✨ PILE 1' },
                                                    { id: 'Pile 2', label: '🔮 PILE 2' },
                                                    { id: 'Pile 3', label: '🌙 PILE 3' }
                                                ];
                                                const selectedPile = piles[activePileIndex];

                                                handleTransition(() => {
                                                    setUserData({ ...userData, readingType: selectedPile.id, cardPile: selectedPile.id });
                                                    const nextStep = IntakeSubStep.CARD_REVEAL;
                                                    setIntakeSubStep(nextStep);
                                                    onStepChange?.(nextStep);
                                                });
                                            }}
                                            className="w-full bg-indigo-950/60 backdrop-blur-md border border-yellow-500/50 text-yellow-400 py-4 rounded-xl font-bold tracking-[0.2em] text-lg shadow-[0_0_15px_rgba(234,179,8,0.15)] animate-in fade-in slide-in-from-bottom-4"
                                        >
                                            {[
                                                '✨ PILE 1',
                                                '🔮 PILE 2',
                                                '🌙 PILE 3'
                                            ][activePileIndex]}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // Generic UI for Other Categories
                                <>
                                    <h2 className="text-2xl md:text-3xl font-serif-mystic text-indigo-100 animate-ethereal-slide-up delay-200">
                                        {userData.readingCategory === 'Love' && "What is your specific situation?"}
                                        {userData.readingCategory === 'Career' && "What is your current professional status?"}
                                        {userData.readingCategory === 'General' && "What is calling to your soul?"}
                                    </h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-ethereal-slide-up delay-1000">
                                        {(() => {
                                            let options: string[] = [];
                                            if (userData.readingCategory === 'Love') options = ['Twin Flame Bond', 'Soulmate Discovery', 'Breakup Recovery', 'Seeking Love'];
                                            if (userData.readingCategory === 'Career') options = ['Employed', 'Looking for Work', 'Entrepreneur', 'Feeling Stuck'];
                                            if (userData.readingCategory === 'General') options = ['Feeling Lost', 'Seeking Purpose', 'Spiritual Awakening', 'What\'s Next?'];
                                            // CardPile options handled above

                                            return options.map(opt => (
                                                <button
                                                    key={opt}
                                                    onClick={() => {
                                                        handleTransition(() => {
                                                            // Set specific fields based on category
                                                            const updates: Partial<UserData> = { readingType: opt };
                                                            if (userData.readingCategory === 'Career') updates.careerStatus = opt;

                                                            setUserData({ ...userData, ...updates });

                                                            // Branching forward logic
                                                            let nextStep = IntakeSubStep.SITUATION;
                                                            if (userData.readingCategory === 'Love') {
                                                                nextStep = IntakeSubStep.PARTNER_QUERY;
                                                            }

                                                            setIntakeSubStep(nextStep);
                                                            onStepChange?.(nextStep);
                                                        });
                                                    }}
                                                    className={`p-5 rounded-xl border transition-all text-xs md:text-sm font-bold tracking-wider uppercase
                                                    ${userData.readingType === opt ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500' : 'border-indigo-900 hover:border-indigo-500 text-indigo-300'}
                                                    `}
                                                >
                                                    {opt}
                                                </button>
                                            ));
                                        })()}
                                    </div>
                                </>
                            )}
                            {renderInlineBack()}
                        </div>
                    )
                    }

                    {intakeSubStep === IntakeSubStep.CARD_REVEAL && userData.cardPile && (
                        <div className="space-y-8 text-center w-full max-w-4xl mx-auto">
                            <div className="animate-ethereal-fade-in flex flex-col items-center">
                                {/* 1. Visual: Selected Pile Image */}
                                <div className="relative w-64 h-80 md:w-80 md:h-[30rem] mb-8 group">
                                    <div className="absolute inset-0 bg-yellow-500/20 blur-3xl animate-pulse rounded-full"></div>
                                    <div className="relative w-full h-full overflow-hidden rounded-2xl border-2 border-yellow-500/50 shadow-[0_0_50px_rgba(234,179,8,0.3)] transform transition-transform duration-700 hover:scale-[1.02]">
                                        <img
                                            src={
                                                userData.cardPile === 'Pile 1' ? '/images/piles/pile1.png' :
                                                    userData.cardPile === 'Pile 2' ? '/images/piles/pile2.png' :
                                                        '/images/piles/pile3.png'
                                            }
                                            alt={userData.cardPile}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/80 via-transparent to-transparent"></div>
                                        <div className="absolute bottom-4 left-0 right-0 text-center">
                                            <span className="text-yellow-400 font-serif-mystic tracking-[0.2em] text-xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                                                {userData.cardPile.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* 2. The Hook */}
                                <div className="mb-10 space-y-4 max-w-2xl px-4 animate-ethereal-slide-up delay-300">
                                    <h2 className="text-2xl md:text-4xl font-serif-mystic text-indigo-100 leading-tight">
                                        "A powerful energy radiates from this pile."
                                    </h2>
                                    <p className="text-indigo-200/80 font-light text-sm md:text-lg leading-relaxed">
                                        The cards reveal a significant shift on your horizon, but the message depends on where you are currently focusing your energy.
                                    </p>
                                </div>

                                {/* 3. The Pivot & 4. Buttons */}
                                <div className="w-full max-w-sm md:max-w-3xl space-y-6 animate-ethereal-slide-up delay-700">
                                    <p className="text-yellow-500/90 text-sm md:text-base font-bold tracking-widest uppercase mb-4">
                                        To interpret this message accurately for you, tell Wanda: What area of life is this related to?
                                    </p>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {[
                                            { label: "❤️ Love & Relationships", value: "Love" },
                                            { label: "💼 Career & Wealth", value: "Career" },
                                            { label: "🌟 My Soul's Purpose", value: "Soul Purpose" }
                                        ].map((option) => (
                                            <button
                                                key={option.value}
                                                onClick={() => {
                                                    handleTransition(() => {
                                                        setUserData({
                                                            ...userData,
                                                            focusArea: option.value as any,
                                                            // Also set readingCategory contextually if we want, but keeping it as CardPile is safer for now.
                                                            // We can pass this focusArea to the prompt.
                                                        });
                                                        const nextStep = IntakeSubStep.SITUATION;
                                                        setIntakeSubStep(nextStep);
                                                        onStepChange?.(nextStep);
                                                    });
                                                }}
                                                className="bg-indigo-950/40 backdrop-blur-md border border-indigo-500/30 hover:border-yellow-500/50 hover:bg-indigo-900/60 text-indigo-100 hover:text-yellow-200 py-4 px-6 rounded-xl font-bold text-sm transition-all duration-300 shadow-lg hover:shadow-yellow-500/10 flex flex-col items-center justify-center gap-2 group h-full"
                                            >
                                                <span className="transform group-hover:scale-105 transition-transform">{option.label.split(' ')[0]}</span>
                                                <span className="uppercase tracking-wider text-xs md:text-[10px] opacity-80 group-hover:opacity-100">{option.label.substring(option.label.indexOf(' ') + 1)}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            {renderInlineBack()}
                        </div>
                    )}

                    {
                        intakeSubStep === IntakeSubStep.PARTNER_QUERY && (
                            <div className="space-y-8 text-center">
                                <h2 className="text-2xl md:text-4xl font-serif-mystic text-indigo-100 animate-ethereal-slide-up delay-200">"Is there another soul whose energy is intertwined with yours?"</h2>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center animate-ethereal-slide-up delay-1000">
                                    <button onClick={() => {
                                        handleTransition(() => {
                                            setIntakeSubStep(IntakeSubStep.PARTNER_DETAILS);
                                            onStepChange?.(IntakeSubStep.PARTNER_DETAILS);
                                        });
                                    }} className="bg-indigo-600 text-white px-8 py-4 rounded-full font-bold tracking-widest text-xs transition-all hover:bg-indigo-500">YES, A PARTNER</button>
                                    <button
                                        onClick={() => {
                                            handleTransition(() => {
                                                setIntakeSubStep(IntakeSubStep.SITUATION);
                                                onStepChange?.(IntakeSubStep.SITUATION);
                                            });
                                        }}
                                        className="border border-indigo-700 text-indigo-300 px-8 py-4 rounded-full font-bold tracking-widest text-xs transition-all hover:bg-indigo-900/40"
                                    >
                                        NO, JUST MY JOURNEY
                                    </button>
                                </div>
                                {renderInlineBack()}
                            </div>
                        )
                    }

                    {
                        intakeSubStep === IntakeSubStep.PARTNER_DETAILS && (
                            <div className="space-y-8 text-center">
                                <h2 className="text-2xl md:text-4xl font-serif-mystic text-indigo-100 animate-ethereal-slide-up delay-200">"Tell me of them. Their name and their arrival."</h2>
                                <div className="space-y-4 max-w-sm mx-auto animate-ethereal-slide-up delay-1000">
                                    <input
                                        autoFocus
                                        type="text"
                                        className="w-full bg-transparent border-b border-indigo-900 focus:border-yellow-500 text-xl py-3 outline-none text-indigo-100 transition-all font-light placeholder-indigo-900"
                                        placeholder="Their name..."
                                        value={userData.partnerName}
                                        onChange={e => setUserData({ ...userData, partnerName: e.target.value })}
                                    />
                                    <input
                                        type="date"
                                        className="w-full bg-black/40 border border-indigo-900 rounded-xl px-4 py-3 text-sm text-center outline-none text-indigo-100 focus:border-yellow-500 transition-all"
                                        value={userData.partnerBirthDate}
                                        onChange={e => setUserData({ ...userData, partnerBirthDate: e.target.value })}
                                    />
                                    {(userData.partnerName && userData.partnerBirthDate) && (
                                        <button onClick={nextIntakeStep} className="mt-4 bg-indigo-600 text-white px-8 py-3 rounded-full font-bold tracking-widest text-xs transition-all animate-in fade-in zoom-in">CONNECT ENERGIES</button>
                                    )}
                                </div>
                                {renderInlineBack()}
                            </div>
                        )
                    }

                    {
                        intakeSubStep === IntakeSubStep.SITUATION && (
                            userData.readingCategory === 'CardPile' ? (
                                // Card Pile Specific Detail Screen
                                <div className="space-y-8 text-center w-full max-w-4xl mx-auto">
                                    <div className="animate-ethereal-fade-in flex flex-col items-center">

                                        {/* 1. Glowing Thumbnail */}
                                        <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md border border-yellow-500/30 px-6 py-3 rounded-full shadow-[0_0_20px_rgba(234,179,8,0.15)] mb-8 animate-in fade-in slide-in-from-top-4">
                                            <div className="w-10 h-14 rounded-md overflow-hidden border border-yellow-500/50 shadow-sm relative">
                                                <img
                                                    src={
                                                        userData.cardPile === 'Pile 1' ? '/images/piles/pile1.png' :
                                                            userData.cardPile === 'Pile 2' ? '/images/piles/pile2.png' :
                                                                '/images/piles/pile3.png'
                                                    }
                                                    alt="Selected Pile"
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-yellow-500/20 animate-pulse"></div>
                                            </div>
                                            <span className="text-yellow-500 font-bold tracking-widest text-xs">{userData.cardPile?.toUpperCase()} SELECTED</span>
                                        </div>

                                        {/* Dynamic Headlines & Inputs */}
                                        <div className="w-full max-w-xl space-y-8 animate-ethereal-slide-up delay-200">
                                            {userData.focusArea === 'Love' ? (
                                                <>
                                                    <h2 className="text-2xl md:text-4xl font-serif-mystic text-indigo-100 leading-tight">
                                                        "Who is the other person involved?"
                                                    </h2>
                                                    <div className="space-y-6">
                                                        {/* Partner Name Input (Optional) */}
                                                        <div className="group relative">
                                                            <input
                                                                type="text"
                                                                autoFocus
                                                                className="w-full bg-transparent border-b border-indigo-900 focus:border-yellow-500 text-xl py-3 outline-none text-indigo-100 transition-all font-light placeholder-indigo-900/50 text-center"
                                                                placeholder="Partner's Name (Optional)"
                                                                value={userData.partnerName || ''}
                                                                onChange={e => setUserData({ ...userData, partnerName: e.target.value })}
                                                            />
                                                            <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-500 group-focus-within:w-full transition-all duration-500 ease-out"></div>
                                                        </div>

                                                        {/* Situation Textarea */}
                                                        <div className="space-y-2">
                                                            <p className="text-indigo-300/80 text-sm font-light">Tell Wanda about your situation. What keeps you up at night regarding this connection?</p>
                                                            <textarea
                                                                rows={4}
                                                                className="w-full bg-black/20 border border-indigo-900/50 rounded-2xl p-4 text-base outline-none text-indigo-100 focus:border-yellow-500/50 transition-all resize-none shadow-inner focus:bg-indigo-950/20"
                                                                placeholder="I'm wondering if..."
                                                                value={userData.question}
                                                                onChange={e => setUserData({ ...userData, question: e.target.value })}
                                                            />
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <h2 className="text-2xl md:text-4xl font-serif-mystic text-indigo-100 leading-tight">
                                                        "Let's focus on your path."
                                                    </h2>
                                                    <div className="space-y-2">
                                                        <p className="text-indigo-300/80 text-sm font-light">Describe your current obstacle or the goal you wish to manifest.</p>
                                                        <textarea
                                                            autoFocus
                                                            rows={5}
                                                            className="w-full bg-black/20 border border-indigo-900/50 rounded-2xl p-4 text-base outline-none text-indigo-100 focus:border-yellow-500/50 transition-all resize-none shadow-inner focus:bg-indigo-950/20"
                                                            placeholder="I feel blocked by..."
                                                            value={userData.question}
                                                            onChange={e => setUserData({ ...userData, question: e.target.value })}
                                                        />
                                                    </div>
                                                </>
                                            )}

                                            {/* Unlock Button */}
                                            {userData.question.length > 5 && (
                                                <button
                                                    onClick={nextIntakeStep}
                                                    className="w-full bg-yellow-600 hover:bg-yellow-500 text-black border border-yellow-500/50 px-8 py-5 rounded-full font-black tracking-[0.2em] text-sm transition-all shadow-xl shadow-yellow-600/20 active:scale-95 animate-in fade-in zoom-in group relative overflow-hidden"
                                                >
                                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                                        UNLOCK MY FULL READING <i className="fas fa-lock-open text-black/50"></i>
                                                    </span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    {renderInlineBack()}
                                </div>
                            ) : (
                                // Generic UI for Other Categories (Original Code)
                                <div className="space-y-8 text-center max-w-xl mx-auto">
                                    <h2 className="text-2xl md:text-4xl font-serif-mystic text-indigo-100 animate-ethereal-slide-up delay-200">"Finally, tell me... what keeps your heart heavy today?"</h2>
                                    <div className="space-y-6 animate-ethereal-slide-up delay-1000">
                                        <textarea
                                            autoFocus
                                            rows={5}
                                            className="w-full bg-black/40 border border-indigo-900 rounded-3xl p-6 text-lg outline-none text-indigo-100 focus:border-yellow-500 transition-all resize-none shadow-2xl"
                                            placeholder="Share your situation with Wanda..."
                                            value={userData.question}
                                            onChange={e => setUserData({ ...userData, question: e.target.value })}
                                        />
                                        {userData.question.length > 10 && (
                                            <button
                                                onClick={nextIntakeStep}
                                                className="bg-yellow-600 text-black px-12 py-4 rounded-full font-black tracking-widest text-xs md:text-sm transition-all shadow-xl shadow-yellow-600/20 active:scale-95 animate-in fade-in zoom-in"
                                            >
                                                CONTINUE
                                            </button>
                                        )}
                                    </div>
                                    {renderInlineBack()}
                                </div>
                            )
                        )
                    }

                    {
                        intakeSubStep === IntakeSubStep.EMAIL && (
                            <div className="space-y-8 text-center">
                                <h2 className="text-2xl md:text-4xl font-serif-mystic text-indigo-100 animate-ethereal-slide-up delay-200">"Where shall I send my written vision?"</h2>
                                <div className="relative max-w-sm mx-auto animate-ethereal-slide-up delay-1000">
                                    <input
                                        autoFocus
                                        type="email"
                                        className="w-full bg-transparent border-b-2 border-indigo-900 focus:border-yellow-500 text-2xl md:text-2xl text-center py-4 outline-none text-indigo-100 transition-all font-light placeholder-indigo-900"
                                        placeholder="Your email address..."
                                        value={userData.email}
                                        onChange={e => setUserData({ ...userData, email: e.target.value })}
                                        onKeyDown={e => e.key === 'Enter' && userData.email.includes('@') && nextIntakeStep()}
                                    />
                                    {userData.email && userData.email.includes('@') && (
                                        <button onClick={nextIntakeStep} className="mt-12 bg-indigo-600 text-white px-8 py-3 rounded-full font-bold tracking-widest text-xs md:text-sm transition-all animate-in fade-in zoom-in">REVEAL MY PATH</button>
                                    )}
                                    <p className="mt-4 text-[10px] text-indigo-400/60 uppercase tracking-widest">Strictly Confidential</p>
                                </div>
                                {renderInlineBack()}
                            </div>
                        )
                    }

                    {
                        intakeSubStep === IntakeSubStep.DELIVERY_INFO && (
                            <div className="fixed inset-0 z-[100] bg-black flex flex-col overflow-y-auto">
                                {/* Full screen overlay for Delivery Info step */}
                                <div className="min-h-screen flex flex-col items-center justify-start pt-20 px-6 relative w-full pb-12">
                                    <VideoBackground />

                                    <div className="flex-grow flex flex-col justify-center w-full max-w-4xl mx-auto z-10">
                                        <div className="text-left max-w-xl mx-auto bg-black/60 backdrop-blur-md p-6 rounded-2xl text-indigo-100 mb-8 border border-indigo-500/30 shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-700">
                                            <h3 className="text-yellow-500 font-bold mb-4 text-xl flex items-center gap-2">
                                                <i className="fas fa-bolt"></i> Delivery Information
                                            </h3>
                                            <ul className="list-none space-y-4 text-sm md:text-base">
                                                <li className="flex gap-3">
                                                    <span className="bg-indigo-500/20 text-indigo-300 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs mt-0.5">1</span>
                                                    <div><strong className="text-indigo-200">Same Hour Reading:</strong> <span className="text-indigo-100/80">Instant clarity delivered within the same hour of your purchase.</span></div>
                                                </li>
                                                <li className="flex gap-3">
                                                    <span className="bg-indigo-500/20 text-indigo-300 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs mt-0.5">2</span>
                                                    <div><strong className="text-indigo-200">Same Day Reading:</strong> <span className="text-indigo-100/80">A thorough and carefully detailed response delivered within 24 hours.</span></div>
                                                </li>
                                                <li className="flex gap-3 pt-2 border-t border-indigo-500/20">
                                                    <span className="text-yellow-500 text-lg mt-0.5"><i className="fas fa-shield-alt"></i></span>
                                                    <div className="text-xs text-indigo-300/60 leading-relaxed"><strong>Legal Disclaimer:</strong> By purchasing this reading you confirm you are 18+ and understand it is for entertainment purposes only. All sales are final.</div>
                                                </li>
                                            </ul>
                                        </div>

                                        <div className="bg-black/40 p-6 rounded-3xl border border-indigo-900/50 backdrop-blur-sm max-w-xl mx-auto w-full mb-8">
                                            <p className="text-lg text-indigo-200 italic mb-6 font-serif-mystic text-center">"I have received your energy. I am ready to begin."</p>
                                            <button
                                                onClick={onComplete}
                                                className="w-full bg-yellow-600 hover:bg-yellow-500 text-black px-8 py-4 rounded-full font-black tracking-widest text-xs md:text-sm transition-all shadow-xl shadow-yellow-600/20 active:scale-95 animate-in fade-in zoom-in uppercase"
                                            >
                                                Summon My Initial Vision
                                            </button>
                                        </div>
                                    </div>

                                    <div className="w-full max-w-xl mx-auto mt-auto pb-6 z-10">
                                        <ReviewSection reviews={reviews} isLoading={isLoading} compact={true} />
                                    </div>
                                </div>
                            </div>
                        )
                    }

                </div >
            </div >
        </div >
    );
};
