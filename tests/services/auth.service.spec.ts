import { Container } from "inversify";
import { AuthService } from "../../src/services/auth.service";
import { TYPES } from "../../src/services/types";
import type {
  ITokenService,
  IApiService,
  AuthResponse,
  User,
} from "../../src/services/interfaces";

describe("AuthService", () => {
  let container: Container;
  let authService: AuthService;
  let mockTokenService: jest.Mocked<ITokenService>;
  let mockApiService: jest.Mocked<IApiService>;

  const mockUser: User = {
    id: "1",
    name: "Test User",
    email: "test@example.com",
    roles: ["user"],
    isActive: true,
    isAdmin: false,
  };

  const mockAuthResponse: AuthResponse = {
    accessToken: "mock-token",
  };

  beforeEach(() => {
    mockTokenService = {
      getToken: jest.fn(),
      setToken: jest.fn(),
      removeToken: jest.fn(),
      isTokenValid: jest.fn(),
      getTokenExpirationTime: jest.fn(),
      scheduleTokenRefresh: jest.fn(),
      clearRefreshSchedule: jest.fn(),
    };

    mockApiService = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    };

    container = new Container();
    container
      .bind<ITokenService>(TYPES.TOKEN_SERVICE)
      .toConstantValue(mockTokenService);
    container
      .bind<IApiService>(TYPES.API_SERVICE)
      .toConstantValue(mockApiService);
    container.bind<AuthService>(TYPES.AUTH_SERVICE).to(AuthService);

    authService = container.get<AuthService>(TYPES.AUTH_SERVICE);
  });

  describe("login", () => {
    const email = "test@example.com";
    const password = "password123";

    it("should successfully login and set token", async () => {
      mockApiService.post.mockResolvedValueOnce(mockAuthResponse);

      await authService.login(email, password);

      expect(mockApiService.post).toHaveBeenCalledWith("/auth", {
        email,
        password,
      });
      expect(mockTokenService.setToken).toHaveBeenCalledWith(
        mockAuthResponse.accessToken
      );
    });

    it("should throw error when login fails with Error instance", async () => {
      const error = new Error("Invalid credentials");
      mockApiService.post.mockRejectedValueOnce(error);

      await expect(authService.login(email, password)).rejects.toThrow(
        "Invalid credentials"
      );
    });

    it("should throw generic error when login fails with non-Error instance", async () => {
      mockApiService.post.mockRejectedValueOnce("Unknown error");

      await expect(authService.login(email, password)).rejects.toThrow(
        "Failed to login"
      );
    });
  });

  describe("checkAuth", () => {
    const mockToken = "valid-token";
    const onTokenRefresh = jest.fn();

    it("should successfully check auth and return user data", async () => {
      mockTokenService.getToken.mockReturnValueOnce(mockToken);
      mockTokenService.isTokenValid.mockReturnValueOnce(true);
      mockApiService.get.mockResolvedValueOnce(mockUser);

      const result = await authService.checkAuth(onTokenRefresh);

      expect(mockTokenService.getToken).toHaveBeenCalled();
      expect(mockTokenService.isTokenValid).toHaveBeenCalledWith(mockToken);
      expect(mockTokenService.scheduleTokenRefresh).toHaveBeenCalledWith(
        mockToken,
        onTokenRefresh
      );
      expect(mockApiService.get).toHaveBeenCalledWith("/auth", mockToken);
      expect(result).toEqual(mockUser);
    });

    it("should throw error when no token is found", async () => {
      mockTokenService.getToken.mockReturnValueOnce(null);

      await expect(authService.checkAuth(onTokenRefresh)).rejects.toThrow(
        "No token found"
      );
    });

    it("should throw error when token is invalid", async () => {
      mockTokenService.getToken.mockReturnValueOnce(mockToken);
      mockTokenService.isTokenValid.mockReturnValueOnce(false);

      await expect(authService.checkAuth(onTokenRefresh)).rejects.toThrow(
        "Token expired"
      );
      expect(mockTokenService.removeToken).toHaveBeenCalled();
    });

    it("should throw error when API request fails with Error instance", async () => {
      mockTokenService.getToken.mockReturnValueOnce(mockToken);
      mockTokenService.isTokenValid.mockReturnValueOnce(true);
      mockApiService.get.mockRejectedValueOnce(new Error("API Error"));

      await expect(authService.checkAuth(onTokenRefresh)).rejects.toThrow(
        "API Error"
      );
    });

    it("should throw generic error when API request fails with non-Error instance", async () => {
      mockTokenService.getToken.mockReturnValueOnce(mockToken);
      mockTokenService.isTokenValid.mockReturnValueOnce(true);
      mockApiService.get.mockRejectedValueOnce("Unknown error");

      await expect(authService.checkAuth(onTokenRefresh)).rejects.toThrow(
        "Authentication failed"
      );
    });
  });

  describe("refreshToken", () => {
    const mockToken = "old-token";

    it("should successfully refresh token", async () => {
      mockApiService.post.mockResolvedValueOnce(mockAuthResponse);

      const result = await authService.refreshToken(mockToken);

      expect(mockApiService.post).toHaveBeenCalledWith(
        "/auth/refresh",
        {},
        mockToken
      );
      expect(mockTokenService.setToken).toHaveBeenCalledWith(
        mockAuthResponse.accessToken
      );
      expect(result).toEqual(mockAuthResponse);
    });

    it("should throw error when refresh fails with Error instance", async () => {
      const error = new Error("Refresh failed");
      mockApiService.post.mockRejectedValueOnce(error);

      await expect(authService.refreshToken(mockToken)).rejects.toThrow(
        "Refresh failed"
      );
    });

    it("should throw generic error when refresh fails with non-Error instance", async () => {
      mockApiService.post.mockRejectedValueOnce("Unknown error");

      await expect(authService.refreshToken(mockToken)).rejects.toThrow(
        "Failed to refresh token"
      );
    });
  });

  describe("logout", () => {
    it("should clear refresh schedule and remove token", () => {
      authService.logout();

      expect(mockTokenService.clearRefreshSchedule).toHaveBeenCalled();
      expect(mockTokenService.removeToken).toHaveBeenCalled();
    });
  });
});
