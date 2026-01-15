
import React, { useState, useEffect } from 'react';
import { AppStep, UserData, ReadingResponse, Review, IntakeSubStep } from './types';
import { getInitialReading, localizeExperience, getFullReading, FullReadingContent } from './services/geminiService';
import { REVIEWS } from './src/data/reviews';
import { getDailyReviews } from './src/services/reviewRotator';
import { supabase } from './src/services/supabaseClient';

// Components
import { LandingPage } from './components/LandingPage';
import { IntakeFlow } from './components/IntakeFlow';
import { PaymentConfirmedPage } from './components/PaymentConfirmedPage';
import { ReadingRevealPage } from './components/ReadingRevealPage';

const STRIPE_CHECKOUT_LINK = "https://buy.stripe.com/00waEY4C58QN23k4kY6Vq01";

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.LANDING);
  // We keep track of intake step here only for the nav bar progress, 
  // but the actual flow logic is handled inside IntakeFlow now.
  // Ideally, we could lift this entirely or let IntakeFlow handle it.
  const [currentIntakeStep, setCurrentIntakeStep] = useState<IntakeSubStep>(IntakeSubStep.NAME);

  const [userData, setUserData] = useState<UserData>({
    name: '',
    birthDate: '',
    partnerName: '',
    partnerBirthDate: '',
    question: '',
    email: '',
    readingType: 'Love & Relationships'
  });
  const [reading, setReading] = useState<ReadingResponse | null>(null);
  const [fullReading, setFullReading] = useState<FullReadingContent | null>(null);
  const [loadingText, setLoadingText] = useState('Connecting to the cosmos...');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const [reviews, setReviews] = useState<Review[]>([]);
  // ... (keep middle content)

  // ... (keep useEffects)

  const handleStart = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setStep(AppStep.INTAKE);
      setCurrentIntakeStep(IntakeSubStep.NAME);
      setIsTransitioning(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 800);
  };
  const [heroContent, setHeroContent] = useState({
    title: "Discover Your True\u00A0Path",
    subtitle: "Illuminate your true path. Deep psychic insights into love, career, and your soul's purpose.",
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
      const debugView = urlParams.get('view');

      if (paymentSuccess === 'true') {
        const savedReadingId = localStorage.getItem('wanda_reading_id');
        if (savedReadingId) {
          // Fetch from Supabase
          try {
            const { data, error } = await supabase
              .from('readings')
              .select('user_data')
              .eq('id', savedReadingId)
              .single();

            if (data && data.user_data) {
              setUserData(data.user_data);
              setStep(AppStep.PAYMENT_CONFIRMED);
            } else if (error) {
              console.error("Error fetching reading:", error);
              // Fallback to local storage if DB fails? Or just stay on landing
            }
          } catch (err) {
            console.error("Supabase error:", err);
          }
        }
      } else if (debugView) {
        // Debugging / Direct Navigation Routes
        switch (debugView.toLowerCase()) {
          case 'landing':
          case 'landingpage':
            setStep(AppStep.LANDING);
            break;
          case 'intake':
          case 'intakeflow':
            setStep(AppStep.INTAKE);
            break;
          case 'delivery':
          case 'deliveryinfo':
            setStep(AppStep.INTAKE);
            setCurrentIntakeStep(IntakeSubStep.DELIVERY_INFO);
            break;
          case 'success':
          case 'confirmed':
          case 'paymentconfirmedpage':
            setStep(AppStep.PAYMENT_CONFIRMED);
            // Ensure some dummy data exists so it doesn't crash
            if (!userData.name) setUserData({ ...userData, name: "Mystic Seeker", birthDate: "1990-01-01" });
            break;
          case 'reveal':
          case 'reading':
          case 'readingrevealpage':
            // Reading Retrieval Flow (Magic Link)
            // Parse user data from URL params if available
            const name = urlParams.get('name');
            const birthDate = urlParams.get('dob');
            const partnerName = urlParams.get('partner');
            const partnerBirthDate = urlParams.get('partnerDob');
            const readingType = urlParams.get('type') || 'Love & Relationships';
            const question = urlParams.get('q') || '';
            const email = urlParams.get('email') || '';

            if (name && birthDate) {
              const retrievedData: UserData = {
                name,
                birthDate,
                partnerName: partnerName || '',
                partnerBirthDate: partnerBirthDate || '',
                question,
                email,
                readingType
              };
              setUserData(retrievedData);
              setStep(AppStep.PROCESSING);
              setLoadingText("Unsealing your destiny...");

              // Trigger reading generation
              try {
                const [teaserResult, fullResult] = await Promise.all([
                  getInitialReading(retrievedData),
                  getFullReading(retrievedData)
                ]);
                setReading(teaserResult);
                setFullReading(fullResult);
              } catch (err) {
                console.error("Failed to retrieve reading:", err);
                setLoadingText("The stars are clouded. Please try again.");
              }
            } else {
              // Fallback if just ?view=ReadingRevealPage without params (Debug mode)
              setStep(AppStep.PROCESSING);
              if (!reading) {
                setReading({ energySignature: "Radiant Sun", teaser: "A bright future awaits..." });
                setFullReading({
                  paragraph1: "The energy around you is shifting...",
                  paragraph2: "Your answer lies within...",
                  paragraph3: "Trust the path ahead..."
                });
              }
            }
            break;
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



  // Progressive Saving Logic
  const saveProgress = async (currentData: UserData) => {
    try {
      const savedReadingId = localStorage.getItem('wanda_reading_id');

      if (savedReadingId) {
        // Update existing row
        const { error } = await supabase
          .from('readings')
          .update({ user_data: currentData })
          .eq('id', savedReadingId);
        if (error) console.error("Supabase Update Error:", error);
      } else {
        // Initial insert happens on first step change if we want, or we can wait.
        // Actually, if we just update, we need an ID. 
        // If we don't have an ID, we should insert.
        // But what if user just typed one letter? We don't want to spam inserts.
        // Let's only insert if we have real data (e.g. name).
        if (currentData.name) {
          const { data, error } = await supabase
            .from('readings')
            .insert([{ user_data: currentData, status: 'pending' }])
            .select()
            .single();

          if (data) localStorage.setItem('wanda_reading_id', data.id);
          if (error) console.error("Supabase Insert Error:", error);
        }
      }
    } catch (err) {
      console.error("Progressive Save Error:", err);
    }
  };

  const handleStepChange = (newStep: IntakeSubStep) => {
    setCurrentIntakeStep(newStep);
    // Fire and forget save
    saveProgress(userData);
  };

  const handleIntakeComplete = async () => {
    setStep(AppStep.PROCESSING);
    setLoadingText("Saving your energy signature...");

    try {
      // Save to Supabase
      const { data, error } = await supabase
        .from('readings')
        .insert([{ user_data: userData, status: 'pending' }])
        .select()
        .single();

      if (data) {
        localStorage.setItem('wanda_reading_id', data.id);
      }

      if (error) {
        console.error("Supabase Save Error:", error);
        // Fallback: still save to local storage just in case
        localStorage.setItem('wanda_intake_data', JSON.stringify(userData));
      }
    } catch (err) {
      console.error("Save Error:", err);
      localStorage.setItem('wanda_intake_data', JSON.stringify(userData));
    }

    setLoadingText("Connecting to the cosmos...");

    // OWNER BYPASS: If email contains 'test', skip payment and show reading
    if (userData.email.toLowerCase().includes('test')) {
      try {
        const [teaserResult, fullResult] = await Promise.all([
          getInitialReading(userData),
          getFullReading(userData)
        ]);
        setReading(teaserResult);
        setFullReading(fullResult);
        // Stay on PROCESSING step, which renders the result if 'reading' exists
      } catch (err) {
        console.error("Failed to generate reading:", err);
        setLoadingText("The stars are clouded. Please try again.");
      }
    } else {
      // REGULAR USER: Redirect to Payment
      setLoadingText("Redirecting to Secure Payment...");
      setTimeout(() => {
        window.location.href = STRIPE_CHECKOUT_LINK;
      }, 1200);
    }
  };

  // Global Audio Logic
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize Audio
    const audio = new Audio('/audio/ethereal_ambience.mp3');
    audio.loop = true;
    audio.volume = 0.2;
    audioRef.current = audio;

    // Unlock audio on first global interaction
    // We only actually PLAY if the step logic allows it, but we need to unlock the audio context.
    const enableAudio = () => {
      // Just by interacting, the browser often unlocks the context for this specific audio element if we touch it.
      // But we will let the step-based effect handle the .play() call.
      // We just remove listeners here.

      document.removeEventListener('click', enableAudio);
      document.removeEventListener('touchstart', enableAudio);
      document.removeEventListener('keydown', enableAudio);
    };

    document.addEventListener('click', enableAudio);
    document.addEventListener('touchstart', enableAudio);
    document.addEventListener('keydown', enableAudio);

    return () => {
      audio.pause();
      audio.src = '';
      document.removeEventListener('click', enableAudio);
      document.removeEventListener('touchstart', enableAudio);
      document.removeEventListener('keydown', enableAudio);
    };
  }, []);

  // Control Playback based on Step & Mute State
  useEffect(() => {
    if (!audioRef.current) return;

    if (step === AppStep.LANDING) {
      audioRef.current.pause();
    } else {
      // If we are NOT on landing, follow isMuted state
      if (!isMuted) {
        // Try to play. If browser blocks it (no interaction yet), it will catch.
        audioRef.current.play().catch(e => {
          // Expected if user hasn't interacted yet.
          // The enableAudio listener above handles the "first click" unlock implicitly 
          // because once they click, we can play. 
          // Actually, if this fails, we might want to try again on interaction.
          // But let's assume the user clicked "Start" to get here, so interaction IS guaranteed.
          console.log("Playback prevented:", e);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [step, isMuted]);

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

  const progressPercentage = ((currentIntakeStep + 1) / 7) * 100;

  return (
    <div className="min-h-screen flex flex-col selection:bg-indigo-500/30 relative">
      <nav className="border-b border-indigo-900/50 bg-black/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 md:py-4 flex justify-between items-center">
          <h1 className="text-lg md:text-xl font-serif-mystic text-indigo-100 tracking-widest flex items-center gap-2 cursor-pointer" onClick={() => window.location.href = window.location.pathname}>
            <i className="fas fa-moon text-yellow-500"></i> WANDA
          </h1>
          <div className="flex items-center gap-4">

            {/* Global Mute Toggle - Hidden on Landing Page */}
            {step !== AppStep.LANDING && (
              <button
                onClick={toggleAudio}
                className="w-8 h-8 rounded-full bg-indigo-900/40 border border-yellow-500/30 text-yellow-500 flex items-center justify-center hover:bg-indigo-900/60 transition-all text-xs mr-2"
                title={isMuted ? "Unmute Ambient Sound" : "Mute Ambient Sound"}
              >
                <i className={`fas ${isMuted ? 'fa-volume-mute' : 'fa-volume-up'}`}></i>
              </button>
            )}

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
          <LandingPage
            heroContent={heroContent}
            reviews={reviews}
            isLoading={isLocalizing}
            onStart={handleStart}
            isExiting={isTransitioning}
          />
        )}

        {step === AppStep.INTAKE && (
          <IntakeFlow
            userData={userData}
            setUserData={setUserData}
            onComplete={handleIntakeComplete}
            onBack={() => setStep(AppStep.LANDING)}
            intakeContent={intakeContent}
            reviews={reviews}
            isLoading={isLocalizing}
            onStepChange={handleStepChange}
            initialStep={currentIntakeStep}
          />
        )}

        {step === AppStep.PAYMENT_CONFIRMED && (
          <PaymentConfirmedPage userData={userData} />
        )}

        {step === AppStep.PROCESSING && (
          /* Note: Using ReadingRevealPage for PROCESSING step logic as per original structure, 
             though strictly speaking PROCESSING usually implies a loader. 
             The original code rendered the result immediately if data was available. 
             Since we redirect to Stripe now, this state is mostly for the redirect message 
             OR if there's a legacy flow where result is shown. 
             Currently, handleIntakeComplete sets PROCESSING then redirects. 
             So this might just show the "Redirecting..." text or the result if logic changes.
             
             Wait, the original code had:
             step === AppStep.PROCESSING && ( ... Render ReviewSection + Results ... )
             
             Let's check logic:
             finalizeIntake -> setStep(PROCESSING) -> set timeout -> redirect.
             So typically user sees PROCESSING for 1.2s.
             BUT, logic also allowed showing results if reading was set.
             
             For now, let's keep ReadingRevealPage here, but maybe wrapped or handled carefully.
          */
          <div className="flex-grow flex flex-col items-center justify-center min-h-[50vh]">
            {/* If we are just redirecting, maybe specific simple loader? */}
            {!reading && (
              <div className="text-center space-y-4">
                <div className="animate-spin text-yellow-500 text-4xl"><i className="fas fa-circle-notch"></i></div>
                <p className="text-indigo-200 font-serif-mystic text-xl animate-pulse">{loadingText}</p>
              </div>
            )}

            {/* If we strictly want to support the View Result flow (e.g. for testing/legacy), we render ReadingRevealPage */}
            {reading && (
              <ReadingRevealPage
                userData={userData}
                reviews={reviews}
                isLoading={isLocalizing}
                reading={reading}
                fullReading={fullReading}
              />
            )}
          </div>
        )}
      </main>

      <footer className="border-t border-indigo-900/50 py-10 md:py-16 bg-black/60">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-8 md:w-16 bg-indigo-900"></div>
            <h4 className="font-serif-mystic text-indigo-100 tracking-[0.4em] uppercase text-lg md:text-xl">WANDA</h4>
            <div className="h-px w-8 md:w-16 bg-indigo-900"></div>
          </div>
          <p className="text-[9px] md:text-[10px] text-indigo-700 uppercase tracking-[0.3em] font-medium">&copy; 2026 Ethereal Insights by Wanda. Secure SSL Encryption Active.</p>
          <p className="text-[9px] md:text-[10px] text-indigo-700 uppercase tracking-[0.3em] font-medium mt-2 hover:text-indigo-400 transition-colors cursor-pointer"><a href="mailto:info@wandareadings.com">info@wandareadings.com</a></p>
        </div>
      </footer>
    </div>
  );
};

export default App;
