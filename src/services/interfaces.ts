export interface ITokenService {
  getToken(): string | null;
  setToken(token: string): void;
  removeToken(): void;
  isTokenValid(token: string): boolean;
  getTokenExpirationTime(token: string): number | null;
  scheduleTokenRefresh(
    token: string,
    onRefresh: (newToken: string) => void
  ): void;
  clearRefreshSchedule(): void;
}

export interface IAuthService {
  login(email: string, password: string): Promise<void>;
  checkAuth(onTokenRefresh: () => void): Promise<User>;
  refreshToken(token: string): Promise<AuthResponse>;
  logout(): void;
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
