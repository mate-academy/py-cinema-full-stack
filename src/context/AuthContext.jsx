import React, { createContext, useContext, useMemo, useState } from "react";
import { clearAccessToken, getAccessToken, setAccessToken } from "../services/token";
import { login as apiLogin } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [access, setAccess] = useState(getAccessToken());

  const isAuthed = Boolean(access);

  const signIn = async (email, password) => {
    const data = await apiLogin(email, password);

    // поддержка двух вариантов ответа (SimpleJWT / Token)
    const token = data.access || data.token;
    if (!token) throw new Error("No token in response");

    setAccessToken(token);
    setAccess(token);
  };

  const signOut = () => {
    clearAccessToken();
    setAccess(null);
  };

  const value = useMemo(
    () => ({
      isAuthed,
      signIn,
      signOut,
    }),
    [isAuthed]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
