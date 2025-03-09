import { api } from "./api";
import { tokenService } from "./token";
import { ITokenService, IAuthService, AuthResponse, User } from "./interfaces";

export class AuthService implements IAuthService {
  constructor(private readonly tokenService: ITokenService) {}

  public async login(email: string, password: string): Promise<void> {
    try {
      const response = await api.post<AuthResponse>("/auth", {
        email,
        password,
      });
      this.tokenService.setToken(response.accessToken);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to login";
      throw new Error(message);
    }
  }

  public async checkAuth(onTokenRefresh: () => void): Promise<User> {
    const token = this.tokenService.getToken();
    if (!token) {
      throw new Error("No token found");
    }

    if (!this.tokenService.isTokenValid(token)) {
      this.tokenService.removeToken();
      throw new Error("Token expired");
    }

    // Schedule refresh for the current token
    this.tokenService.scheduleTokenRefresh(token, onTokenRefresh);

    try {
      return await api.get<User>("/auth", token);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Authentication failed";
      throw new Error(message);
    }
  }

  public async refreshToken(token: string): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>("/auth/refresh", {}, token);
      this.tokenService.setToken(response.accessToken);
      return response;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to refresh token";
      throw new Error(message);
    }
  }

  public logout(): void {
    this.tokenService.clearRefreshSchedule();
    this.tokenService.removeToken();
  }
}

// For backward compatibility
export const authService = new AuthService(tokenService);
