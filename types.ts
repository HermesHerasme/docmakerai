
export enum PlanType {
  FREE = 'FREE',
  PREMIUM = 'PREMIUM',
  PRO = 'PRO'
}

export interface User {
  id: string;
  email: string;
  name: string;
  plan: PlanType;
  generationsUsedToday: number;
  generationsUsedMonth: number;
}

export interface GeneratedDocument {
  id: string;
  title: string;
  contentHtml: string;
  styles: string;
  createdAt: string;
  prompt: string;
  isHumanized: boolean;
}

export interface PlanConfig {
  id: PlanType;
  name: string;
  price: string;
  generationsLabel: string;
  features: string[];
  canHumanize: boolean;
  canAccessHistory: boolean;
  maxDaily?: number;
  maxMonthly?: number;
  maxPages: number;
  hasWatermark: boolean;
}
