import { PortfolioStock, PortfolioAnalysis, StockStats } from '../types';

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

const MOCK_RECOMMENDATIONS: { [sector: string]: StockStats[] } = {
  'Technology': [
    { symbol: 'NVDA', price: 789.45, change: 12.5, changePercent: 1.61, volume: 23456789, high52Week: 800.12, low52Week: 400.23, sector: 'Technology', industry: 'Semiconductors' },
    { symbol: 'AMD', price: 178.23, change: 5.67, changePercent: 3.29, volume: 45678912, high52Week: 185.45, low52Week: 95.67, sector: 'Technology', industry: 'Semiconductors' }
  ],
  'Healthcare': [
    { symbol: 'JNJ', price: 156.78, change: 1.23, changePercent: 0.79, volume: 5678912, high52Week: 165.34, low52Week: 140.23, sector: 'Healthcare', industry: 'Drug Manufacturers' },
    { symbol: 'UNH', price: 478.90, change: 3.45, changePercent: 0.73, volume: 2345678, high52Week: 490.12, low52Week: 420.56, sector: 'Healthcare', industry: 'Healthcare Plans' }
  ],
  'Financial Services': [
    { symbol: 'V', price: 267.89, change: 2.34, changePercent: 0.88, volume: 6789123, high52Week: 275.45, low52Week: 220.34, sector: 'Financial Services', industry: 'Credit Services' },
    { symbol: 'JPM', price: 189.45, change: 1.56, changePercent: 0.83, volume: 8901234, high52Week: 195.67, low52Week: 150.23, sector: 'Financial Services', industry: 'Banks' }
  ]
};

export const analyzePortfolio = (portfolio: PortfolioStock[]): PortfolioAnalysis => {
  // Calculate total portfolio value
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
  const recommendations = [];
  const existingSymbols = new Set(portfolio.map(stock => stock.symbol));

  // Recommend stocks from underrepresented sectors
  for (const sector of underrepresentedSectors.slice(0, 2)) {
    if (MOCK_RECOMMENDATIONS[sector]) {
      const recommendation = MOCK_RECOMMENDATIONS[sector].find(stock => !existingSymbols.has(stock.symbol));
      if (recommendation) {
        recommendations.push({
          symbol: recommendation.symbol,
          reason: `Adds exposure to the underrepresented ${sector} sector`,
          stats: recommendation
        });
      }
    }
  }

  return recommendations;
};