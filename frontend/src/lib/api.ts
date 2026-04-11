const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, data: unknown) {
    // Extract human-readable message from BE response
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

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  // Merge caller headers (don't overwrite Content-Type if they set it)
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

    // Handle 401 globally — clear token, redirect to login
    if (res.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      import("sonner").then(({ toast }) => {
        toast.error("Sesi berakhir", { description: "Silakan login kembali" });
      });
      // Redirect to login if not already there
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }

    throw new ApiError(res.status, data);
  }

  // 204 No Content
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

export { ApiError };
