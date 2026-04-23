import { createContext, useContext, useState, type ReactNode } from "react";
import { mockUsers, type MockUser, type RoleKey } from "./mockData";

interface AuthContextValue {
  user: MockUser | null;
  login: (username: string) => boolean;
  logout: () => void;
  switchRole: (role: RoleKey) => void;
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
    // mock: any non-empty username logs you in as the SystemSupervisor by default
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

  return (
    <AuthContext.Provider value={{ user, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
