import { PortfolioStock, PortfolioAnalysis, StockStats, StockAnalytics } from '../types';

// Use the same mock data structure as stockData.ts
const MOCK_STOCKS: { [symbol: string]: StockStats } = {
  'AAPL': {
    symbol: 'AAPL',
    price: 175.43,
    change: 2.15,
    changePercent: 1.24,
    volume: 55876543,
    high52Week: 198.23,
    low52Week: 124.17,
    sector: 'Technology',
    industry: 'Consumer Electronics',
    peRatio: 28.5,
    dividendYield: 0.65,
    marketCap: 2750000000000,
    beta: 1.2
  },
  'MSFT': {
    symbol: 'MSFT',
    price: 378.85,
    change: 4.23,
    changePercent: 1.13,
    volume: 34567890,
    high52Week: 390.45,
    low52Week: 275.89,
    sector: 'Technology',
    industry: 'Software',
    peRatio: 32.4,
    dividendYield: 0.82,
    marketCap: 2850000000000,
    beta: 1.1
  },
  'JNJ': {
    symbol: 'JNJ',
    price: 156.78,
    change: 1.23,
    changePercent: 0.79,
    volume: 5678912,
    high52Week: 165.34,
    low52Week: 140.23,
    sector: 'Healthcare',
    industry: 'Drug Manufacturers',
    peRatio: 15.4,
    dividendYield: 3.02,
    marketCap: 380000000000,
    beta: 0.75
  },
  'JPM': {
    symbol: 'JPM',
    price: 189.45,
    change: 1.56,
    changePercent: 0.83,
    volume: 8901234,
    high52Week: 195.67,
    low52Week: 150.23,
    sector: 'Financial Services',
    industry: 'Banks',
    peRatio: 11.8,
    dividendYield: 2.45,
    marketCap: 550000000000,
    beta: 1.25
  },
  'PG': {
    symbol: 'PG',
    price: 156.89,
    change: 0.78,
    changePercent: 0.50,
    volume: 4567890,
    high52Week: 162.45,
    low52Week: 135.67,
    sector: 'Consumer Defensive',
    industry: 'Household Products',
    peRatio: 24.6,
    dividendYield: 2.35,
    marketCap: 370000000000,
    beta: 0.45
  }
};

const SECTORS = [
  'Technology',
  'Healthcare',
  'Financial Services',
  'Consumer Cyclical',
  'Industrials',
  'Consumer Defensive',
  'Energy',
  'Basic Materials',
  'Real Estate',
  'Utilities',
  'Communication Services'
];

const generateStockAnalytics = (stock: StockStats): StockAnalytics => {
  const marketTrend = stock.change >= 0 ? 'bullish' : 'bearish';
  const strength = stock.changePercent * 10;
  
  return {
    technicalSignals: {
      trend: marketTrend,
      strength: Math.min(Math.abs(strength) + 60, 100), // Ensure strength is between 0-100
      description: `${marketTrend === 'bullish' ? 'Strong upward' : 'Downward'} momentum with ${
        stock.volume.toLocaleString()
      } volume. ${stock.beta < 1 ? 'Lower' : 'Higher'} volatility than market average.`
    },
    fundamentals: {
      valueMetric: Math.min((stock.peRatio ? 25 / stock.peRatio : 0.5) * 100, 100),
      description: `P/E ratio of ${stock.peRatio?.toFixed(2)} ${
        stock.peRatio && stock.peRatio < 20 ? 'suggests good value' : 'is above industry average'
      }. ${
        stock.dividendYield 
          ? `Attractive dividend yield of ${stock.dividendYield}%.` 
          : 'Focus on growth over dividends.'
      }`
    },
    riskMetrics: {
      riskLevel: stock.beta < 1 ? 'low' : stock.beta < 1.5 ? 'moderate' : 'high',
      description: `Beta of ${stock.beta?.toFixed(2)} indicates ${
        stock.beta < 1 ? 'lower' : stock.beta < 1.5 ? 'moderate' : 'higher'
      } volatility compared to the market. ${
        stock.beta < 1 
          ? 'Suitable for conservative portfolios.' 
          : stock.beta < 1.5 
            ? 'Balanced risk-reward profile.' 
            : 'Higher potential returns with increased risk.'
      }`
    }
  };
};

export const analyzePortfolio = (portfolio: PortfolioStock[]): PortfolioAnalysis => {
  const totalValue = portfolio.reduce((sum, stock) => sum + (stock.shares * stock.stats.price), 0);

  // Calculate sector allocation
  const sectorAllocation: { [sector: string]: number } = {};
  portfolio.forEach(stock => {
    const sector = stock.stats.sector || 'Unknown';
    const stockValue = stock.shares * stock.stats.price;
    sectorAllocation[sector] = (sectorAllocation[sector] || 0) + (stockValue / totalValue * 100);
  });

  // Find underrepresented sectors
  const underrepresentedSectors = SECTORS.filter(
    sector => !sectorAllocation[sector] || sectorAllocation[sector] < 5
  );

  // Generate recommendations based on portfolio composition
  const recommendations = generateRecommendations(portfolio, underrepresentedSectors);

  return {
    sectorAllocation,
    topSectors: Object.entries(sectorAllocation)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([sector]) => sector),
    underrepresentedSectors,
    recommendations
  };
};

const generateRecommendations = (portfolio: PortfolioStock[], underrepresentedSectors: string[]) => {
  const existingSymbols = new Set(portfolio.map(stock => stock.symbol));
  const recommendations = [];

  // First, try to fill underrepresented sectors
  for (const sector of underrepresentedSectors.slice(0, 2)) {
    const sectorStock = Object.values(MOCK_STOCKS).find(
      stock => stock.sector === sector && !existingSymbols.has(stock.symbol)
    );
    
    if (sectorStock) {
      recommendations.push({
        symbol: sectorStock.symbol,
        reason: `Adds exposure to the underrepresented ${sector} sector`,
        stats: sectorStock,
        analytics: generateStockAnalytics(sectorStock)
      });
    }
  }

  // If we still need recommendations, add high-quality stocks from any sector
  while (recommendations.length < 2) {
    const remainingStocks = Object.values(MOCK_STOCKS).filter(
      stock => !existingSymbols.has(stock.symbol) && 
              !recommendations.some(rec => rec.symbol === stock.symbol)
    );

    if (remainingStocks.length === 0) break;

    const stock = remainingStocks[0];
    recommendations.push({
      symbol: stock.symbol,
      reason: `Strong fundamentals with ${stock.dividendYield ? 'attractive dividend yield' : 'growth potential'}`,
      stats: stock,
      analytics: generateStockAnalytics(stock)
    });
  }

  return recommendations;
};