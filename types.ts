import { translations } from './translations';

export enum Tab {
  CropDoctor = 'CropDoctor',
  MarketPrices = 'MarketPrices',
  GovtSchemes = 'GovtSchemes',
  Weather = 'Weather',
}

export type View = Tab | 'Dashboard';

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface FertilizerRecommendation {
  name: string;
  description: string;
  price: string; // e.g., '₹500 per 50kg bag'
}

export interface DiagnosisResult {
  diseaseName: string;
  description: string;
  symptoms: string[];
  remedies: {
    organic: string[];
    chemical: string[];
  };
  fertilizers?: FertilizerRecommendation[];
  error?: string;
}

export interface WeatherData {
  location: string;
  current: {
    temp_c: number;
    condition: string;
    humidity: number;
    wind_kph: number;
  };
  forecast: {
    day: string;
    high_c: number;
    low_c: number;
    condition: string;
  }[];
  error?: string;
}

export type TFunction = typeof translations['en'];