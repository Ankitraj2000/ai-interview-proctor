import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize Auth state from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, id, firstName, lastName, roles } = response.data;
      
      const userData = { id, email, firstName, lastName, roles };
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      console.error("Login failed:", error);
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      return { success: false, error: message };
    }
  };

  const register = async (firstName, lastName, email, password, role) => {
    try {
      const roles = role ? [role] : ['CANDIDATE'];
      await api.post('/auth/register', { firstName, lastName, email, password, roles });
      return { success: true };
    } catch (error) {
      console.error("Registration failed:", error);
      const message = error.response?.data?.message || 'Registration failed.';
      return { success: false, error: message };
    }
  };

  const verifyOtp = async (email, otp) => {
    try {
      await api.post('/auth/verify-otp', { email, otp });
      return { success: true };
    } catch (error) {
      console.error("OTP verification failed:", error);
      const message = error.response?.data?.message || 'Invalid or expired OTP.';
      return { success: false, error: message };
    }
  };

  const forgotPassword = async (email) => {
    try {
      await api.post('/auth/forgot-password', { email });
      return { success: true };
    } catch (error) {
      console.error("Forgot password request failed:", error);
      const message = error.response?.data?.message || 'Forgot password request failed.';
      return { success: false, error: message };
    }
  };

  const resetPassword = async (email, otp, newPassword) => {
    try {
      await api.post('/auth/reset-password', { email, token: otp, newPassword });
      return { success: true };
    } catch (error) {
      console.error("Password reset failed:", error);
      const message = error.response?.data?.message || 'Password reset failed.';
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const hasRole = (roleList) => {
    if (!user || !user.roles) return false;
    return user.roles.some(role => roleList.includes(role));
  };

  const updateUserData = (updatedUser) => {
    const freshData = { ...user, ...updatedUser };
    localStorage.setItem('user', JSON.stringify(freshData));
    setUser(freshData);
  };

  const value = {
    user,
    loading,
    login,
    register,
    verifyOtp,
    forgotPassword,
    resetPassword,
    logout,
    hasRole,
    updateUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
