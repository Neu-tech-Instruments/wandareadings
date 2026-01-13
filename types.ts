
export enum AppStep {
  LANDING = 'LANDING',
  INTAKE = 'INTAKE',
  PROCESSING = 'PROCESSING',
  REVEAL = 'REVEAL',
  PAYMENT_CONFIRMED = 'PAYMENT_CONFIRMED'
}

export enum IntakeSubStep {
  NAME,
  BIRTHDATE,
  PATH,
  PARTNER_QUERY,
  PARTNER_DETAILS,
  SITUATION,
  DELIVERY_INFO,
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
