import { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
}

interface authContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean; 
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (user: User, token: string, persist?: boolean) => void;
  logout: () => void;
}

export const AuthContext = createContext<authContextType | null>(null);

interface authProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: authProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); 

  
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    const persist = localStorage.getItem("persist");

    // console.log("AuthContext mount - localStorage:", {
    //   savedToken: !!savedToken,
    //   savedUser: !!savedUser,
    //   persist: persist
    // });

    if (savedToken && persist === "true") {
      setToken(savedToken);
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          console.log("Auto-login successful from localStorage");
        } catch (error) {
          console.error("Failed to parse saved user:", error);
          localStorage.removeItem("user");
        }
      }
    } else {
      console.log("Auto-login skipped - reasons:", {
        hasToken: !!savedToken,
        persistFlag: persist,
        persistIsTrue: persist === "true"
      });
    }

    setIsLoading(false);
  }, []);

  const login = (user: User, token: string, persist = false) => {
    // console.log("Login called with:", { user, token, persist });
    
    setUser(user);
    setToken(token);

    if (persist) {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("persist", "true");
      // console.log("Saved to localStorage with persist=true");
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("persist");
      // console.log("Cleared localStorage (persist=false)");
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("persist");
  };

  const value: authContextType = {
    user,
    token,
    isLoading, 
    setUser,
    setToken,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): authContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}