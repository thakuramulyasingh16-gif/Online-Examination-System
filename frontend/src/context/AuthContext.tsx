import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

interface User {
  id: number;
  name: string;
  loginId: string;
  email: string;
  role: 'admin' | 'student';
  profileImage?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (loginId: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const { data } = await api.get('/auth/me');
          setUser(data);
        } catch (error) {
          logout();
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, [token]);

  const login = async (loginId: string, password: string) => {
    const { data } = await api.post('/auth/login', { loginId, password });
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('token', data.token);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
