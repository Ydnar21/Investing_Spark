import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { StockSearchResult } from '../types';
import { searchStocks } from '../utils/stockData';

interface StockSearchProps {
  onSelect: (symbol: string) => void;
  className?: string;
  placeholder?: string;
}

const StockSearch: React.FC<StockSearchProps> = ({
  onSelect,
  className = '',
  placeholder = 'Search by company name or symbol...'
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<StockSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const searchTimeout = useRef<number>();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setError(null);
      return;
    }

    window.clearTimeout(searchTimeout.current);
    searchTimeout.current = window.setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const searchResults = await searchStocks(query);
        setResults(searchResults);
        setShowResults(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to search stocks');
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => window.clearTimeout(searchTimeout.current);
  }, [query]);

  const handleSelect = (result: StockSearchResult) => {
    setQuery(`${result.symbol} - ${result.name}`);
    setShowResults(false);
    onSelect(result.symbol);
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setShowResults(true)}
          placeholder={placeholder}
          className="w-full px-4 py-2 pl-10 pr-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        {loading && (
          <div className="absolute right-3 top-2.5">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {error && (
        <div className="absolute z-10 w-full mt-1 p-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {showResults && results.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {results.map((result) => (
            <button
              key={result.symbol}
              onClick={() => handleSelect(result)}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
            >
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-medium">{result.symbol}</span>
                  <span className="ml-2 text-gray-600">{result.name}</span>
                </div>
                <span className="text-sm text-gray-500">{result.region}</span>
              </div>
              <div className="text-sm text-gray-500">
                {result.type} • {result.currency}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default StockSearch;