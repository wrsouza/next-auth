const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface RequestConfig extends RequestInit {
  token?: string;
}

interface Headers {
  "Content-Type": string;
  Authorization?: string;
}

async function request<T>(
  endpoint: string,
  config: RequestConfig = {}
): Promise<T> {
  const { token, ...customConfig } = config;
  const headers: Headers = { "Content-Type": "application/json" };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...customConfig,
    headers: {
      ...headers,
      ...customConfig.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Something went wrong");
  }

  return response.json();
}

export const api = {
  get: <T>(endpoint: string, token?: string) => request<T>(endpoint, { token }),

  post: <T>(endpoint: string, data: unknown, token?: string) =>
    request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
      token,
    }),

  put: <T>(endpoint: string, data: unknown, token?: string) =>
    request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
      token,
    }),

  delete: <T>(endpoint: string, token?: string) =>
    request<T>(endpoint, {
      method: "DELETE",
      token,
    }),
};
