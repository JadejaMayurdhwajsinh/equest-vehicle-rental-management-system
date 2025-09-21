// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();
const API_BASE_URL = "http://localhost:5000/api/auth";

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper functions
  const setToken = (token) => localStorage.setItem("token", token);
  const getToken = () => localStorage.getItem("token");
  const removeToken = () => localStorage.removeItem("token");
  const isAuthenticated = () => !!getToken();

  // Configure axios instance
  const axiosInstance = axios.create({ baseURL: "http://localhost:5000/api" });

  // Add token to requests
  axiosInstance.interceptors.request.use((config) => {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  // Handle 401 responses
  useEffect(() => {
    const interceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );
    return () => axiosInstance.interceptors.response.eject(interceptor);
  }, []);

  // Check for existing token on app load
  useEffect(() => {
    const token = getToken();
    if (token) {
      fetchProfile();
    }
    setLoading(false);
  }, []);

  // Fetch user profile
  const fetchProfile = async () => {
    try {
      
      const response = await axiosInstance.get("/auth/profile");
      console.log(response.data);
      console.log("HERE3");
      
      setUser(response.data);
      // console.log("Fetched user profile:", response.data);
      
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      removeToken();
      setUser(null);
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      console.log("RES:");
      const response = await axios.post(`${API_BASE_URL}/login`, {
        email,
        password
      });
      
      
      const { token, user_type } = response.data;
      
      // if (user_type !== 'admin') {
      //   throw new Error("Access restricted to administrators only");
      // }
      // console.log("Login response:", response.data);
      console.log("HERE 1");
      localStorage.setItem("token", token);
      localStorage.setItem("user_type", user_type);
      console.log("HERE 2");
      
      // setUser(response.data.user);
      
      await fetchProfile();
      
      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return { 
        success: false, 
        message: error.response?.data?.message || error.message || "Login failed" 
      };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/register`, userData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Registration error:", error);
      return { 
        success: false, 
        message: error.response?.data?.message || "Registration failed" 
      };
    }
  };

  // Logout function
  const logout = () => {
    removeToken();
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated,
    axiosInstance
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};