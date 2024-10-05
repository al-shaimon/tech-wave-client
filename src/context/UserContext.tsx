"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { jwtDecode, JwtPayload } from "jwt-decode";

interface ExtendedJwtPayload extends JwtPayload {
  role: string;
  profilePhoto?: string;
}

interface UserContextType {
  user: ExtendedJwtPayload | null;
  profilePhoto: string | null;
  setUser: (user: ExtendedJwtPayload | null) => void;
  setProfilePhoto: (photo: string | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ExtendedJwtPayload | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const photo = localStorage.getItem("profilePhoto");

    if (token) {
      const decodedUser = jwtDecode<ExtendedJwtPayload>(token);
      setUser(decodedUser);
    }

    if (photo) {
      setProfilePhoto(photo);
    }
  }, []);

  return (
    <UserContext.Provider
      value={{ user, profilePhoto, setUser, setProfilePhoto }}
    >
      {children}
    </UserContext.Provider>
  );
}
