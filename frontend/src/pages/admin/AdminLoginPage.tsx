import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.is_staff) {
      navigate("/admin", { replace: true });
    }
  }, [user, navigate]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(username, password);
      navigate("/admin", { replace: true });
    } catch {
      setError("Invalid username or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-xl p-8 shadow-lg">
        <h1 className="font-bold text-2xl text-navy-900 text-center mb-6">Admin Login</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-2 border rounded px-3 py-2">
            <User size={18} className="text-gray-400" />
            <input
              required
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="flex-1 outline-none"
            />
          </div>
          <div className="flex items-center gap-2 border rounded px-3 py-2">
            <Lock size={18} className="text-gray-400" />
            <input
              required
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 outline-none"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
