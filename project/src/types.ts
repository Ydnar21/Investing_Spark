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

export interface StockSearchResult {
  symbol: string;
  name: string;
  type: string;
  region: string;
  currency: string;
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
    strength: number;
    description: string;
  };
  fundamentals: {
    valueMetric: number;
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
  email: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: string | null;
}

export interface UserPortfolio {
  username: string;
  stocks: PortfolioStock[];
}

export type HistoricalDataRange = '1W' | '1M' | '3M' | '6M' | '1Y' | '5Y' | 'ALL';