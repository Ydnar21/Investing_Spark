import { format, subDays, subYears } from 'date-fns';
import { StockStats, HistoricalDataRange, StockSearchResult } from '../types';

const API_KEY = import.meta.env.VITE_POLYGON_API_KEY;
const BASE_URL = 'https://api.polygon.io';

export async function searchStocks(query: string): Promise<StockSearchResult[]> {
  try {
    const response = await fetch(
      `${BASE_URL}/v3/reference/tickers?market=stocks&active=true&order=asc&limit=100&sort=ticker&apiKey=${API_KEY}`,
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.results) {
      throw new Error('No results found');
    }

    // Filter results based on the query
    const filteredResults = data.results.filter(result => 
      result.ticker.includes(query.toUpperCase()) || 
      result.name?.toLowerCase().includes(query.toLowerCase())
    );

    return filteredResults.map((result: any) => ({
      symbol: result.ticker,
      name: result.name || result.ticker,
      type: result.type || 'Equity',
      region: result.market || 'US',
      currency: result.currency_name || 'USD'
    }));
  } catch (error) {
    console.error('Error searching stocks:', error);
    throw new Error('Failed to search stocks. Please try again.');
  }
}

export async function fetchStockData(symbol: string): Promise<StockStats> {
  try {
    if (!symbol.match(/^[A-Z]+$/)) {
      throw new Error('Invalid stock symbol. Please use uppercase letters only.');
    }

    // Get ticker details
    const tickerResponse = await fetch(
      `${BASE_URL}/v3/reference/tickers?ticker=${symbol}&market=stocks&active=true&apiKey=${API_KEY}`,
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    );

    if (!tickerResponse.ok) {
      throw new Error(`HTTP error! status: ${tickerResponse.status}`);
    }

    const tickerData = await tickerResponse.json();

    if (!tickerData.results || tickerData.results.length === 0) {
      throw new Error(`No data found for symbol ${symbol}`);
    }

    const tickerDetails = tickerData.results[0];

    // Get current price data
    const quoteResponse = await fetch(
      `${BASE_URL}/v2/last/trade/${symbol}?apiKey=${API_KEY}`,
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    );

    if (!quoteResponse.ok) {
      throw new Error(`HTTP error! status: ${quoteResponse.status}`);
    }

    const quoteData = await quoteResponse.json();

    if (!quoteData.results) {
      throw new Error(`No quote data available for ${symbol}`);
    }

    const currentPrice = quoteData.results.p;
    const previousClose = quoteData.results.p; // Using current price as previous close for simplicity

    const priceChange = 0; // We'll need additional API calls to calculate this accurately
    const priceChangePercent = 0;

    return {
      symbol: tickerDetails.ticker,
      price: currentPrice,
      change: priceChange,
      changePercent: priceChangePercent,
      volume: quoteData.results.s || 0,
      high52Week: currentPrice, // Would need additional API calls for accurate 52-week data
      low52Week: currentPrice,
      sector: tickerDetails.sic_description || 'Unknown',
      industry: tickerDetails.standard_industrial_classification || 'Unknown',
      peRatio: null,
      dividendYield: null,
      marketCap: tickerDetails.market_cap || null,
      beta: null
    };
  } catch (error) {
    console.error('Error fetching stock data:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to fetch stock data: ${error.message}`);
    }
    throw new Error('Failed to fetch stock data. Please try again.');
  }
}

export async function fetchHistoricalData(
  symbol: string,
  range: HistoricalDataRange = '1W'
): Promise<Array<{ time: string; value: number }>> {
  try {
    if (!symbol.match(/^[A-Z]+$/)) {
      throw new Error('Invalid stock symbol. Please use uppercase letters only.');
    }

    const to = new Date();
    let from: Date;

    switch (range) {
      case '1W':
        from = subDays(to, 7);
        break;
      case '1M':
        from = subDays(to, 30);
        break;
      case '3M':
        from = subDays(to, 90);
        break;
      case '6M':
        from = subDays(to, 180);
        break;
      case '1Y':
        from = subDays(to, 365);
        break;
      case '5Y':
        from = subYears(to, 5);
        break;
      case 'ALL':
        from = subYears(to, 20);
        break;
      default:
        from = subDays(to, 7);
    }

    const fromDate = format(from, 'yyyy-MM-dd');
    const toDate = format(to, 'yyyy-MM-dd');

    const response = await fetch(
      `${BASE_URL}/v2/aggs/ticker/${symbol}/range/1/day/${fromDate}/${toDate}?apiKey=${API_KEY}`,
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      throw new Error('No historical data available');
    }

    return data.results.map(day => ({
      time: format(new Date(day.t), 'yyyy-MM-dd'),
      value: day.c // closing price
    }));
  } catch (error) {
    console.error('Error fetching historical data:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to fetch historical data: ${error.message}`);
    }
    throw new Error('Failed to fetch historical data. Please try again.');
  }
}