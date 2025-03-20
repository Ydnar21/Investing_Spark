import { useState, useEffect } from 'react';
import { AuthState, User } from '../types';

const STORAGE_KEY = 'auth_state';
const VALID_CREDENTIALS: User[] = [
  { username: 'randy', password: 'admin' }
];

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : { isAuthenticated: false, user: null };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authState));
  }, [authState]);

  const login = (username: string, password: string): boolean => {
    const user = VALID_CREDENTIALS.find(
      u => u.username === username && u.password === password
    );

    if (user) {
      setAuthState({ isAuthenticated: true, user: username });
      return true;
    }
    return false;
  };

  const logout = () => {
    setAuthState({ isAuthenticated: false, user: null });
  };

  return {
    ...authState,
    login,
    logout
  };
};