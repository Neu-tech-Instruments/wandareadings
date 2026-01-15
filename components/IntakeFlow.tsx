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

    const handleTransition = (callback: () => void) => {
        setIsExiting(true);
        setTimeout(() => {
            callback();
            setIsExiting(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 1200); // Even slower wait time
    };

    const nextIntakeStep = () => {
        if (intakeSubStep === IntakeSubStep.DELIVERY_INFO) {
            onComplete();
        } else {
            handleTransition(() => {
                const nextStep = intakeSubStep + 1;
                setIntakeSubStep(nextStep);
                onStepChange?.(nextStep);
            });
        }
    };

    // ... (keep other handlers same)

    const handleBack = () => {
        handleTransition(() => {
            const prevStep = intakeSubStep - 1;
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

                    {intakeSubStep === IntakeSubStep.PATH && (
                        <div className="space-y-8 text-center">
                            <h2 className="text-2xl md:text-4xl font-serif-mystic text-indigo-100 animate-ethereal-slide-up delay-200">"Which path of destiny are we exploring today?"</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-ethereal-slide-up delay-1000">
                                {['Love & Relationships', 'Twin Flame Bond', 'Soulmate Discovery', 'Breakup Recovery'].map(path => (
                                    <button
                                        key={path}
                                        onClick={() => {
                                            handleTransition(() => {
                                                setUserData({ ...userData, readingType: path });
                                                const nextStep = intakeSubStep + 1;
                                                setIntakeSubStep(nextStep);
                                                onStepChange?.(nextStep);
                                            });
                                        }}
                                        className={`p-6 rounded-2xl border transition-all text-sm font-bold tracking-widest uppercase
                      ${userData.readingType === path ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500' : 'border-indigo-900 hover:border-indigo-500 text-indigo-300'}
                    `}
                                    >
                                        {path}
                                    </button>
                                ))}
                            </div>
                            {renderInlineBack()}
                        </div>
                    )}

                    {intakeSubStep === IntakeSubStep.PARTNER_QUERY && (
                        <div className="space-y-8 text-center">
                            <h2 className="text-2xl md:text-4xl font-serif-mystic text-indigo-100 animate-ethereal-slide-up delay-200">"Is there another soul whose energy is intertwined with yours?"</h2>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-ethereal-slide-up delay-1000">
                                <button onClick={nextIntakeStep} className="bg-indigo-600 text-white px-8 py-4 rounded-full font-bold tracking-widest text-xs transition-all hover:bg-indigo-500">YES, A PARTNER</button>
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
                    )}

                    {intakeSubStep === IntakeSubStep.PARTNER_DETAILS && (
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
                    )}

                    {intakeSubStep === IntakeSubStep.SITUATION && (
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
                    )}

                    {intakeSubStep === IntakeSubStep.EMAIL && (
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
                    )}

                    {intakeSubStep === IntakeSubStep.DELIVERY_INFO && (
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
                    )}

                </div>
            </div>
        </div >
    );
};
