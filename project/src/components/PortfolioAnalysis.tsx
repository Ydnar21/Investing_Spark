import React from 'react';
import { PieChart, TrendingUp } from 'lucide-react';
import { PortfolioAnalysis as PortfolioAnalysisType } from '../types';

interface PortfolioAnalysisProps {
  analysis: PortfolioAnalysisType;
}

const PortfolioAnalysis = ({ analysis }: PortfolioAnalysisProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Portfolio Analysis</h2>
        <PieChart className="h-6 w-6 text-blue-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">Sector Allocation</h3>
          <div className="space-y-3">
            {Object.entries(analysis.sectorAllocation).map(([sector, percentage]) => (
              <div key={sector} className="flex items-center">
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{sector}</span>
                    <span className="text-sm text-gray-500">{percentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 rounded-full h-2"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {analysis.underrepresentedSectors.length > 0 && (
            <div className="mt-6">
              <h4 className="text-md font-semibold mb-2">Consider Adding Exposure To:</h4>
              <ul className="list-disc list-inside text-gray-700">
                {analysis.underrepresentedSectors.map((sector) => (
                  <li key={sector}>{sector}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Recommended Stocks</h3>
          <div className="space-y-4">
            {analysis.recommendations.map((recommendation) => (
              <div key={recommendation.symbol} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-lg">{recommendation.symbol}</span>
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <p className="text-sm text-gray-600 mb-2">{recommendation.reason}</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Price: </span>
                    <span className="font-medium">${recommendation.stats.price.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Sector: </span>
                    <span className="font-medium">{recommendation.stats.sector}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioAnalysis;