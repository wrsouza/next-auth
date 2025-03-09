import { injectable } from "inversify";
import type { IApiService } from "./interfaces";

interface RequestConfig extends RequestInit {
  token?: string;
}

interface Headers {
  "Content-Type": string;
  Authorization?: string;
}

@injectable()
export class ApiService implements IApiService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
  }

  private async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const { token, ...customConfig } = config;
    const headers: Headers = { "Content-Type": "application/json" };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
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

  public async get<T>(endpoint: string, token?: string): Promise<T> {
    return this.request<T>(endpoint, { token });
  }

  public async post<T>(
    endpoint: string,
    data: unknown,
    token?: string
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
      token,
    });
  }

  public async put<T>(
    endpoint: string,
    data: unknown,
    token?: string
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
      token,
    });
  }

  public async delete<T>(endpoint: string, token?: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: "DELETE",
      token,
    });
  }
}
