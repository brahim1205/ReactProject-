import { useMemo } from 'react';
import { container } from '../container.js';


export const useAuthBusiness = () => {
  const authBusinessService = useMemo(() => container.getAuthBusinessService(), []);

  const login = async (credentials) => {
    return authBusinessService.login(credentials);
  };

  const register = async (userData) => {
    return authBusinessService.register(userData);
  };

  const logout = () => {
    authBusinessService.logout();
  };

  const isAuthenticated = () => {
    return authBusinessService.isAuthenticated();
  };

  const getCurrentUser = () => {
    return authBusinessService.getCurrentUser();
  };

  const getToken = () => {
    return authBusinessService.getToken();
  };

  const validateToken = (token) => {
    return authBusinessService.validateToken(token);
  };

  return {
    login,
    register,
    logout,
    isAuthenticated,
    getCurrentUser,
    getToken,
    validateToken,
  };
};