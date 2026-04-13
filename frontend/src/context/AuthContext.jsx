import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get("/users/get-current-user");
      setCurrentUser(response.data?.data || null);
    } catch (error) {
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const loginContext = (userData) => {
    setCurrentUser(userData);
  };

  const logoutContext = () => {
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    loading,
    loginContext,
    logoutContext,
    fetchCurrentUser // Provide access to re-fetch if they modify profile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
