import React from 'react';
import { VideoBackground } from "../src/components/VideoBackground";
import { ReviewSection } from './ReviewSection';
import { Review } from '../types';

interface LandingPageProps {
    heroContent: {
        title: string;
        subtitle: string;
        cta: string;
    };
    reviews: Review[];
    isLoading: boolean;
    isExiting?: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({ heroContent, reviews, isLoading, onStart, isExiting }) => {
    return (
        <div className={`w-full transition-all duration-800 ease-in-out ${isExiting ? 'opacity-0 blur-xl scale-95' : 'animate-in fade-in duration-700 opacity-100 blur-0 scale-100'}`}>
            <section className="relative min-h-[70vh] md:h-[80vh] flex items-center justify-center overflow-hidden py-12 md:py-0">
                <VideoBackground />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30 z-[1]"></div>
                {/* Gradient fade to blend into review section - creates seamless premium transition */}
                <div className="absolute bottom-0 left-0 right-0 h-40 md:h-56 bg-gradient-to-b from-transparent from-0% via-[#0a0614]/30 via-30% via-[#0a0614]/70 via-60% to-[#0a0614] to-100% z-[2]"></div>
                <div className="relative z-10 text-center px-6 max-w-4xl">
                    <div className="inline-block px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 text-[10px] tracking-[0.2em] mb-4 md:mb-6 rounded-full font-bold uppercase">Signature Reading</div>
                    <h1 className="text-3xl md:text-7xl font-serif-mystic mb-4 md:mb-6 leading-tight px-2">{heroContent.title}</h1>
                    <div className="flex items-center justify-center gap-4 mb-8 md:mb-10 max-w-2xl mx-auto">
                        <div className="relative flex-shrink-0">
                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-yellow-500/40 shadow-[0_0_20px_rgba(234,179,8,0.3)]">
                                <img src="/wanda.png" alt="Wanda" className="w-full h-full object-cover" />
                            </div>
                        </div>
                        <p className="text-base md:text-xl text-indigo-100/90 font-light leading-relaxed md:leading-loose text-left flex-1">{heroContent.subtitle}</p>
                    </div>
                    <button onClick={onStart} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-12 py-5 rounded-full font-bold tracking-widest text-sm md:text-base border-2 border-yellow-500/40 hover:border-yellow-500/60 transition-all active:scale-95 shadow-[0_0_30px_rgba(234,179,8,0.3)] hover:shadow-[0_0_40px_rgba(234,179,8,0.5)]">{heroContent.cta}</button>
                </div>
            </section>
            <div className="bg-[#0a0614] w-full">
                <ReviewSection reviews={reviews} isLoading={isLoading} />
            </div>
        </div>
    );
};
