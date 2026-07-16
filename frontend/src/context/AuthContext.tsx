import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTenant } from './TenantContext';

interface User {
  id: string;
  tenant_id: string;
  email: string;
  phone: string;
  name: string;
  role: 'broker' | 'client';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: any) => Promise<void>;
  logout: () => void;
  updateProfile: (name: string, phone: string) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { tenant } = useTenant();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('semsar_token');
    const savedUser = localStorage.getItem('semsar_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-Subdomain': tenant.subdomain
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'فشل تسجيل الدخول.');
    }

    localStorage.setItem('semsar_token', data.token);
    localStorage.setItem('semsar_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  };

  const register = async (payload: any) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-Subdomain': tenant.subdomain
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'فشل إنشاء الحساب.');
    }

    localStorage.setItem('semsar_token', data.token);
    localStorage.setItem('semsar_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    // Clear all storage parameters to prevent autofills & cache retention
    localStorage.clear();
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (name: string, phone: string) => {
    const response = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Tenant-Subdomain': tenant.subdomain
      },
      body: JSON.stringify({ name, phone })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'فشل تحديث البيانات.');
    }

    localStorage.setItem('semsar_user', JSON.stringify(data.user));
    setUser(data.user);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, updateProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
