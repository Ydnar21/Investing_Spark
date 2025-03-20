import { PortfolioStock, PortfolioAnalysis, StockStats, StockAnalytics } from '../types';

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
  // In a real application, these would be calculated based on actual market data
  const peRatio = stock.peRatio || Math.random() * 30 + 10;
  const beta = stock.beta || Math.random() * 2;
  const marketTrend = Math.random() > 0.5 ? 'bullish' : 'bearish';
  
  return {
    technicalSignals: {
      trend: marketTrend,
      strength: Math.floor(Math.random() * 40 + 60), // Biased towards stronger signals
      description: `${marketTrend === 'bullish' ? 'Strong upward' : 'Downward'} momentum with increasing volume. Moving averages indicate potential ${marketTrend === 'bullish' ? 'continuation' : 'reversal'}.`
    },
    fundamentals: {
      valueMetric: Math.floor(Math.random() * 30 + 70), // Biased towards good value
      description: `P/E ratio of ${peRatio.toFixed(2)} is ${peRatio < 20 ? 'below' : 'above'} industry average. ${
        stock.dividendYield ? `Attractive dividend yield of ${stock.dividendYield}%.` : 'Strong earnings growth potential.'
      }`
    },
    riskMetrics: {
      riskLevel: beta < 1 ? 'low' : beta < 1.5 ? 'moderate' : 'high',
      description: `Beta of ${beta.toFixed(2)} indicates ${
        beta < 1 ? 'lower' : beta < 1.5 ? 'moderate' : 'higher'
      } volatility compared to the market. ${
        beta < 1 ? 'Suitable for conservative portfolios.' : 
        beta < 1.5 ? 'Balanced risk-reward profile.' : 
        'Higher potential returns with increased risk.'
      }`
    }
  };
};

const MOCK_RECOMMENDATIONS: { [sector: string]: StockStats[] } = {
  'Technology': [
    { 
      symbol: 'NVDA',
      price: 789.45,
      change: 12.5,
      changePercent: 1.61,
      volume: 23456789,
      high52Week: 800.12,
      low52Week: 400.23,
      sector: 'Technology',
      industry: 'Semiconductors',
      peRatio: 34.5,
      dividendYield: 0.08,
      marketCap: 1950000000000,
      beta: 1.8
    },
    {
      symbol: 'AMD',
      price: 178.23,
      change: 5.67,
      changePercent: 3.29,
      volume: 45678912,
      high52Week: 185.45,
      low52Week: 95.67,
      sector: 'Technology',
      industry: 'Semiconductors',
      peRatio: 28.9,
      dividendYield: 0,
      marketCap: 287000000000,
      beta: 1.65
    }
  ],
  'Healthcare': [
    {
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
    {
      symbol: 'UNH',
      price: 478.90,
      change: 3.45,
      changePercent: 0.73,
      volume: 2345678,
      high52Week: 490.12,
      low52Week: 420.56,
      sector: 'Healthcare',
      industry: 'Healthcare Plans',
      peRatio: 22.1,
      dividendYield: 1.45,
      marketCap: 445000000000,
      beta: 0.92
    }
  ],
  'Financial Services': [
    {
      symbol: 'V',
      price: 267.89,
      change: 2.34,
      changePercent: 0.88,
      volume: 6789123,
      high52Week: 275.45,
      low52Week: 220.34,
      sector: 'Financial Services',
      industry: 'Credit Services',
      peRatio: 31.2,
      dividendYield: 0.75,
      marketCap: 545000000000,
      beta: 1.1
    },
    {
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
    }
  ]
};

export const analyzePortfolio = (portfolio: PortfolioStock[]): PortfolioAnalysis => {
  const totalValue = portfolio.reduce((sum, stock) => sum + (stock.shares * stock.stats.price), 0);

  const sectorAllocation: { [sector: string]: number } = {};
  portfolio.forEach(stock => {
    const sector = stock.stats.sector || 'Unknown';
    const stockValue = stock.shares * stock.stats.price;
    sectorAllocation[sector] = (sectorAllocation[sector] || 0) + (stockValue / totalValue * 100);
  });

  const underrepresentedSectors = SECTORS.filter(
    sector => !sectorAllocation[sector] || sectorAllocation[sector] < 5
  );

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
  const recommendations = [];
  const existingSymbols = new Set(portfolio.map(stock => stock.symbol));

  for (const sector of underrepresentedSectors.slice(0, 2)) {
    if (MOCK_RECOMMENDATIONS[sector]) {
      const recommendation = MOCK_RECOMMENDATIONS[sector].find(stock => !existingSymbols.has(stock.symbol));
      if (recommendation) {
        recommendations.push({
          symbol: recommendation.symbol,
          reason: `Adds exposure to the underrepresented ${sector} sector`,
          stats: recommendation,
          analytics: generateStockAnalytics(recommendation)
        });
      }
    }
  }

  return recommendations;
};