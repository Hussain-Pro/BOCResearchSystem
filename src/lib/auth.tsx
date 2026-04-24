import { createContext, useContext, useState, type ReactNode } from "react";
import { mockUsers, mockActivationCodes, type MockUser, type RoleKey } from "./mockData";

export interface RegisterData {
  employeeId: string;
  fullName: string;
  email: string;
  username: string;
  password: string;
  activationCode: string;
  department: string;
  jobTitle: string;
  jobGrade: 2 | 3;
  qualification: string;
}

interface AuthContextValue {
  user: MockUser | null;
  login: (username: string) => boolean;
  logout: () => void;
  switchRole: (role: RoleKey) => void;
  register: (data: RegisterData) => { ok: boolean; message: string };
  updateProfile: (patch: Partial<MockUser>) => void;
  enable2FA: (otp: string) => boolean;
  disable2FA: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "ers_mock_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as MockUser) : null;
    } catch {
      return null;
    }
  });

  const persist = (u: MockUser | null) => {
    setUser(u);
    if (typeof window !== "undefined") {
      if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      else localStorage.removeItem(STORAGE_KEY);
    }
  };

  const login = (username: string) => {
    const found =
      mockUsers.find((u) => u.email.startsWith(username.toLowerCase())) ??
      mockUsers[0];
    persist(found);
    return true;
  };

  const logout = () => persist(null);

  const switchRole = (role: RoleKey) => {
    const target = mockUsers.find((u) => u.role === role);
    if (target) persist(target);
  };

  const register = (data: RegisterData) => {
    if (!mockActivationCodes.includes(data.activationCode)) {
      return { ok: false, message: "رمز التفعيل غير صحيح" };
    }
    if (mockUsers.some((u) => u.email === data.email)) {
      return { ok: false, message: "البريد الإلكتروني مستخدم مسبقاً" };
    }
    const newUser: MockUser = {
      id: `u${mockUsers.length + 1}`,
      fullName: data.fullName,
      jobTitle: data.jobTitle,
      jobGrade: data.jobGrade,
      department: data.department,
      email: data.email,
      role: "Employee",
      qualification: data.qualification,
      lastGradeChangeDate: new Date().toISOString().slice(0, 10),
      twoFactorEnabled: false,
    };
    mockUsers.push(newUser);
    return { ok: true, message: "تم إرسال طلب التسجيل بنجاح" };
  };

  const updateProfile = (patch: Partial<MockUser>) => {
    if (!user) return;
    const updated = { ...user, ...patch };
    persist(updated);
    const idx = mockUsers.findIndex((u) => u.id === user.id);
    if (idx >= 0) mockUsers[idx] = updated;
  };

  const enable2FA = (otp: string) => {
    if (!user) return false;
    if (!/^\d{6}$/.test(otp)) return false;
    const sum = otp.split("").reduce((a, b) => a + Number(b), 0);
    if (sum === 0) return false;
    updateProfile({ twoFactorEnabled: true });
    return true;
  };

  const disable2FA = () => {
    updateProfile({ twoFactorEnabled: false });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, switchRole, register, updateProfile, enable2FA, disable2FA }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
