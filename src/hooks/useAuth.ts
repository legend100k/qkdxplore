import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, []);

  const signInWithGoogle = async () => {
    console.log("Authentication is currently disabled.");
    return null;
  };

  const logOut = async () => {
    console.log("Logged out.");
  };

  return { user, loading, signInWithGoogle, logOut };
};