export interface StockData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockStats {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high52Week: number;
  low52Week: number;
  sector?: string;
  industry?: string;
  peRatio?: number;
  dividendYield?: number;
  marketCap?: number;
  beta?: number;
}

export interface PortfolioStock {
  symbol: string;
  shares: number;
  averagePrice: number;
  stats: StockStats;
}

export interface StockAnalytics {
  technicalSignals: {
    trend: 'bullish' | 'bearish' | 'neutral';
    strength: number; // 0-100
    description: string;
  };
  fundamentals: {
    valueMetric: number; // 0-100
    description: string;
  };
  riskMetrics: {
    riskLevel: 'low' | 'moderate' | 'high';
    description: string;
  };
}

export interface StockRecommendation {
  symbol: string;
  reason: string;
  stats: StockStats;
  analytics: StockAnalytics;
}

export interface PortfolioAnalysis {
  sectorAllocation: { [sector: string]: number };
  topSectors: string[];
  underrepresentedSectors: string[];
  recommendations: StockRecommendation[];
}

export interface User {
  username: string;
  password: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: string | null;
}