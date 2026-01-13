
import { GoogleGenAI, Type } from "@google/genai";
import { UserData, ReadingResponse, Review } from "../types";

const getAI = () => {
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("Gemini API Key is missing - running in fallback mode");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export interface LocalizedContent {
  reviews: Review[];
  hero: {
    title: string;
    subtitle: string;
    cta: string;
  };
  intake: {
    greeting: string;
    whatYouReceive: string;
    instructions: string;
    footer: string;
  };
}

export interface FullReadingContent {
  intro: string;
  auraAnalysis: string;
  vision: string;
  guidance: string;
  closing: string;
}

export const getInitialReading = async (userData: UserData): Promise<ReadingResponse> => {
  try {
    const partnerContext = userData.partnerName
      ? `They are also asking about their connection with ${userData.partnerName} (Born: ${userData.partnerBirthDate}).`
      : "";

    const ai = getAI();
    if (!ai) throw new Error("AI not initialized");

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are Wanda, a world-class spiritual intuitive and psychic. 
      The user is seeking a reading about: ${userData.readingType}. 
      User Name: ${userData.name}, Born: ${userData.birthDate}.
      ${partnerContext}
      User Question: "${userData.question}"
      
      Instructions:
      1. Analyze the spiritual vibration of their question and connection.
      2. Provide a mysterious yet comforting 2-sentence "initial vision" or "teaser".
      3. Provide a 1-sentence description of their "Energy Signature" based on the names/energies provided.
      4. DO NOT give the full answer. Be slightly cryptic to encourage them to proceed to the full reading.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            teaser: {
              type: Type.STRING,
              description: 'The cryptic psychic teaser.',
            },
            energySignature: {
              type: Type.STRING,
              description: 'A description of their energetic frequency.',
            },
          },
          required: ["teaser", "energySignature"],
        },
      },
    });

    const result = JSON.parse(response.text);
    return result as ReadingResponse;
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      teaser: "The cards are swirling with a deep indigo light, suggesting a secret soon to be revealed in your heart.",
      energySignature: "A radiant, shimmering aura of anticipation and growth."
    };
  }
};

export const getFullReading = async (userData: UserData): Promise<FullReadingContent> => {
  try {
    const partnerContext = userData.partnerName
      ? `Their partner: ${userData.partnerName} (Born: ${userData.partnerBirthDate}).`
      : "No specific partner mentioned.";

    const ai = getAI();
    if (!ai) throw new Error("AI not initialized");

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `You are Wanda, providing the FULL PAID PSYCHIC READING for:
      Seeker: ${userData.name} (Born: ${userData.birthDate})
      Reading Type: ${userData.readingType}
      Question: "${userData.question}"
      ${partnerContext}

      Provide a deep, 5-section spiritual report. Be compassionate, specific, and soulful.
      The report must be structured for the "Soul Portal".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            intro: { type: Type.STRING, description: "A warm, personalized opening." },
            auraAnalysis: { type: Type.STRING, description: "Deep analysis of their energy fields." },
            vision: { type: Type.STRING, description: "The core psychic visions and messages from spirit." },
            guidance: { type: Type.STRING, description: "Direct advice and next steps." },
            closing: { type: Type.STRING, description: "A final blessing." }
          },
          required: ["intro", "auraAnalysis", "vision", "guidance", "closing"]
        },
      },
    });

    return JSON.parse(response.text) as FullReadingContent;
  } catch (error) {
    console.error("Full Reading Error:", error);
    return {
      intro: "Welcome to your sanctuary, dear soul. I have spent time in meditation over your energy.",
      auraAnalysis: "Your aura pulses with a resilient golden hue, though I detect shadows near the heart chakra that seek release.",
      vision: "I see a bridge forming between two shores. One is your past, the other a future where a specific conversation changes everything.",
      guidance: "Wait for the moon to be at its peak before making your move. Trust the silence between words.",
      closing: "Go in peace, for the ancestors walk beside you."
    };
  }
};

export const localizeExperience = async (
  reviews: Review[],
  latitude: number | null,
  longitude: number | null
): Promise<LocalizedContent> => {
  const browserLocale = Intl.DateTimeFormat().resolvedOptions().locale;
  const locationInfo = latitude && longitude ? `Coordinates: ${latitude}, ${longitude}` : `Browser Locale: ${browserLocale}`;

  const wandaIntroText = `
    Hi there! I’m Wanda, a seasoned psychic medium and spellcaster with years of experience offering deep, soulful insight into love and relationships. Whether you're dealing with a breakup, a complicated connection, or want to know what’s ahead in love, this reading is for you. This love reading is detailed, compassionate, and always honest. I tune into your energy and the person you’re asking about (if any), and deliver intuitive messages that come through from Spirit, my guides, and your energy field.
    ✨ What you’ll receive: A written psychic reading, real grounded insight into your romantic situation, answers to your most pressing love questions, a gentle yet clear look into how the other person is feeling, what’s blocking the connection, and what may come next.
    💌 Once you begin: Please provide your full name & birthdate, their full name & birthdate (if applicable), and a short description of your situation.
    🌙 This is not a generic reading. Every message is personally channeled for you, with love, focus, and clarity. You deserve answers, and I’m honored to bring them through for you.
  `;

  try {
    const ai = getAI();
    if (!ai) throw new Error("AI not initialized");

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are localizing a psychic service app into the primary language of: ${locationInfo}. 
      
      Tasks:
      1. Translate the reviews (originally in Dutch) into the local primary language.
      2. Translate the Hero text (Love Destiny theme).
      3. Translate Wanda's detailed service description (the "Intake Intro") into a warm, professional, spiritual tone in the target language.
      
      Intake Intro to translate: ${wandaIntroText}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reviews: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.NUMBER },
                  user: { type: Type.STRING },
                  rating: { type: Type.NUMBER },
                  date: { type: Type.STRING },
                  comment: { type: Type.STRING },
                  avatar: { type: Type.STRING }
                },
                required: ["id", "user", "comment"]
              }
            },
            hero: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                subtitle: { type: Type.STRING },
                cta: { type: Type.STRING }
              },
              required: ["title", "subtitle", "cta"]
            },
            intake: {
              type: Type.OBJECT,
              properties: {
                greeting: { type: Type.STRING, description: "Wanda's warm intro greeting" },
                whatYouReceive: { type: Type.STRING, description: "The list of benefits" },
                instructions: { type: Type.STRING, description: "Data requirements" },
                footer: { type: Type.STRING, description: "Closing spiritual sentiment" }
              },
              required: ["greeting", "whatYouReceive", "instructions", "footer"]
            }
          },
          required: ["reviews", "hero", "intake"]
        },
      },
    });

    return JSON.parse(response.text) as LocalizedContent;
  } catch (error) {
    console.error("Localization Error:", error);
    return {
      reviews,
      hero: {
        title: "Discover Your Destiny in Love",
        subtitle: "Receive a deep-dive psychic reading from Wanda, an expert in twin flames, soul connections, and spiritual clarity.",
        cta: "START YOUR INQUIRY"
      },
      intake: {
        greeting: "Hi there! I’m Wanda, a seasoned psychic medium...",
        whatYouReceive: "✨ What you’ll receive: Real, grounded insight into your romantic situation...",
        instructions: "💌 To begin, please provide details for your energy field...",
        footer: "🌙 This is not a generic reading. Every message is personally channeled for you."
      }
    };
  }
};
