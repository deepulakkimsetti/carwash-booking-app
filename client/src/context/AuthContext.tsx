import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '../firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  const [sessionTimer, setSessionTimer] = useState<NodeJS.Timeout | null>(null);

  const logout = () => {
    signOut(auth);
    setUser(null);
    if (sessionTimer) {
      clearTimeout(sessionTimer);
      setSessionTimer(null);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log('Firebase auth state changed:', firebaseUser ? 'User logged in' : 'User logged out');
      setUser(firebaseUser);
      setLoading(false);
      
      // Clear existing timer
      if (sessionTimer) {
        clearTimeout(sessionTimer);
        setSessionTimer(null);
      }
      
      if (firebaseUser) {
        // Start session timer on login
        console.log('Starting session timer for', SESSION_TIMEOUT / 1000, 'seconds');
        const timer = setTimeout(() => {
          console.log('Session timeout - logging out');
          logout();
        }, SESSION_TIMEOUT);
        setSessionTimer(timer);
      }
    });

    return () => {
      unsubscribe();
      if (sessionTimer) {
        clearTimeout(sessionTimer);
      }
    };
  }, []); // Remove sessionTimer from dependency to avoid infinite loop

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
