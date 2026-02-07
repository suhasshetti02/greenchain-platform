"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import api from "@/lib/api";

const STORAGE_KEY = "greenchain:auth";

function safeParse(value) {
  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
}

export default function useAuth() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authenticating, setAuthenticating] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = safeParse(localStorage.getItem(STORAGE_KEY));
    if (stored?.token) {
      setToken(stored.token);
      setUser(stored.user);
      
      // Fetch fresh profile in background to ensure coords/data are up to date
      api.users.getProfile()
         .then(response => {
            if (response?.user) {
               // Merge with token from storage since getProfile only returns user
               const updated = { token: stored.token, user: response.user };
               setUser(response.user);
               localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            }
         })
         .catch(err => console.error("Failed to refresh profile:", err));
    }
    setIsLoading(false);
  }, []);

  const persist = useCallback((nextToken, nextUser) => {
    setToken(nextToken);
    setUser(nextUser);
    if (typeof window === "undefined") return;
    if (nextToken) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ token: nextToken, user: nextUser }),
      );
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const login = useCallback(
    async ({ email, password }) => {
      setAuthenticating(true);
      try {
        const payload = await api.auth.login(email, password);
        persist(payload.token, payload.user);
        return payload.user;
      } catch (error) {
        throw new Error(error.message || "Login failed");
      } finally {
        setAuthenticating(false);
      }
    },
    [persist],
  );

  const register = useCallback(
    async ({ email, password, name, role, phone, address, latitude, longitude }) => {
      setAuthenticating(true);
      try {
        const payload = await api.auth.register(email, password, name, role, phone, address, latitude, longitude);
        persist(payload.token, payload.user);
        return payload.user;
      } catch (error) {
        throw new Error(error.message || "Registration failed");
      } finally {
        setAuthenticating(false);
      }
    },
    [persist],
  );

  const logout = useCallback(() => {
    persist(null, null);
  }, [persist]);

  const getUser = useCallback(() => user, [user]);

  return useMemo(
    () => ({
      token,
      user,
      isLoading,
      authenticating,
      login,
      register,
      logout,
      getUser,
    }),
    [token, user, isLoading, authenticating, login, register, logout, getUser],
  );
}

