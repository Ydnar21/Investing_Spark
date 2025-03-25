import React, { useState } from 'react';
import { Plus } from 'lucide-react';

interface AddStockFormProps {
  onAddStock: (symbol: string, shares: number, averagePrice: number) => Promise<boolean>;
}

const AddStockForm = ({ onAddStock }: AddStockFormProps) => {
  const [symbol, setSymbol] = useState('');
  const [shares, setShares] = useState('');
  const [averagePrice, setAveragePrice] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSymbolBlur = async () => {
    if (!symbol) return;
    
    try {
      const response = await fetch(
        `https://api.polygon.io/v3/reference/tickers?ticker=${symbol.toUpperCase()}&market=stocks&active=true&apiKey=${import.meta.env.VITE_POLYGON_API_KEY}`,
        {
          headers: {
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch stock data');
      }

      const data = await response.json();
      
      if (!data.results || data.results.length === 0) {
        setError('Invalid stock symbol');
        return;
      }

      const stockData = data.results[0];
      setAveragePrice(stockData.last_trade_price?.toString() || '');
    } catch (err) {
      console.error('Error fetching stock data:', err);
      setError('Failed to fetch stock data');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol || !shares || !averagePrice) {
      setError('Please fill in all fields');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const response = await fetch(
        `https://api.polygon.io/v3/reference/tickers?ticker=${symbol.toUpperCase()}&market=stocks&active=true&apiKey=${import.meta.env.VITE_POLYGON_API_KEY}`,
        {
          headers: {
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch stock data');
      }

      const data = await response.json();
      
      if (!data.results || data.results.length === 0) {
        throw new Error('Invalid stock symbol');
      }

      await onAddStock(
        symbol.toUpperCase(),
        parseFloat(shares),
        parseFloat(averagePrice)
      );

      // Clear form on success
      setSymbol('');
      setShares('');
      setAveragePrice('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add stock. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Add Stock to Portfolio</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="symbol" className="block text-sm font-medium text-gray-700 mb-1">
            Symbol
          </label>
          <input
            type="text"
            id="symbol"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            onBlur={handleSymbolBlur}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., AAPL"
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="shares" className="block text-sm font-medium text-gray-700 mb-1">
            Shares
          </label>
          <input
            type="number"
            id="shares"
            value={shares}
            onChange={(e) => setShares(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Number of shares"
            min="0"
            step="0.01"
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="averagePrice" className="block text-sm font-medium text-gray-700 mb-1">
            Average Price
          </label>
          <input
            type="number"
            id="averagePrice"
            value={averagePrice}
            onChange={(e) => setAveragePrice(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Price per share"
            min="0"
            step="0.01"
            disabled={loading}
          />
        </div>
      </div>
      <button
        type="submit"
        className={`mt-4 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          loading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        disabled={loading}
      >
        {loading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
        ) : (
          <>
            <Plus className="h-5 w-5 mr-2" />
            Add to Portfolio
          </>
        )}
      </button>
    </form>
  );
};

export default AddStockForm;