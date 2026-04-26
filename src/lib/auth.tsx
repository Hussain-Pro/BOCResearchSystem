import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { api } from "./api";

export interface User {
  id: string;
  fullName: string;
  role: string;
  email: string;
  employeeId?: string;
  twoFactorEnabled: boolean;
  lastGradeChangeDate?: string;
  eligibleDate?: string;
}

export interface RegisterData {
  employeeId: string;
  fullName: string;
  email: string;
  username: string;
  password: string;
  activationCode: string;
  badgeImagePath?: string | null;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password?: string) => Promise<{ ok: boolean; message?: string }>;
  logout: () => void;
  register: (data: RegisterData) => Promise<{ ok: boolean; message: string }>;
  updateProfile: (patch: Partial<User>) => void;
  switchRole: (role: string) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const USER_STORAGE_KEY = "ers_user";
const TOKEN_STORAGE_KEY = "ers_token";

function mapAuthPayloadToUser(payload: Record<string, unknown>): User {
  return {
    id: String(payload.id ?? ""),
    fullName: String(payload.fullName ?? ""),
    role: String(payload.role ?? "Employee"),
    email: String(payload.email ?? ""),
    employeeId: payload.employeeId != null ? String(payload.employeeId) : undefined,
    twoFactorEnabled: Boolean(payload.twoFactorEnabled),
    lastGradeChangeDate:
      payload.lastGradeChangeDate != null ? String(payload.lastGradeChangeDate) : undefined,
    eligibleDate: payload.eligibleDate != null ? String(payload.eligibleDate) : undefined,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem(USER_STORAGE_KEY);
        localStorage.removeItem(TOKEN_STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password = "admin123") => {
    try {
      const response = await api.post("/auth/login", { username, password });
      const body = response.data;
      if (body?.success === false) {
        return { ok: false, message: body?.message || "فشل تسجيل الدخول" };
      }
      const payload = body?.data as Record<string, unknown> | undefined;
      if (!payload || typeof payload.token !== "string") {
        return { ok: false, message: "استجابة غير متوقعة من الخادم" };
      }
      const { token, ...rest } = payload;
      const userData = mapAuthPayloadToUser(rest);

      localStorage.setItem(TOKEN_STORAGE_KEY, token as string);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
      setUser(userData);

      return { ok: true };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string; errors?: string[] } } };
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0] ||
        "فشل تسجيل الدخول. يرجى التحقق من الخادم.";
      return { ok: false, message: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setUser(null);
  };

  const register = async (data: RegisterData) => {
    try {
      await api.post("/auth/register", {
        username: data.username,
        password: data.password,
        email: data.email,
        employeeId: data.employeeId || null,
        activationCode: data.activationCode || null,
        badgeImagePath: data.badgeImagePath ?? null,
      });
      return { ok: true, message: "تم إرسال طلب التسجيل بنجاح" };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string; errors?: string[] } } };
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0] ||
        "فشل التسجيل";
      return { ok: false, message: msg };
    }
  };

  const updateProfile = (patch: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...patch };
    setUser(updated);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
  };

  const switchRole = (role: string) => {
    if (!user) return;
    updateProfile({ role });
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, register, updateProfile, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
