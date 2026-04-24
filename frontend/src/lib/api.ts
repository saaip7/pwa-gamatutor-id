const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, data: unknown) {
    let message = `API Error: ${status}`;
    if (data && typeof data === "object" && "message" in data) {
      message = String((data as { message: string }).message);
    } else if (typeof data === "string") {
      message = data;
    }
    super(message);
    this.status = status;
    this.data = data;
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refreshToken");
}

function setTokens(access: string, refresh?: string) {
  localStorage.setItem("token", access);
  if (refresh) {
    localStorage.setItem("refreshToken", refresh);
  }
}

function clearTokens() {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
}

let refreshPromise: Promise<string | null> | null = null;

async function attemptRefresh(): Promise<string | null> {
  const rt = getRefreshToken();
  if (!rt) return null;

  try {
    const res = await fetch(`${API_BASE}/api/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: rt }),
    });

    if (!res.ok) {
      clearTokens();
      return null;
    }

    const data = await res.json();
    if (data.token) {
      localStorage.setItem("token", data.token);
      return data.token;
    }
    return null;
  } catch {
    return null;
  }
}

function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = attemptRefresh().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}

function isNetworkError(e: unknown): boolean {
  return (
    e instanceof TypeError ||
    (e instanceof Error && e.message === "Failed to fetch")
  );
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  _isRetry = false
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  if (options.headers) {
    const caller = options.headers as Record<string, string>;
    Object.entries(caller).forEach(([k, v]) => {
      headers[k] = v;
    });
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let data: unknown;
    try {
      data = await res.json();
    } catch {
      data = await res.text();
    }

    if (res.status === 401 && !_isRetry && typeof window !== "undefined") {
      const newToken = await refreshAccessToken();
      if (newToken) {
        return request<T>(path, options, true);
      }

      clearTokens();
    }

    throw new ApiError(res.status, data);
  }

  if (res.status === 204) return undefined as T;

  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),

  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),

  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),

  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),

  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

export { ApiError, setTokens, clearTokens, isNetworkError };
