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
}

export interface PortfolioStock {
  symbol: string;
  shares: number;
  averagePrice: number;
  stats: StockStats;
}

export interface PortfolioAnalysis {
  sectorAllocation: { [sector: string]: number };
  topSectors: string[];
  underrepresentedSectors: string[];
  recommendations: StockRecommendation[];
}

export interface StockRecommendation {
  symbol: string;
  reason: string;
  stats: StockStats;
}