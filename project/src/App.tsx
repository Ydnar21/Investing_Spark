import React, { useState } from 'react';
import { Search, BarChart2, LogOut } from 'lucide-react';
import StockChart from './components/StockChart';
import StockStats from './components/StockStats';
import Portfolio from './components/Portfolio';
import AddStockForm from './components/AddStockForm';
import PortfolioAnalysis from './components/PortfolioAnalysis';
import LoginScreen from './components/LoginScreen';
import { StockStats as StockStatsType } from './types';
import { usePortfolio } from './hooks/usePortfolio';
import { useAuth } from './hooks/useAuth';
import { analyzePortfolio } from './utils/portfolioAnalysis';

function App() {
  const [symbol, setSymbol] = useState('');
  const [chartData, setChartData] = useState<Array<{ time: string; value: number }>>([]);
  const [stockStats, setStockStats] = useState<StockStatsType | null>(null);
  const { portfolio, addStock, removeStock } = usePortfolio();
  const [showPortfolio, setShowPortfolio] = useState(true);
  const { isAuthenticated, user, login, logout } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol) return;

    // Mock data for demonstration
    const mockChartData = Array.from({ length: 30 }, (_, i) => ({
      time: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      value: Math.random() * 100 + 100,
    }));

    const mockStats: StockStatsType = {
      symbol: symbol.toUpperCase(),
      price: 156.78,
      change: 2.45,
      changePercent: 1.59,
      volume: 45678923,
      high52Week: 175.89,
      low52Week: 98.45,
      sector: 'Technology',
      industry: 'Software'
    };

    setChartData(mockChartData);
    setStockStats(mockStats);
  };

  const handleAddStock = (symbol: string, shares: number, averagePrice: number) => {
    const mockStats: StockStatsType = {
      symbol: symbol,
      price: Math.random() * 50 + 100,
      change: Math.random() * 10 - 5,
      changePercent: Math.random() * 5 - 2.5,
      volume: Math.floor(Math.random() * 10000000),
      high52Week: 175.89,
      low52Week: 98.45,
      sector: ['Technology', 'Healthcare', 'Financial Services'][Math.floor(Math.random() * 3)],
      industry: 'Sample Industry'
    };

    addStock({
      symbol,
      shares,
      averagePrice,
      stats: mockStats,
    });
    setShowPortfolio(true);
  };

  const portfolioAnalysis = analyzePortfolio(portfolio);

  if (!isAuthenticated) {
    return <LoginScreen onLogin={login} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Stock Analysis</h1>
              <span className="ml-4 text-gray-600">Welcome, {user}</span>
            </div>
            <div className="flex items-center space-x-4">
              <form onSubmit={handleSubmit} className="flex-1 max-w-lg">
                <div className="relative">
                  <input
                    type="text"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                    placeholder="Enter stock symbol (e.g., AAPL)"
                    className="w-full px-4 py-2 pl-10 pr-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </form>
              <button
                onClick={() => setShowPortfolio(!showPortfolio)}
                className={`px-4 py-2 rounded-lg ${
                  showPortfolio 
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                } transition-colors duration-200`}
              >
                {showPortfolio ? 'Hide Portfolio' : 'Show Portfolio'}
              </button>
              <button
                onClick={logout}
                className="flex items-center px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors duration-200"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AddStockForm onAddStock={handleAddStock} />
        
        {showPortfolio && portfolio.length > 0 && (
          <>
            <div className="mb-8">
              <Portfolio stocks={portfolio} onRemoveStock={removeStock} />
            </div>
            <PortfolioAnalysis analysis={portfolioAnalysis} />
          </>
        )}

        {stockStats && (
          <div className="space-y-8">
            <StockStats stats={stockStats} />
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Price History</h2>
              <StockChart data={chartData} />
            </div>
          </div>
        )}

        {!stockStats && portfolio.length === 0 && (
          <div className="text-center py-12">
            <BarChart2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Enter a stock symbol to begin</h3>
            <p className="mt-2 text-sm text-gray-500">
              View detailed stock analysis, charts, and statistics
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;