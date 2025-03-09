import { containerService } from "./container.service";
import { TYPES } from "./types";
import type {
  IApiService,
  IAuthService,
  ITokenService,
  AuthResponse,
  User,
} from "./interfaces";

// Export service types
export type { IApiService, IAuthService, ITokenService, AuthResponse, User };

// Export service instances
export const api = containerService.getService<IApiService>(TYPES.API_SERVICE);
export const tokenService = containerService.getService<ITokenService>(
  TYPES.TOKEN_SERVICE
);
export const authService = containerService.getService<IAuthService>(
  TYPES.AUTH_SERVICE
);
