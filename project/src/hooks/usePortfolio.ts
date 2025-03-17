import { useState, useEffect } from 'react';
import { PortfolioStock } from '../types';

const STORAGE_KEY = 'stock-portfolio';

export const usePortfolio = () => {
  const [portfolio, setPortfolio] = useState<PortfolioStock[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolio));
  }, [portfolio]);

  const addStock = (stock: PortfolioStock) => {
    setPortfolio(prev => [...prev, stock]);
  };

  const removeStock = (symbol: string) => {
    setPortfolio(prev => prev.filter(stock => stock.symbol !== symbol));
  };

  return {
    portfolio,
    addStock,
    removeStock
  };
};