import React, { useState } from 'react';
import { Plus } from 'lucide-react';

interface AddStockFormProps {
  onAddStock: (symbol: string, shares: number, averagePrice: number) => void;
}

const AddStockForm = ({ onAddStock }: AddStockFormProps) => {
  const [symbol, setSymbol] = useState('');
  const [shares, setShares] = useState('');
  const [averagePrice, setAveragePrice] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol || !shares || !averagePrice) return;

    onAddStock(
      symbol.toUpperCase(),
      parseFloat(shares),
      parseFloat(averagePrice)
    );

    setSymbol('');
    setShares('');
    setAveragePrice('');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Add Stock to Portfolio</h2>
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
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., AAPL"
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
          />
        </div>
      </div>
      <button
        type="submit"
        className="mt-4 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <Plus className="h-5 w-5 mr-2" />
        Add to Portfolio
      </button>
    </form>
  );
};

export default AddStockForm;