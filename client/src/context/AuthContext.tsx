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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
      if (firebaseUser) {
        // Start session timer on login
        if (sessionTimer) clearTimeout(sessionTimer);
        const timer = setTimeout(() => {
          logout();
        }, SESSION_TIMEOUT);
        setSessionTimer(timer);
      } else {
        // Clear timer on logout
        if (sessionTimer) clearTimeout(sessionTimer);
      }
    });
    return () => {
      unsubscribe();
      if (sessionTimer) clearTimeout(sessionTimer);
    };
    // eslint-disable-next-line
  }, []);

  const logout = () => {
    signOut(auth);
    setUser(null);
    if (sessionTimer) clearTimeout(sessionTimer);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
