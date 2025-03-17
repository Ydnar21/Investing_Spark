import React from 'react';
import { TrendingUp, TrendingDown, BarChart2 } from 'lucide-react';
import { StockStats as StockStatsType } from '../types';

interface StockStatsProps {
  stats: StockStatsType;
}

const StockStats = ({ stats }: StockStatsProps) => {
  const isPositive = stats.change >= 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">{stats.symbol}</h2>
        {isPositive ? (
          <TrendingUp className="text-green-500 h-6 w-6" />
        ) : (
          <TrendingDown className="text-red-500 h-6 w-6" />
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-gray-600">Current Price</p>
          <p className="text-xl font-semibold">${stats.price.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-gray-600">Change</p>
          <p className={`text-xl font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? '+' : ''}{stats.change.toFixed(2)} ({stats.changePercent.toFixed(2)}%)
          </p>
        </div>
        <div>
          <p className="text-gray-600">Volume</p>
          <p className="text-xl font-semibold">{stats.volume.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-gray-600">52 Week Range</p>
          <p className="text-xl font-semibold">
            ${stats.low52Week.toFixed(2)} - ${stats.high52Week.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StockStats;