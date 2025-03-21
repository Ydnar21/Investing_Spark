import axios from 'axios';
import { format, subDays, subYears } from 'date-fns';
import * as cheerio from 'cheerio';
import { StockStats, HistoricalDataRange, StockSearchResult } from '../types';

const ALPHA_VANTAGE_API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY;
const BASE_URL = 'https://www.alphavantage.co/query';

async function scrapeStockData(symbol: string): Promise<Partial<StockStats>> {
  try {
    // Yahoo Finance for real-time data
    const response = await axios.get(`https://finance.yahoo.com/quote/${symbol}`);
    const $ = cheerio.load(response.data);
    
    const price = parseFloat($('[data-field="regularMarketPrice"]').first().text().replace(/[^0-9.-]/g, ''));
    const change = parseFloat($('[data-field="regularMarketChange"]').first().text().replace(/[^0-9.-]/g, ''));
    const changePercent = parseFloat($('[data-field="regularMarketChangePercent"]').first().text().replace(/[^0-9.-]/g, ''));
    const volume = parseInt($('[data-field="regularMarketVolume"]').first().text().replace(/[^0-9]/g, ''));
    
    // Get sector and industry from the profile page
    const profileResponse = await axios.get(`https://finance.yahoo.com/quote/${symbol}/profile`);
    const $profile = cheerio.load(profileResponse.data);
    
    const sector = $profile('span:contains("Sector")').next().text().trim();
    const industry = $profile('span:contains("Industry")').next().text().trim();
    
    // Get additional stats
    const statsResponse = await axios.get(`https://finance.yahoo.com/quote/${symbol}/key-statistics`);
    const $stats = cheerio.load(statsResponse.data);
    
    const beta = parseFloat($stats('td:contains("Beta")').next().text());
    const peRatio = parseFloat($stats('td:contains("PE Ratio")').next().text());
    const dividendYield = parseFloat($stats('td:contains("Forward Dividend & Yield")').next().text().split(' ')[1].replace(/[^0-9.]/g, ''));
    const marketCap = parseFloat($stats('td:contains("Market Cap")').next().text().replace(/[^0-9.]/g, '')) * 1e9;
    
    return {
      price,
      change,
      changePercent,
      volume,
      sector,
      industry,
      beta,
      peRatio,
      dividendYield,
      marketCap
    };
  } catch (error) {
    console.error('Error scraping stock data:', error);
    return {};
  }
}

export async function searchStocks(query: string): Promise<StockSearchResult[]> {
  try {
    const response = await axios.get(
      `${BASE_URL}?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(query)}&apikey=${ALPHA_VANTAGE_API_KEY}`
    );

    if (response.data.Note) {
      throw new Error('API rate limit reached. Please try again in a minute.');
    }

    const matches = response.data.bestMatches || [];
    return matches.map((match: any) => ({
      symbol: match['1. symbol'],
      name: match['2. name'],
      type: match['3. type'],
      region: match['4. region'],
      currency: match['8. currency'],
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

    // Get real-time data from web scraping
    const scrapedData = await scrapeStockData(symbol);
    
    // Get historical high/low from Alpha Vantage
    const response = await axios.get(
      `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
    );

    const quote = response.data['Global Quote'];
    
    if (!quote || Object.keys(quote).length === 0) {
      throw new Error(`No data found for symbol ${symbol}`);
    }

    return {
      symbol,
      price: scrapedData.price || parseFloat(quote['05. price']) || 0,
      change: scrapedData.change || parseFloat(quote['09. change']) || 0,
      changePercent: scrapedData.changePercent || parseFloat(quote['10. change percent']?.replace('%', '')) || 0,
      volume: scrapedData.volume || parseInt(quote['06. volume']) || 0,
      high52Week: parseFloat(quote['03. high']) || 0,
      low52Week: parseFloat(quote['04. low']) || 0,
      sector: scrapedData.sector || 'Unknown',
      industry: scrapedData.industry || 'Unknown',
      peRatio: scrapedData.peRatio,
      dividendYield: scrapedData.dividendYield,
      marketCap: scrapedData.marketCap,
      beta: scrapedData.beta
    };
  } catch (error) {
    console.error('Error fetching stock data:', error);
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

    let interval = '30min';
    if (['1Y', '5Y', 'ALL'].includes(range)) {
      interval = 'daily';
    } else if (['3M', '6M'].includes(range)) {
      interval = 'daily';
    }

    const response = await axios.get(
      `${BASE_URL}?function=TIME_SERIES_${interval === 'daily' ? 'DAILY' : 'INTRADAY'}&symbol=${symbol}${
        interval !== 'daily' ? `&interval=${interval}` : ''
      }&outputsize=full&apikey=${ALPHA_VANTAGE_API_KEY}`
    );

    if (response.data.Note) {
      throw new Error('API rate limit reached. Please try again in a minute.');
    }

    const timeSeriesKey = Object.keys(response.data).find(key => key.includes('Time Series'));
    if (!timeSeriesKey || !response.data[timeSeriesKey] || Object.keys(response.data[timeSeriesKey]).length === 0) {
      throw new Error(`No historical data found for symbol ${symbol}`);
    }

    const timeSeries = response.data[timeSeriesKey];
    const { start, end } = getDateRange(range);

    return Object.entries(timeSeries)
      .filter(([date]) => {
        const timestamp = new Date(date).getTime();
        return timestamp >= start.getTime() && timestamp <= end.getTime();
      })
      .map(([date, values]: [string, any]) => ({
        time: format(new Date(date), 'yyyy-MM-dd'),
        value: parseFloat(values['4. close']) || 0
      }))
      .reverse();
  } catch (error) {
    console.error('Error fetching historical data:', error);
    throw new Error('Failed to fetch historical data. Please try again.');
  }
}

function getDateRange(range: HistoricalDataRange): { start: Date; end: Date } {
  const end = new Date();
  let start: Date;

  switch (range) {
    case '1W':
      start = subDays(end, 7);
      break;
    case '1M':
      start = subDays(end, 30);
      break;
    case '3M':
      start = subDays(end, 90);
      break;
    case '6M':
      start = subDays(end, 180);
      break;
    case '1Y':
      start = subYears(end, 1);
      break;
    case '5Y':
      start = subYears(end, 5);
      break;
    case 'ALL':
      start = subYears(end, 30);
      break;
    default:
      start = subDays(end, 7);
  }

  return { start, end };
}