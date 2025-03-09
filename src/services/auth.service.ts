import { injectable, inject } from "inversify";
import type {
  ITokenService,
  IAuthService,
  IApiService,
  AuthResponse,
  User,
} from "./interfaces";
import { TYPES } from "./types";

@injectable()
export class AuthService implements IAuthService {
  constructor(
    @inject(TYPES.TOKEN_SERVICE) private readonly tokenService: ITokenService,
    @inject(TYPES.API_SERVICE) private readonly apiService: IApiService
  ) {}

  public async login(email: string, password: string): Promise<void> {
    try {
      const response = await this.apiService.post<AuthResponse>("/auth", {
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

  public async getProfile(): Promise<User | null> {
    const token = this.tokenService.getToken();
    if (!token) {
      return null;
    }
    return await this.apiService.get<User>("/auth", token);
  }

  public logout(): void {
    this.tokenService.clearRefreshSchedule();
    this.tokenService.removeToken();
  }
}
