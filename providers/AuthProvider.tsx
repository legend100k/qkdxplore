"use client";

import { ReactNode, createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  user: any | null;
  loading: boolean;
  signInWithGoogle: () => Promise<any | null>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const signInWithGoogle = async () => {
    console.log("Authentication is currently disabled.");
    return null;
  };

  const logOut = async () => {
    console.log("Logged out.");
  };

  useEffect(() => {
    setLoading(false);
  }, []);

  const value = {
    user,
    loading,
    signInWithGoogle,
    logOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};