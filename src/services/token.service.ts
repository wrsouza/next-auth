import { injectable, inject } from "inversify";
import { jwtDecode } from "jwt-decode";
import type { ITokenService, IApiService, AuthResponse } from "./interfaces";
import { TYPES } from "./types";

interface DecodedToken {
  exp: number;
}

const TOKEN_KEY = "token";
const REFRESH_BEFORE_EXPIRY = 60000; // 1 minute in milliseconds

@injectable()
export class TokenService implements ITokenService {
  private refreshTimeout: NodeJS.Timeout | null = null;

  constructor(
    @inject(TYPES.API_SERVICE) private readonly apiService: IApiService
  ) {}

  public getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  public setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  public removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  }

  public isTokenValid(token: string): boolean {
    try {
      const expirationTime = this.getTokenExpirationTime(token);
      if (!expirationTime) {
        return false;
      }

      const currentTime = Date.now();
      return expirationTime > currentTime;
    } catch {
      return false;
    }
  }

  public getTokenExpirationTime(token: string): number | null {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      return decoded.exp ? decoded.exp * 1000 : null; // Convert to milliseconds
    } catch {
      return null;
    }
  }

  public async refreshToken(token: string): Promise<void> {
    try {
      const response = await this.apiService.post<AuthResponse>(
        "/auth/refresh",
        {},
        token
      );
      this.setToken(response.accessToken);
      this.scheduleTokenRefresh(response.accessToken);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to refresh token";
      throw new Error(message);
    }
  }

  public scheduleTokenRefresh(token: string): void {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
    }

    try {
      const expirationTime = this.getTokenExpirationTime(token);
      if (!expirationTime) {
        this.removeToken();
        return;
      }

      const currentTime = Date.now();
      const timeUntilExpiry = expirationTime - currentTime;
      const refreshTime = timeUntilExpiry - REFRESH_BEFORE_EXPIRY;

      if (refreshTime > 0) {
        this.refreshTimeout = setTimeout(async () => {
          try {
            const response = await this.apiService.post<AuthResponse>(
              "/auth/refresh",
              {},
              token
            );
            const newToken = response.accessToken;
            this.setToken(newToken);
            this.refreshToken(newToken);
          } catch (error) {
            console.error(
              "Failed to refresh token:",
              error instanceof Error ? error.message : "Unknown error"
            );
            this.removeToken();
          }
        }, refreshTime);
      } else {
        // Token is already expired or about to expire
        this.removeToken();
      }
    } catch (error) {
      console.error(
        "Failed to schedule token refresh:",
        error instanceof Error ? error.message : "Unknown error"
      );
      this.removeToken();
    }
  }

  public clearRefreshSchedule(): void {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
      this.refreshTimeout = null;
    }
  }
}
