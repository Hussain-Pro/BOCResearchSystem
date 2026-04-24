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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password = "admin123") => {
    try {
      const response = await api.post("/auth/login", { username, password });
      // The API returns { data: { token, user: { ... } } } because of ApiResponse<T>
      const { token, ...userData } = response.data.data;
      
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
      setUser(userData);
      
      return { ok: true };
    } catch (error: any) {
      return { 
        ok: false, 
        message: error.response?.data?.message || "فشل تسجيل الدخول. يرجى التحقق من الخادم." 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setUser(null);
  };

  const register = async (data: RegisterData) => {
    try {
      await api.post("/auth/register", data); // This endpoint is not yet implemented in backend, but will be.
      return { ok: true, message: "تم إرسال طلب التسجيل بنجاح" };
    } catch (error: any) {
      return { 
        ok: false, 
        message: error.response?.data?.message || "فشل التسجيل" 
      };
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
