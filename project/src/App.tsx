import React, { useState } from 'react';
import { Search, BarChart2, LogOut } from 'lucide-react';
import StockChart from './components/StockChart';
import StockStats from './components/StockStats';
import Portfolio from './components/Portfolio';
import AddStockForm from './components/AddStockForm';
import PortfolioAnalysis from './components/PortfolioAnalysis';
import LoginScreen from './components/LoginScreen';
import { StockStats as StockStatsType, HistoricalDataRange } from './types';
import { usePortfolio } from './hooks/usePortfolio';
import { useAuth } from './hooks/useAuth';
import { analyzePortfolio } from './utils/portfolioAnalysis';
import { fetchStockData, fetchHistoricalData } from './utils/stockData';

function App() {
  const [symbol, setSymbol] = useState('');
  const [chartData, setChartData] = useState<Array<{ time: string; value: number }>>([]);
  const [stockStats, setStockStats] = useState<StockStatsType | null>(null);
  const { isAuthenticated, user, login, signup, logout } = useAuth();
  const { portfolio, addStock, removeStock } = usePortfolio(user);
  const [loading, setLoading] = useState(false);
  const [chartLoading, setChartLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol) return;

    setLoading(true);
    setError(null);

    try {
      const [stockData, historicalData] = await Promise.all([
        fetchStockData(symbol),
        fetchHistoricalData(symbol, '1W')
      ]);
      
      setStockStats(stockData);
      setChartData(historicalData);
    } catch (err) {
      setError('Failed to fetch stock data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStock = async (symbol: string, shares: number, averagePrice: number) => {
    try {
      const stockData = await fetchStockData(symbol);
      addStock({
        symbol,
        shares,
        averagePrice,
        stats: stockData,
      });
    } catch (err) {
      console.error('Error adding stock:', err);
      setError('Failed to add stock to portfolio. Please try again.');
    }
  };

  const handleRangeChange = async (range: HistoricalDataRange) => {
    if (!stockStats) return;
    
    setChartLoading(true);
    try {
      const historicalData = await fetchHistoricalData(stockStats.symbol, range);
      setChartData(historicalData);
    } catch (err) {
      setError('Failed to fetch historical data. Please try again.');
      console.error(err);
    } finally {
      setChartLoading(false);
    }
  };

  const portfolioAnalysis = analyzePortfolio(portfolio);

  if (!isAuthenticated) {
    return <LoginScreen onLogin={login} onSignup={signup} />;
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
                    disabled={loading}
                  />
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </form>
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
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <AddStockForm onAddStock={handleAddStock} />
        
        {portfolio.length > 0 && (
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
              <StockChart 
                data={chartData} 
                onRangeChange={handleRangeChange}
                loading={chartLoading}
              />
            </div>
          </div>
        )}

        {!stockStats && portfolio.length === 0 && !loading && (
          <div className="text-center py-12">
            <BarChart2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Enter a stock symbol to begin</h3>
            <p className="mt-2 text-sm text-gray-500">
              View detailed stock analysis, charts, and statistics
            </p>
          </div>
        )}

        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;