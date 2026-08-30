import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('idly_staff_token') || null);
  const [staffUser, setStaffUser] = useState(() => {
    const saved = localStorage.getItem('idly_staff_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isStaffViewActive, setIsStaffViewActive] = useState(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem('idly_staff_token', token);
    } else {
      localStorage.removeItem('idly_staff_token');
    }
  }, [token]);

  useEffect(() => {
    if (staffUser) {
      localStorage.setItem('idly_staff_user', JSON.stringify(staffUser));
    } else {
      localStorage.removeItem('idly_staff_user');
    }
  }, [staffUser]);

  const loginStaff = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed.');
      }

      setToken(data.token);
      setStaffUser(data.user);
      setIsStaffModalOpen(false);
      setIsStaffViewActive(true);
      return { success: true, user: data.user };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, error: err.message };
    }
  };

  const logoutStaff = () => {
    setToken(null);
    setStaffUser(null);
    setIsStaffViewActive(false);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        staffUser,
        isAuthenticated: !!token,
        loginStaff,
        logoutStaff,
        isStaffModalOpen,
        setIsStaffModalOpen,
        isStaffViewActive,
        setIsStaffViewActive
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
