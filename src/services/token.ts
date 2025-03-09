import { jwtDecode } from "jwt-decode";
import { api } from "./api";
import { ITokenService, AuthResponse } from "./interfaces";

interface DecodedToken {
  exp: number;
}

const TOKEN_KEY = "token";

export class TokenService implements ITokenService {
  private refreshTimeout: NodeJS.Timeout | null = null;

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
      const decoded = jwtDecode<DecodedToken>(token);
      const currentTime = Date.now();
      const expirationTime = decoded.exp * 1000; // Convert to milliseconds

      return expirationTime > currentTime;
    } catch {
      return false;
    }
  }

  public getTokenExpirationTime(token: string): number | null {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      return decoded.exp * 1000; // Convert to milliseconds
    } catch {
      return null;
    }
  }

  public scheduleTokenRefresh(
    token: string,
    onRefresh: (newToken: string) => void
  ): void {
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
      const refreshTime = timeUntilExpiry - 60000; // Refresh 1 minute before expiry

      if (refreshTime > 0) {
        this.refreshTimeout = setTimeout(async () => {
          try {
            const response = await api.post<AuthResponse>(
              "/auth/refresh",
              {},
              token
            );
            const newToken = response.accessToken;
            this.setToken(newToken);
            onRefresh(newToken);
            this.scheduleTokenRefresh(newToken, onRefresh);
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

// For backward compatibility
export const tokenService = new TokenService();
