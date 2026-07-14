import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api, ensureCsrfCookie } from "@/lib/api";

interface AuthUser {
  id: number;
  username: string;
  email: string;
  is_staff: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        await ensureCsrfCookie();
        const response = await api.get<AuthUser>("/api/auth/me/");
        setUser(response.data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function login(username: string, password: string) {
    await ensureCsrfCookie();
    const response = await api.post<AuthUser>("/api/auth/login/", { username, password });
    setUser(response.data);
  }

  async function logout() {
    await api.post("/api/auth/logout/");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
