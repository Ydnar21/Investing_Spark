import { useState, useEffect } from 'react';
import { AuthState, User } from '../types';

const STORAGE_KEY = 'auth_state';
const USERS_STORAGE_KEY = 'registered_users';

const getRegisteredUsers = (): User[] => {
  const saved = localStorage.getItem(USERS_STORAGE_KEY);
  return saved ? JSON.parse(saved) : [
    { username: 'randy', password: 'admin', email: 'randy@example.com' }
  ];
};

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : { isAuthenticated: false, user: null };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authState));
  }, [authState]);

  const login = (username: string, password: string): boolean => {
    const users = getRegisteredUsers();
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
      setAuthState({ isAuthenticated: true, user: user.username });
      return true;
    }
    return false;
  };

  const signup = (username: string, email: string, password: string): boolean => {
    const users = getRegisteredUsers();
    
    // Check if username or email is already registered
    if (users.some(u => u.username === username)) {
      throw new Error('Username already taken');
    }
    if (users.some(u => u.email === email)) {
      throw new Error('Email already registered');
    }

    // Create new user
    const newUser = {
      username,
      email,
      password
    };

    // Save user
    users.push(newUser);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

    // Auto login
    setAuthState({ isAuthenticated: true, user: newUser.username });
    return true;
  };

  const logout = () => {
    setAuthState({ isAuthenticated: false, user: null });
  };

  return {
    ...authState,
    login,
    signup,
    logout
  };
};