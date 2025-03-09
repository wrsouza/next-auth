export interface ITokenService {
  getToken(): string | null;
  setToken(token: string): void;
  removeToken(): void;
  isTokenValid(token: string): boolean;
  getTokenExpirationTime(token: string): number | null;
  refreshToken(token: string): Promise<void>;
  scheduleTokenRefresh(token: string): void;
  clearRefreshSchedule(): void;
}

export interface IAuthService {
  login(email: string, password: string): Promise<void>;
  logout(): void;
  getProfile(): Promise<User | null>;
}

export interface IApiService {
  get<T>(endpoint: string, token?: string): Promise<T>;
  post<T>(endpoint: string, data: unknown, token?: string): Promise<T>;
  put<T>(endpoint: string, data: unknown, token?: string): Promise<T>;
  delete<T>(endpoint: string, token?: string): Promise<T>;
}

export interface AuthResponse {
  accessToken: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
  isActive: boolean;
  isAdmin: boolean;
}
