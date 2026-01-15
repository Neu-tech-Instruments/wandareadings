
export enum AppStep {
  LANDING = 'LANDING',
  PICK_A_CARD = 'PICK_A_CARD',
  INTAKE = 'INTAKE',
  PROCESSING = 'PROCESSING',
  REVEAL = 'REVEAL',
  PAYMENT_CONFIRMED = 'PAYMENT_CONFIRMED'
}

export enum IntakeSubStep {
  NAME,
  BIRTHDATE,
  CATEGORY,
  SUB_PATH,
  PARTNER_QUERY,
  PARTNER_DETAILS,
  SITUATION,
  EMAIL,
  DELIVERY_INFO,
  SUCCESS = 'SUCCESS'
}

export interface UserData {
  name: string;
  birthDate: string;
  partnerName?: string;
  partnerBirthDate?: string;
  question: string;
  email: string;
  readingType: string;
  readingCategory?: 'Love' | 'Career' | 'General' | 'CardPile';
  careerStatus?: string;
  cardPile?: string;
}

export interface Review {
  id: number | string;
  user: string;
  rating: number;
  date: string;
  comment: string;
  avatar: string;
}

export interface ReadingResponse {
  teaser: string;
  energySignature: string;
}
