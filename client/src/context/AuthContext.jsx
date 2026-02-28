import { createContext, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { api, setAuthToken } from "../api/client";

const AuthContext = createContext(null);

const STORAGE_KEY = "managex-auth";

const persist = ({ user, accessToken, refreshToken }) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, accessToken, refreshToken }));
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState("");
  const [refreshToken, setRefreshToken] = useState("");
  const [loading, setLoading] = useState(true);

  const clearSession = () => {
    setUser(null);
    setAccessToken("");
    setRefreshToken("");
    setAuthToken("");
    localStorage.removeItem(STORAGE_KEY);
  };

  const rotateSession = async (currentRefreshToken) => {
    const { data } = await api.post("/auth/refresh", { refreshToken: currentRefreshToken });
    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    setAuthToken(data.accessToken);
    const nextUser = data.user || user;
    if (data.user) setUser(data.user);
    persist({ user: nextUser, accessToken: data.accessToken, refreshToken: data.refreshToken });
    return data;
  };

  const hydrateSession = async (parsed) => {
    try {
      setAuthToken(parsed.accessToken || "");
      let token = parsed.accessToken;
      let nextRefreshToken = parsed.refreshToken || "";

      if (!token && nextRefreshToken) {
        const refreshData = await rotateSession(nextRefreshToken);
        token = refreshData.accessToken;
        nextRefreshToken = refreshData.refreshToken;
      }

      if (!token) {
        clearSession();
        setLoading(false);
        return;
      }

      setAuthToken(token);
      const meRes = await api.get("/auth/me");

      setUser(meRes.data.user);
      setAccessToken(token);
      setRefreshToken(nextRefreshToken);
      persist({ user: meRes.data.user, accessToken: token, refreshToken: nextRefreshToken });
    } catch {
      clearSession();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      setLoading(false);
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      hydrateSession(parsed);
    } catch {
      clearSession();
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!accessToken || !refreshToken) return;

    const interval = setInterval(async () => {
      try {
        await rotateSession(refreshToken);
      } catch {
        clearSession();
      }
    }, 12 * 60 * 1000);

    return () => clearInterval(interval);
  }, [accessToken, refreshToken, user]);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    setUser(data.user);
    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    setAuthToken(data.accessToken);
    persist({ user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken });
    toast.success("Login successful");
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    toast.success("Account created. Verify your email.");
    return data;
  };

  const verifyEmail = async (email, code) => {
    const { data } = await api.post("/auth/verify-email", { email, code });
    toast.success("Email verified");
    return data;
  };

  const resendVerification = async (email) => {
    const { data } = await api.post("/auth/resend-verification", { email });
    toast.success("Verification code sent");
    return data;
  };

  const forgotPassword = async (email) => {
    const { data } = await api.post("/auth/forgot-password", { email });
    toast.success(data.message);
    return data;
  };

  const resetPassword = async ({ email, token, newPassword }) => {
    const { data } = await api.post("/auth/reset-password", { email, token, newPassword });
    toast.success(data.message);
    return data;
  };

  const refreshUser = async () => {
    const { data } = await api.get("/auth/me");
    setUser(data.user);
    persist({ user: data.user, accessToken, refreshToken });
  };

  const logout = async () => {
    try {
      if (refreshToken) {
        await api.post("/auth/logout", { refreshToken });
      }
    } catch {
      // no-op
    }

    clearSession();
  };

  const logoutAll = async () => {
    try {
      await api.post("/auth/logout-all");
    } finally {
      clearSession();
    }
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      logout,
      logoutAll,
      register,
      verifyEmail,
      resendVerification,
      forgotPassword,
      resetPassword,
      refreshUser
    }),
    [user, loading, accessToken, refreshToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};