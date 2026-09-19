import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  getAuthMe, 
  loginUser, 
  registerUser, 
  getUserBusinesses, 
  getSavedToken, 
  setSavedToken, 
  getSavedBusinessId, 
  setSavedBusinessId 
} from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(getSavedToken());
  const [businesses, setBusinesses] = useState([]);
  const [currentBusinessId, setCurrentBusinessId] = useState(getSavedBusinessId());
  const [loading, setLoading] = useState(true);

  // Restore authenticated session and businesses upon initial load / browser refresh
  useEffect(() => {
    let isMounted = true;

    async function initializeAuth() {
      const savedToken = getSavedToken();
      if (!savedToken) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const me = await getAuthMe();
        if (me && me.id) {
          if (isMounted) {
            setUser(me);
            setToken(savedToken);
          }
          // Fetch user's businesses
          const bizList = await getUserBusinesses();
          if (isMounted) {
            setBusinesses(bizList || []);
            const savedBizId = getSavedBusinessId();
            if (savedBizId && bizList && bizList.some(b => b.id === savedBizId)) {
              setCurrentBusinessId(savedBizId);
            } else if (bizList && bizList.length > 0) {
              setCurrentBusinessId(bizList[0].id);
              setSavedBusinessId(bizList[0].id);
            }
          }
        } else {
          // Token invalid or expired
          setSavedToken(null);
          if (isMounted) {
            setUser(null);
            setToken(null);
          }
        }
      } catch (err) {
        console.warn('Failed to restore authentication session:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email, password) => {
    const data = await loginUser(email, password);
    if (data?.access_token && data?.user) {
      setUser(data.user);
      setToken(data.access_token);
      setSavedToken(data.access_token);

      // Fetch user's businesses
      const bizList = await getUserBusinesses();
      setBusinesses(bizList || []);
      if (bizList && bizList.length > 0) {
        setCurrentBusinessId(bizList[0].id);
        setSavedBusinessId(bizList[0].id);
      } else {
        setCurrentBusinessId(null);
        setSavedBusinessId(null);
      }
      return data;
    }
    throw new Error('Login failed: Invalid server response');
  };

  const register = async (payload) => {
    const data = await registerUser(payload);
    if (data?.access_token && data?.user) {
      setUser(data.user);
      setToken(data.access_token);
      setSavedToken(data.access_token);
      setBusinesses([]);
      setCurrentBusinessId(null);
      setSavedBusinessId(null);
      return data;
    }
    throw new Error('Registration failed: Invalid server response');
  };

  const logout = () => {
    setSavedToken(null);
    setSavedBusinessId(null);
    setUser(null);
    setToken(null);
    setBusinesses([]);
    setCurrentBusinessId(null);
  };

  const selectBusiness = (bizId) => {
    setCurrentBusinessId(bizId);
    setSavedBusinessId(bizId);
  };

  const refreshBusinesses = async () => {
    try {
      const bizList = await getUserBusinesses();
      setBusinesses(bizList || []);
      return bizList;
    } catch (err) {
      console.warn('Could not refresh businesses:', err);
      return [];
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        businesses,
        currentBusinessId,
        loading,
        isAuthenticated: Boolean(user && token),
        login,
        register,
        logout,
        selectBusiness,
        refreshBusinesses
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
