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
  // Extended (mock) profile fields
  phone?: string;
  avatarUrl?: string;
  jobTitle?: string;
  department?: string;
  division?: string;
  qualification?: string;
  jobGrade?: 1 | 2 | 3;
}

export interface RegisterData {
  employeeId: string;
  fullName: string;
  email: string;
  username: string;
  password: string;
  activationCode: string;
<<<<<<< HEAD
  badgeImagePath?: string | null;
=======
  department?: string;
  division?: string;
  jobTitle?: string;
  jobGrade?: 2 | 3;
  qualification?: string;
  idCardFile?: string;
>>>>>>> 6da3fa9c37a05dc41cf256c3c4433088baccb851
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password?: string) => Promise<{ ok: boolean; message?: string }>;
  logout: () => void;
  register: (data: RegisterData) => { ok: boolean; message: string };
  updateProfile: (patch: Partial<User>) => void;
  switchRole: (role: string) => void;
  enable2FA: (otp: string) => boolean;
  disable2FA: () => void;
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
<<<<<<< HEAD
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
=======
      const { token, ...userData } = response.data.data;

      localStorage.setItem(TOKEN_STORAGE_KEY, token);
>>>>>>> 6da3fa9c37a05dc41cf256c3c4433088baccb851
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
      setUser(userData);

      return { ok: true };
<<<<<<< HEAD
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string; errors?: string[] } } };
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0] ||
        "فشل تسجيل الدخول. يرجى التحقق من الخادم.";
      return { ok: false, message: msg };
=======
    } catch (error: any) {
      return {
        ok: false,
        message: error.response?.data?.message || "فشل تسجيل الدخول. يرجى التحقق من الخادم.",
      };
>>>>>>> 6da3fa9c37a05dc41cf256c3c4433088baccb851
    }
  };

  const logout = () => {
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setUser(null);
  };

  // Mock-only synchronous register (no backend round-trip)
  const register = (data: RegisterData): { ok: boolean; message: string } => {
    try {
<<<<<<< HEAD
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
=======
      const pending = JSON.parse(localStorage.getItem("ers_pending_users") || "[]");
      pending.push({ ...data, status: "pending", createdAt: new Date().toISOString() });
      localStorage.setItem("ers_pending_users", JSON.stringify(pending));
      return { ok: true, message: "تم إرسال طلب التسجيل، بانتظار تفعيل المشرف" };
    } catch {
      return { ok: false, message: "تعذّر إرسال الطلب" };
>>>>>>> 6da3fa9c37a05dc41cf256c3c4433088baccb851
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

  // Mock 2FA: any 6-digit numeric code with non-zero digit sum is accepted
  const enable2FA = (otp: string): boolean => {
    if (!/^\d{6}$/.test(otp)) return false;
    const sum = otp.split("").reduce((a, c) => a + Number(c), 0);
    if (sum === 0) return false;
    updateProfile({ twoFactorEnabled: true });
    return true;
  };

  const disable2FA = () => updateProfile({ twoFactorEnabled: false });

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, logout, register, updateProfile, switchRole, enable2FA, disable2FA }}
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
