import React from 'react';
import { UserData, ReadingResponse, Review } from '../types';
import { FullReadingContent } from '../services/geminiService';
import { ReviewSection } from './ReviewSection';

interface ReadingRevealPageProps {
    userData: UserData;
    reviews: Review[];
    isLoading: boolean;
    reading: ReadingResponse | null;
    fullReading: FullReadingContent | null;
}

export const ReadingRevealPage: React.FC<ReadingRevealPageProps> = ({ userData, reviews, isLoading, reading, fullReading }) => {
    if (!fullReading) return null; // Should ideally show a loader here if null

    return (
        <div className="flex-grow flex flex-col items-center justify-center px-6 text-center relative w-full pb-12">

            <ReviewSection reviews={reviews} isLoading={isLoading} />
            <div className="mt-6 text-left max-w-xl mx-auto bg-black/40 p-4 rounded-lg text-indigo-100">
                <h3 className="text-yellow-500 font-bold mb-2">⚡ Delivery Information</h3>
                <ul className="list-disc list-inside space-y-1">
                    <li>Same Hour Reading: Instant clarity delivered within the same hour of your purchase.</li>
                    <li>Same Day Reading: A thorough and carefully detailed response delivered within 24 hours.</li>
                    <li>Legal Disclaimer: By purchasing this reading you confirm you are 18+ and understand it is for entertainment purposes only. It does not replace professional advice of a legal, medical, financial, or psychological nature. All sales are final.</li>
                </ul>
            </div>

            <div className="glass-effect rounded-3xl border border-yellow-500/20 overflow-hidden relative shadow-2xl mt-8 max-w-4xl w-full">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent"></div>

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

                    <section className="bg-black/40 p-6 md:p-10 rounded-2xl border border-indigo-900 flex flex-col items-center text-center space-y-5">
                        <div className="w-16 h-16 rounded-full bg-indigo-600/10 flex items-center justify-center shadow-inner group">
                            <i className="fas fa-video text-yellow-500 group-hover:scale-110 transition-transform"></i>
                        </div>
                        <div>
                            <h3 className="text-base md:text-lg font-serif-mystic text-indigo-200 mb-2">Personal Video Insight Incoming</h3>
                            <p className="text-[10px] md:text-xs text-indigo-400 max-w-sm uppercase tracking-widest leading-relaxed">Wanda is personally manifesting your video reading. It will appear here and in your inbox within 2-4 hours.</p>
                        </div>
                    </section>

                    <div className="text-center pt-8 border-t border-indigo-900/50">
                        <p className="font-serif-mystic text-yellow-500/90 italic text-xl md:text-2xl mb-2">{fullReading.closing}</p>
                        <p className="text-[9px] md:text-[10px] uppercase tracking-widest text-indigo-500 font-bold">Certified Ethereal Reading • Practitioner ID: #W882</p>
                    </div>
                </div>

                <div className="bg-indigo-900/10 p-4 md:p-6 border-t border-indigo-900/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <button className="text-[10px] text-indigo-400 hover:text-indigo-100 flex items-center gap-2 transition-colors py-2">
                        <i className="fas fa-file-pdf"></i> Download PDF Report
                    </button>
                    <button onClick={() => window.location.href = window.location.pathname} className="w-full sm:w-auto text-[10px] bg-indigo-600/40 px-8 py-3 rounded-full text-indigo-100 font-bold hover:bg-indigo-600 transition-all uppercase tracking-widest border border-indigo-500/20">Return Home</button>
                </div>
            </div>
        </div>
    );
};
