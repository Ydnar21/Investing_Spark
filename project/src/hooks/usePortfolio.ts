import { useState, useEffect } from 'react';
import { PortfolioStock, UserPortfolio } from '../types';

const STORAGE_KEY = 'user_portfolios';

export const usePortfolio = (username: string | null) => {
  const [portfolio, setPortfolio] = useState<PortfolioStock[]>(() => {
    if (!username) return [];
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    
    const portfolios: UserPortfolio[] = JSON.parse(saved);
    const userPortfolio = portfolios.find(p => p.username === username);
    return userPortfolio ? userPortfolio.stocks : [];
  });

  useEffect(() => {
    if (!username) return;

    const saved = localStorage.getItem(STORAGE_KEY);
    const portfolios: UserPortfolio[] = saved ? JSON.parse(saved) : [];
    
    const existingPortfolioIndex = portfolios.findIndex(p => p.username === username);
    if (existingPortfolioIndex >= 0) {
      portfolios[existingPortfolioIndex].stocks = portfolio;
    } else {
      portfolios.push({ username, stocks: portfolio });
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolios));
  }, [portfolio, username]);

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