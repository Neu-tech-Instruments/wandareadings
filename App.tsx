
import React, { useState, useEffect } from 'react';
import { AppStep, UserData, ReadingResponse, Review } from './types';
import { getInitialReading, localizeExperience, getFullReading, FullReadingContent } from './services/geminiService';
import { ReviewSection } from './components/ReviewSection';
import { VideoBackground } from "./src/components/VideoBackground";
import { REVIEWS } from './src/data/reviews';
import { getDailyReviews } from './src/services/reviewRotator';

const STRIPE_CHECKOUT_LINK = "https://buy.stripe.com/00waEY4C58QN23k4kY6Vq01";

enum IntakeSubStep {
  NAME,
  BIRTHDATE,
  PATH,
  PARTNER_QUERY,
  PARTNER_DETAILS,
  SITUATION,
  DELIVERY_INFO
}

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.LANDING);
  const [intakeSubStep, setIntakeSubStep] = useState<IntakeSubStep>(IntakeSubStep.NAME);
  const [userData, setUserData] = useState<UserData>({
    name: '',
    birthDate: '',
    partnerName: '',
    partnerBirthDate: '',
    question: '',
    readingType: 'Love & Relationships'
  });
  const [reading, setReading] = useState<ReadingResponse | null>(null);
  const [fullReading, setFullReading] = useState<FullReadingContent | null>(null);
  const [loadingText, setLoadingText] = useState('Connecting to the cosmos...');

  const [reviews, setReviews] = useState<Review[]>([]);
  const [heroContent, setHeroContent] = useState({
    title: "Discover Your Destiny in Love",
    subtitle: "Receive a deep-dive psychic reading from Wanda, an expert in twin flames, soul connections, and spiritual clarity.",
    cta: "START YOUR INQUIRY"
  });
  const [intakeContent, setIntakeContent] = useState({
    greeting: "Hi there! I’m Wanda, a seasoned psychic medium and spellcaster...",
    whatYouReceive: "✨ What you’ll receive: Real, grounded insight into your romantic situation...",
    instructions: "💌 Once you begin: Please provide your name, birthdate, and their details if applicable.",
    footer: "🌙 This is not a generic reading. Every message is personally channeled for you."
  });
  const [isLocalizing, setIsLocalizing] = useState(false);

  useEffect(() => {
    // Initialize reviews (dynamic daily rotation)
    const dailyReviews = getDailyReviews(REVIEWS);
    setReviews(dailyReviews);
  }, []);

  useEffect(() => {
    const handleInit = async () => {

      const urlParams = new URLSearchParams(window.location.search);
      const paymentSuccess = urlParams.get('payment_success');

      if (paymentSuccess === 'true') {
        const savedData = localStorage.getItem('wanda_intake_data');
        if (savedData) {
          const parsed = JSON.parse(savedData);
          setUserData(parsed);
          setStep(AppStep.PAYMENT_CONFIRMED);
        }
      }

      setIsLocalizing(true);
      const getPos = async (): Promise<{ coords: { latitude: number; longitude: number } } | null> => {
        try {
          const response = await fetch('https://ipapi.co/json/');
          if (!response.ok) return null;
          const data = await response.json();
          if (data.latitude && data.longitude) {
            return { coords: { latitude: data.latitude, longitude: data.longitude } };
          }
          return null;
        } catch (error) {
          console.error('IP geolocation failed:', error);
          return null;
        }
      };
      const position = await getPos();
      const localizedData = await localizeExperience(REVIEWS, position?.coords.latitude ?? null, position?.coords.longitude ?? null);
      setReviews(localizedData.reviews);
      setHeroContent(localizedData.hero);
      setIntakeContent(localizedData.intake);
      setIsLocalizing(false);
    };
    handleInit();
  }, []);

  const handleStart = () => setStep(AppStep.INTAKE);

  const nextIntakeStep = () => {
    if (intakeSubStep === IntakeSubStep.DELIVERY_INFO) {
      finalizeIntake();
    } else {
      setIntakeSubStep(prev => prev + 1);
    }
  };

  const finalizeIntake = () => {
    localStorage.setItem('wanda_intake_data', JSON.stringify(userData));
    setStep(AppStep.PROCESSING);
    setLoadingText("Redirecting to Secure Payment...");
    setTimeout(() => {
      window.location.href = STRIPE_CHECKOUT_LINK;
    }, 1200);
  };

  const progressPercentage = ((intakeSubStep + 1) / 7) * 100;

  return (
    <div className="min-h-screen flex flex-col selection:bg-indigo-500/30">
      <nav className="border-b border-indigo-900/50 bg-black/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 md:py-4 flex justify-between items-center">
          <h1 className="text-lg md:text-xl font-serif-mystic text-indigo-100 tracking-widest flex items-center gap-2 cursor-pointer" onClick={() => window.location.href = window.location.pathname}>
            <i className="fas fa-moon text-yellow-500"></i> WANDA
          </h1>
          <div className="flex items-center gap-4">
            {step === AppStep.INTAKE && (
              <div className="hidden xs:flex items-center gap-2 mr-2">
                <div className="w-20 h-1 bg-indigo-900 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-500 transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
                </div>
                <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-tighter">{Math.round(progressPercentage)}%</span>
              </div>
            )}
            {step === AppStep.LANDING && (
              <button onClick={handleStart} className="text-[10px] md:text-xs border border-yellow-500/50 text-yellow-500 px-4 py-1.5 rounded-full hover:bg-yellow-500 hover:text-black transition-all font-semibold uppercase tracking-wider">Start</button>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-grow flex flex-col">
        {step === AppStep.LANDING && (
          <div className="animate-in fade-in duration-700">
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
                <button onClick={handleStart} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-12 py-5 rounded-full font-bold tracking-widest text-sm md:text-base border-2 border-yellow-500/40 hover:border-yellow-500/60 transition-all active:scale-95 shadow-[0_0_30px_rgba(234,179,8,0.3)] hover:shadow-[0_0_40px_rgba(234,179,8,0.5)]">{heroContent.cta}</button>
              </div>
            </section>
            <div className="bg-[#0a0614] w-full">
              <ReviewSection reviews={reviews} isLoading={isLocalizing} />
            </div>
          </div>
        )}

        {step === AppStep.INTAKE && (
          <div className="flex-grow flex items-center justify-center py-12 px-6">
            <div className="max-w-xl w-full">
              {/* Question container */}
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">

                {intakeSubStep === IntakeSubStep.NAME && (
                  <div className="space-y-8 text-center">
                    <h2 className="text-2xl md:text-4xl font-serif-mystic text-indigo-100">"First, let me feel your presence. What is your full name?"</h2>
                    <div className="relative">
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
                  </div>
                )}

                {intakeSubStep === IntakeSubStep.BIRTHDATE && (
                  <div className="space-y-8 text-center">
                    <h2 className="text-2xl md:text-4xl font-serif-mystic text-indigo-100">"A powerful name. And when did your soul first enter this world?"</h2>
                    <div className="flex flex-col items-center gap-8">
                      <input
                        autoFocus
                        type="date"
                        className="w-full max-w-xs bg-black/40 border border-indigo-900 rounded-2xl px-6 py-4 text-xl text-center outline-none text-indigo-100 focus:border-yellow-500 transition-all"
                        value={userData.birthDate}
                        onChange={e => setUserData({ ...userData, birthDate: e.target.value })}
                      />
                      {userData.birthDate && (
                        <button onClick={nextIntakeStep} className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold tracking-widest text-xs transition-all animate-in fade-in zoom-in">REVEAL THE STARS</button>
                      )}
                    </div>
                  </div>
                )}

                {intakeSubStep === IntakeSubStep.PATH && (
                  <div className="space-y-8 text-center">
                    <h2 className="text-2xl md:text-4xl font-serif-mystic text-indigo-100">"Which path of destiny are we exploring today?"</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {['Love & Relationships', 'Twin Flame Bond', 'Soulmate Discovery', 'Breakup Recovery'].map(path => (
                        <button
                          key={path}
                          onClick={() => { setUserData({ ...userData, readingType: path }); nextIntakeStep(); }}
                          className={`p-6 rounded-2xl border transition-all text-sm font-bold tracking-widest uppercase
                            ${userData.readingType === path ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500' : 'border-indigo-900 hover:border-indigo-500 text-indigo-300'}
                          `}
                        >
                          {path}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {intakeSubStep === IntakeSubStep.PARTNER_QUERY && (
                  <div className="space-y-8 text-center">
                    <h2 className="text-2xl md:text-4xl font-serif-mystic text-indigo-100">"Is there another soul whose energy is intertwined with yours?"</h2>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button onClick={nextIntakeStep} className="bg-indigo-600 text-white px-8 py-4 rounded-full font-bold tracking-widest text-xs transition-all hover:bg-indigo-500">YES, A PARTNER</button>
                      <button onClick={() => setIntakeSubStep(IntakeSubStep.SITUATION)} className="border border-indigo-700 text-indigo-300 px-8 py-4 rounded-full font-bold tracking-widest text-xs transition-all hover:bg-indigo-900/40">NO, JUST MY JOURNEY</button>
                    </div>
                  </div>
                )}

                {intakeSubStep === IntakeSubStep.PARTNER_DETAILS && (
                  <div className="space-y-8 text-center">
                    <h2 className="text-2xl md:text-4xl font-serif-mystic text-indigo-100">"Tell me of them. Their name and their arrival."</h2>
                    <div className="space-y-4 max-w-sm mx-auto">
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
                  </div>
                )}

                {intakeSubStep === IntakeSubStep.SITUATION && (
                  <div className="space-y-8 text-center max-w-xl mx-auto">
                    <h2 className="text-2xl md:text-4xl font-serif-mystic text-indigo-100">"Finally, tell me... what keeps your heart heavy today?"</h2>
                    <div className="space-y-6">
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
                  </div>
                )}

                {intakeSubStep === IntakeSubStep.DELIVERY_INFO && (
                  <div className="flex-grow flex flex-col items-center justify-center px-6 relative w-full h-full min-h-[600px]">
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
                          onClick={finalizeIntake}
                          className="w-full bg-yellow-600 hover:bg-yellow-500 text-black px-8 py-4 rounded-full font-black tracking-widest text-xs md:text-sm transition-all shadow-xl shadow-yellow-600/20 active:scale-95 animate-in fade-in zoom-in uppercase"
                        >
                          Summon My Initial Vision
                        </button>
                      </div>
                    </div>

                    <div className="w-full max-w-xl mx-auto mt-auto pb-6 z-10">
                      <ReviewSection reviews={reviews} isLoading={isLocalizing} compact={true} />
                    </div>
                  </div>
                )}

              </div>

              {/* Back Button */}
              {intakeSubStep !== IntakeSubStep.NAME && (
                <button
                  onClick={() => setIntakeSubStep(prev => prev - 1)}
                  className="fixed bottom-10 left-10 text-[10px] uppercase tracking-[0.3em] text-indigo-600 hover:text-indigo-400 transition-colors hidden md:block"
                >
                  <i className="fas fa-arrow-left mr-2"></i> Return
                </button>
              )}
            </div>
          </div>
        )}

        {step === AppStep.PAYMENT_CONFIRMED && (
          <div className="flex-grow flex flex-col items-center justify-center px-6 py-12 relative">
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
        )}

        {step === AppStep.PROCESSING && (
          <div className="flex-grow flex flex-col items-center justify-center px-6 text-center relative">

            <ReviewSection reviews={reviews} isLoading={isLocalizing} />
            <div className="mt-6 text-left max-w-xl mx-auto bg-black/40 p-4 rounded-lg text-indigo-100">
              <h3 className="text-yellow-500 font-bold mb-2">⚡ Delivery Information</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Same Hour Reading: Instant clarity delivered within the same hour of your purchase.</li>
                <li>Same Day Reading: A thorough and carefully detailed response delivered within 24 hours.</li>
                <li>Legal Disclaimer: By purchasing this reading you confirm you are 18+ and understand it is for entertainment purposes only. It does not replace professional advice of a legal, medical, financial, or psychological nature. All sales are final.</li>
              </ul>
            </div>

            <div className="glass-effect rounded-3xl border border-yellow-500/20 overflow-hidden relative shadow-2xl">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent"></div>

              <div className="p-6 md:p-12 space-y-10 md:space-y-12">
                <div className="flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center border-b border-indigo-900/50 pb-8">
                  <div className="space-y-1">
                    <p className="text-[9px] uppercase tracking-widest text-yellow-500/60 font-bold">Seeker Profile</p>
                    <p className="font-serif-mystic text-indigo-100 text-sm md:text-base">{userData.name} <span className="text-indigo-400 font-sans text-xs">({userData.birthDate})</span></p>
                  </div>
                  {userData.partnerName && (
                    <div className="space-y-1 sm:text-right">
                      <p className="text-[9px] uppercase tracking-widest text-yellow-500/60 font-bold">Intertwined Soul</p>
                      <p className="font-serif-mystic text-indigo-100 text-sm md:text-base">{userData.partnerName} <span className="text-indigo-400 font-sans text-xs">({userData.partnerBirthDate})</span></p>
                    </div>
                  )}
                </div>

                {reading && (
                  <div className="bg-yellow-500/5 p-6 rounded-2xl border border-yellow-500/10 shadow-inner">
                    <h4 className="text-[10px] text-yellow-500 uppercase tracking-[0.2em] mb-2 font-black">Your Energy Signature</h4>
                    <p className="text-indigo-50 font-serif-mystic italic text-lg md:text-xl mb-3">"{reading.energySignature}"</p>
                    <p className="text-indigo-200/80 text-sm leading-relaxed italic">{reading.teaser}</p>
                  </div>
                )}

                <section className="space-y-4">
                  <h3 className="text-lg md:text-xl font-serif-mystic text-indigo-100 flex items-center gap-3">
                    <i className="fas fa-feather-pointed text-xs text-yellow-500"></i> Wanda's Personal Message
                  </h3>
                  <p className="text-indigo-100/90 leading-relaxed font-light text-base md:text-lg italic border-l-2 border-indigo-500/20 pl-4 md:pl-6">"{fullReading.intro}"</p>
                </section>

                <section className="bg-indigo-950/20 p-6 md:p-8 rounded-2xl border border-indigo-500/10 space-y-4 shadow-sm">
                  <h3 className="text-lg md:text-xl font-serif-mystic text-indigo-100 flex items-center gap-3">
                    <i className="fas fa-atom text-xs text-yellow-500 animate-pulse"></i> Energetic Alignment
                  </h3>
                  <p className="text-indigo-100/80 leading-relaxed font-light text-sm md:text-base">{fullReading.auraAnalysis}</p>
                </section>

                <section className="space-y-4">
                  <h3 className="text-lg md:text-xl font-serif-mystic text-indigo-100 flex items-center gap-3">
                    <i className="fas fa-eye text-xs text-yellow-500"></i> The Channelling
                  </h3>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-indigo-50 leading-relaxed text-base md:text-lg font-medium">{fullReading.vision}</p>
                  </div>
                </section>

                <section className="bg-yellow-500/5 border-l-4 border-yellow-500/40 p-6 md:p-8 space-y-4 rounded-r-2xl">
                  <h3 className="text-lg md:text-xl font-serif-mystic text-indigo-200">Sacred Guidance</h3>
                  <p className="text-indigo-100/80 leading-relaxed text-sm md:text-base">{fullReading.guidance}</p>
                </section>

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
        )
        }
      </main >

      <footer className="border-t border-indigo-900/50 py-10 md:py-16 bg-black/60">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-8 md:w-16 bg-indigo-900"></div>
            <h4 className="font-serif-mystic text-indigo-100 tracking-[0.4em] uppercase text-lg md:text-xl">WANDA</h4>
            <div className="h-px w-8 md:w-16 bg-indigo-900"></div>
          </div>
          <p className="text-[9px] md:text-[10px] text-indigo-700 uppercase tracking-[0.3em] font-medium">&copy; 2026 Ethereal Insights Global. Secure SSL Encryption Active.</p>
        </div>
      </footer>
    </div >
  );
};

export default App;
