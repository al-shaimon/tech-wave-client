/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from "jwt-decode";

interface User {
  id: string;
  name: string;
  email: string;
  isVerified: boolean;
  phone: string;
  profilePhoto: string;
  role: string;
}

interface UserContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  updateUser: (updatedData: Partial<User>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedUser: User = jwtDecode(token);
        setUser(decodedUser);
      } catch (error) {
        console.error("Invalid token:", error);
      }
    }
  }, []);

  const updateUser = (updatedData: Partial<User>) => {
    setUser(prevUser => prevUser ? { ...prevUser, ...updatedData } : null);
    // Update localStorage
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken: any = jwtDecode(token);
      const updatedToken = { ...decodedToken, ...updatedData };
      localStorage.setItem("token", JSON.stringify(updatedToken));
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};