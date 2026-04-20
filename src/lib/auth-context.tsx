import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export interface AuthUser {
  email: string;
  name: string;
  // 是否已创建过店铺
  hasShop: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setHasShop: (v: boolean) => void;
  // 模拟修改密码（任意值即可）
  resetPassword: (email: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "hotelos.auth.user";
const SHOP_KEY = "hotelos.auth.hasShop";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AuthUser;
        // 同步 hasShop（独立 key，便于跨流程更新）
        const hs = localStorage.getItem(SHOP_KEY);
        parsed.hasShop = hs === "1";
        setUser(parsed);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  const persist = (u: AuthUser | null) => {
    if (u) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      localStorage.setItem(SHOP_KEY, u.hasShop ? "1" : "0");
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const login: AuthContextValue["login"] = async (email) => {
    await new Promise((r) => setTimeout(r, 300));
    const hs = localStorage.getItem(SHOP_KEY) === "1";
    const u: AuthUser = {
      email,
      name: email.split("@")[0] || "用户",
      hasShop: hs,
    };
    setUser(u);
    persist(u);
  };

  const logout = () => {
    setUser(null);
    persist(null);
  };

  const setHasShop = (v: boolean) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, hasShop: v };
      persist(next);
      return next;
    });
    localStorage.setItem(SHOP_KEY, v ? "1" : "0");
  };

  const resetPassword: AuthContextValue["resetPassword"] = async () => {
    await new Promise((r) => setTimeout(r, 400));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
        setHasShop,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
