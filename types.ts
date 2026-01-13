
export enum AppStep {
  LANDING = 'LANDING',
  INTAKE = 'INTAKE',
  PROCESSING = 'PROCESSING',
  REVEAL = 'REVEAL',
  CHECKOUT = 'CHECKOUT',
  PAYMENT_CONFIRMED = 'PAYMENT_CONFIRMED',
  SUCCESS = 'SUCCESS'
}

export interface UserData {
  name: string;
  birthDate: string;
  partnerName?: string;
  partnerBirthDate?: string;
  question: string;
  readingType: string;
}

export interface Review {
  id: number;
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
