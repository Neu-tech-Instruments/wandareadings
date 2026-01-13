import React from 'react';
import { UserData } from '../types';
import { VideoBackground } from "../src/components/VideoBackground";

interface PaymentConfirmedPageProps {
    userData: UserData;
}

export const PaymentConfirmedPage: React.FC<PaymentConfirmedPageProps> = ({ userData }) => {
    return (
        <div className="flex-grow flex flex-col items-center justify-center px-6 py-12 relative w-full">
            <VideoBackground />

            <div className="relative z-10 max-w-2xl w-full">
                <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full bg-yellow-500/10 border-2 border-yellow-500/40 mb-6 shadow-[0_0_40px_rgba(234,179,8,0.3)] animate-pulse">
                        <i className="fas fa-check text-yellow-500 text-3xl md:text-4xl"></i>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-serif-mystic text-indigo-100 mb-4 leading-tight">Payment Confirmed</h1>
                    <p className="text-lg md:text-xl text-indigo-200/90 font-light leading-relaxed">Your journey has begun</p>
                </div>

                <div className="bg-black/60 backdrop-blur-md border border-indigo-500/30 rounded-3xl p-8 md:p-10 space-y-6 shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
                    <div className="flex items-start gap-4 pb-6 border-b border-indigo-500/20">
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-yellow-500/40 shadow-[0_0_20px_rgba(234,179,8,0.3)] flex-shrink-0">
                            <img src="/wanda.png" alt="Wanda" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                            <p className="text-indigo-100 text-base md:text-lg font-serif-mystic italic leading-relaxed">
                                "Thank you, {userData.name}. I have received your energy and your question. I am now channeling the cosmos to bring you the clarity you seek."
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-600/20 flex items-center justify-center flex-shrink-0">
                                <i className="fas fa-envelope text-yellow-500"></i>
                            </div>
                            <div>
                                <h3 className="text-indigo-100 font-semibold text-sm md:text-base">You'll Receive an Email</h3>
                                <p className="text-indigo-300/80 text-xs md:text-sm">Your personalized reading will be delivered to your inbox</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-600/20 flex items-center justify-center flex-shrink-0">
                                <i className="fas fa-clock text-yellow-500"></i>
                            </div>
                            <div>
                                <h3 className="text-indigo-100 font-semibold text-sm md:text-base">Delivery Timeline</h3>
                                <p className="text-indigo-300/80 text-xs md:text-sm">Within 24 hours • Most readings delivered same day</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-600/20 flex items-center justify-center flex-shrink-0">
                                <i className="fas fa-video text-yellow-500"></i>
                            </div>
                            <div>
                                <h3 className="text-indigo-100 font-semibold text-sm md:text-base">Personal Video Reading</h3>
                                <p className="text-indigo-300/80 text-xs md:text-sm">Wanda will personally channel your message on video</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-6 mt-6">
                        <h4 className="text-yellow-500 font-bold text-sm mb-3 flex items-center gap-2">
                            <i className="fas fa-info-circle"></i>
                            Your Reading Details
                        </h4>
                        <div className="space-y-2 text-xs md:text-sm">
                            <div className="flex justify-between">
                                <span className="text-indigo-300">Name:</span>
                                <span className="text-indigo-100 font-medium">{userData.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-indigo-300">Birth Date:</span>
                                <span className="text-indigo-100 font-medium">{userData.birthDate}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-indigo-300">Reading Type:</span>
                                <span className="text-indigo-100 font-medium">{userData.readingType}</span>
                            </div>
                            {userData.partnerName && (
                                <div className="flex justify-between">
                                    <span className="text-indigo-300">Partner:</span>
                                    <span className="text-indigo-100 font-medium">{userData.partnerName}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={() => window.location.href = window.location.pathname}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-full font-bold tracking-widest text-xs md:text-sm transition-all border border-indigo-500/50 hover:border-indigo-400 mt-6"
                    >
                        RETURN HOME
                    </button>
                </div>

                <p className="text-center text-indigo-500 text-xs mt-6 animate-in fade-in duration-700 delay-300">
                    <i className="fas fa-moon mr-2"></i>
                    The universe is aligning for your reading
                </p>
            </div>
        </div>
    );
};
