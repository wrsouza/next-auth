import { Container, SERVICE_TOKENS, ServiceToken } from "./container";
import { TokenService } from "./token";
import { AuthService } from "./auth";
import { ITokenService, IAuthService } from "./interfaces";

export class ServiceFactory {
  private static container = Container.getInstance();

  public static initializeServices(): void {
    // Create and register TokenService
    const tokenService = new TokenService();
    this.container.register<ITokenService>(
      SERVICE_TOKENS.TOKEN_SERVICE,
      tokenService
    );

    // Create and register AuthService with its dependencies
    const authService = new AuthService(tokenService);
    this.container.register<IAuthService>(
      SERVICE_TOKENS.AUTH_SERVICE,
      authService
    );
  }

  public static getTokenService(): ITokenService {
    return this.container.resolve<ITokenService>(SERVICE_TOKENS.TOKEN_SERVICE);
  }

  public static getAuthService(): IAuthService {
    return this.container.resolve<IAuthService>(SERVICE_TOKENS.AUTH_SERVICE);
  }

  public static getService<T>(token: ServiceToken): T {
    return this.container.resolve<T>(token);
  }
}
