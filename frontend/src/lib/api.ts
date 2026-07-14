import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

api.interceptors.request.use((config) => {
  const method = (config.method ?? "get").toLowerCase();
  if (["post", "put", "patch", "delete"].includes(method)) {
    const csrfToken = getCookie("csrftoken");
    if (csrfToken) {
      config.headers = config.headers ?? {};
      config.headers["X-CSRFToken"] = csrfToken;
    }
  }
  return config;
});

const SESSION_EXEMPT_PATHS = ["/api/auth/login/", "/api/auth/me/", "/api/auth/csrf/"];

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url: string = error?.config?.url ?? "";
    const isExempt = SESSION_EXEMPT_PATHS.some((path) => url.includes(path));

    if (status === 401 && !isExempt && window.location.pathname.startsWith("/admin")) {
      window.location.href = "/admin/login";
    }

    return Promise.reject(error);
  },
);

export async function ensureCsrfCookie(): Promise<void> {
  await api.get("/api/auth/csrf/");
}
