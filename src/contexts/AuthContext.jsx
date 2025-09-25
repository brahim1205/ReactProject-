import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuthBusiness } from '../hooks/useAuthBusiness.js';
import { AuthContext } from '../hooks/useAuth.js';


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const authBusiness = useAuthBusiness();

  useEffect(() => {
    const token = authBusiness.getToken();
    const userData = authBusiness.getCurrentUser();

    if (token && userData && authBusiness.validateToken(token)) {
      setIsAuthenticated(true);
      setUser(userData);
    }
    setLoading(false);
  }, []); 

  const login = useCallback(async (credentials) => {
    const response = await authBusiness.login(credentials);

    setIsAuthenticated(true);

    const userData = authBusiness.getCurrentUser();
    if (userData) {
      setUser(userData);
    }

    return response;
  }, [authBusiness]);

  const register = useCallback(async (userData) => {
    const response = await authBusiness.register(userData);
    return response;
  }, [authBusiness]);

  const logout = useCallback(() => {
    authBusiness.logout();
    setIsAuthenticated(false);
    setUser(null);
  }, [authBusiness]);

  const updateUser = useCallback((updatedUserData) => {
    setUser(prevUser => prevUser ? { ...prevUser, ...updatedUserData } : null);
    // Mettre à jour les données dans le localStorage aussi
    const currentUserData = authBusiness.getCurrentUser();
    if (currentUserData) {
      const updatedData = { ...currentUserData, ...updatedUserData };
      localStorage.setItem('user', JSON.stringify(updatedData));
    }
  }, [authBusiness]);

  const value = useMemo(() => ({
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateUser
  }), [user, isAuthenticated, loading, login, register, logout, updateUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
