
import React, { useState, useEffect } from 'react';
import { AppStep, UserData, ReadingResponse, Review, IntakeSubStep } from './types';
import { getInitialReading, localizeExperience, getFullReading, FullReadingContent } from './services/geminiService';
import { REVIEWS } from './src/data/reviews';
import { getDailyReviews } from './src/services/reviewRotator';

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
      const debugView = urlParams.get('view');

      if (paymentSuccess === 'true') {
        const savedData = localStorage.getItem('wanda_intake_data');
        if (savedData) {
          const parsed = JSON.parse(savedData);
          setUserData(parsed);
          setStep(AppStep.PAYMENT_CONFIRMED);
        }
      } else if (debugView) {
        // Debugging / Direct Navigation Routes
        switch (debugView.toLowerCase()) {
          case 'landing':
            setStep(AppStep.LANDING);
            break;
          case 'intake':
            setStep(AppStep.INTAKE);
            break;
          case 'success':
          case 'confirmed':
            setStep(AppStep.PAYMENT_CONFIRMED);
            // Ensure some dummy data exists so it doesn't crash
            if (!userData.name) setUserData({ ...userData, name: "Mystic Seeker", birthDate: "1990-01-01" });
            break;
          case 'reveal':
          case 'reading':
            // Reading Retrieval Flow (Magic Link)
            // Parse user data from URL params if available
            const name = urlParams.get('name');
            const birthDate = urlParams.get('dob');
            const partnerName = urlParams.get('partner');
            const partnerBirthDate = urlParams.get('partnerDob');
            const readingType = urlParams.get('type') || 'Love & Relationships';
            const question = urlParams.get('q') || '';

            if (name && birthDate) {
              const retrievedData: UserData = {
                name,
                birthDate,
                partnerName: partnerName || '',
                partnerBirthDate: partnerBirthDate || '',
                question,
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
              // Fallback if just ?view=reveal without params (Debug mode)
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

  const handleStart = () => setStep(AppStep.INTAKE);

  const handleIntakeComplete = () => {
    localStorage.setItem('wanda_intake_data', JSON.stringify(userData));
    setStep(AppStep.PROCESSING);
    setLoadingText("Redirecting to Secure Payment...");
    setTimeout(() => {
      window.location.href = STRIPE_CHECKOUT_LINK;
    }, 1200);
  };

  const progressPercentage = ((currentIntakeStep + 1) / 7) * 100;

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
          <LandingPage
            heroContent={heroContent}
            reviews={reviews}
            isLoading={isLocalizing}
            onStart={handleStart}
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
            onStepChange={setCurrentIntakeStep}
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
          <p className="text-[9px] md:text-[10px] text-indigo-700 uppercase tracking-[0.3em] font-medium">&copy; 2026 Ethereal Insights Global. Secure SSL Encryption Active.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
