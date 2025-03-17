import React from 'react';
import { Trash2 } from 'lucide-react';
import { PortfolioStock } from '../types';

interface PortfolioProps {
  stocks: PortfolioStock[];
  onRemoveStock: (symbol: string) => void;
}

const Portfolio = ({ stocks, onRemoveStock }: PortfolioProps) => {
  const totalValue = stocks.reduce((sum, stock) => sum + (stock.shares * stock.stats.price), 0);
  const totalGainLoss = stocks.reduce((sum, stock) => {
    const costBasis = stock.shares * stock.averagePrice;
    const currentValue = stock.shares * stock.stats.price;
    return sum + (currentValue - costBasis);
  }, 0);

  const gainLossPercent = (totalGainLoss / (totalValue - totalGainLoss)) * 100;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Your Portfolio</h2>
        <div className="text-right">
          <p className="text-gray-600">Total Value</p>
          <p className="text-2xl font-bold">${totalValue.toFixed(2)}</p>
          <p className={`text-sm ${totalGainLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {totalGainLoss >= 0 ? '+' : ''}{totalGainLoss.toFixed(2)} ({gainLossPercent.toFixed(2)}%)
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Symbol</th>
              <th className="text-right py-2">Shares</th>
              <th className="text-right py-2">Avg Price</th>
              <th className="text-right py-2">Current Price</th>
              <th className="text-right py-2">Total Value</th>
              <th className="text-right py-2">Gain/Loss</th>
              <th className="text-right py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {stocks.map((stock) => {
              const value = stock.shares * stock.stats.price;
              const gainLoss = value - (stock.shares * stock.averagePrice);
              const gainLossPercent = (gainLoss / (value - gainLoss)) * 100;

              return (
                <tr key={stock.symbol} className="border-b">
                  <td className="py-3">{stock.symbol}</td>
                  <td className="text-right">{stock.shares}</td>
                  <td className="text-right">${stock.averagePrice.toFixed(2)}</td>
                  <td className="text-right">${stock.stats.price.toFixed(2)}</td>
                  <td className="text-right">${value.toFixed(2)}</td>
                  <td className={`text-right ${gainLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {gainLoss >= 0 ? '+' : ''}{gainLoss.toFixed(2)} ({gainLossPercent.toFixed(2)}%)
                  </td>
                  <td className="text-right">
                    <button
                      onClick={() => onRemoveStock(stock.symbol)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Portfolio;