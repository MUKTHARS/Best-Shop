import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      console.log('🔄 Checking authentication status...');
      const token = await authAPI.getToken();
      console.log('🔑 Token found:', !!token);
      
      if (token) {
        console.log('🔄 Validating token with server...');
        const userData = await authAPI.getProfile();
        console.log('✅ User data retrieved:', userData.username);
        
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        console.log('❌ No token found');
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.log('❌ Auth check failed:', error.message);
      // Clear invalid token
      await authAPI.removeToken();
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
      console.log('🏁 Auth check completed');
    }
  };

  const login = async (username, password) => {
    try {
      console.log('🔐 Starting login process...');
      const response = await authAPI.login(username, password);
      
      if (response && response.token) {
        console.log('✅ Login successful, setting user state');
        setUser(response.user);
        setIsAuthenticated(true);
        return { success: true, user: response.user };
      } else {
        console.log('❌ Login response missing token');
        return { success: false, error: 'Invalid response from server' };
      }
    } catch (error) {
      console.log('❌ Login process failed:', error.message);
      return { 
        success: false, 
        error: error.message || 'Login failed' 
      };
    }
  };

  const logout = async () => {
    console.log('🚪 Logging out...');
    await authAPI.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    login,
    logout,
    isLoading,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};