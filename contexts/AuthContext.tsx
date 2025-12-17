import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, User } from '@/services/api';

interface AuthContextData {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredData();
  }, []);

  async function loadStoredData() {
    try {
      const storedToken = await AsyncStorage.getItem('@jwt_token');
      const storedUser = await AsyncStorage.getItem('@user_data');

      if (storedToken && storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading stored data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function signIn(email: string, password: string) {
    try {
      const response = await api.login(email, password);
      
      if (response.jwt) {
        await AsyncStorage.setItem('@jwt_token', response.jwt);
        await AsyncStorage.setItem('@user_data', JSON.stringify(response.user));
        setUser(response.user);
      } else {
        throw new Error('Token não recebido da API');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Erro ao fazer login';
      throw new Error(errorMessage);
    }
  }

  async function signUp(name: string, email: string, password: string) {
    try {
      await api.register(name, email, password);
      await signIn(email, password);
    } catch (error: any) {
      const errorMessage = error.message || 'Erro ao criar conta';
      throw new Error(errorMessage);
    }
  }

  async function signOut() {
    try {
      await AsyncStorage.removeItem('@jwt_token');
      await AsyncStorage.removeItem('@user_data');
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
