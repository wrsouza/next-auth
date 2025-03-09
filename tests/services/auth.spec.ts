import { AuthService } from "../../src/services/auth";
import { TokenService } from "../../src/services/token";
import { api } from "../../src/services/api";
import { AuthResponse, User } from "../../src/services/interfaces";

jest.mock("../../src/services/api");
jest.mock("../../src/services/token");

describe("AuthService", () => {
  let authService: AuthService;
  let tokenService: TokenService;

  beforeEach(() => {
    tokenService = new TokenService();
    authService = new AuthService(tokenService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("login", () => {
    it("should login successfully and store token", async () => {
      // Arrange
      const mockResponse = {
        accessToken: "fake-token",
      };

      (api.post as jest.Mock).mockResolvedValueOnce(mockResponse);
      (tokenService.setToken as jest.Mock).mockImplementation(() => {});

      // Act & Assert
      await expect(
        authService.login("john@example.com", "password123")
      ).resolves.not.toThrow();

      expect(api.post).toHaveBeenCalledWith("/auth", {
        email: "john@example.com",
        password: "password123",
      });
      expect(tokenService.setToken).toHaveBeenCalledWith("fake-token");
    });

    it("should throw error on login failure", async () => {
      // Arrange
      const errorMessage = "Invalid credentials";
      (api.post as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

      // Act & Assert
      await expect(
        authService.login("wrong@example.com", "wrongpass")
      ).rejects.toThrow(errorMessage);
    });
  });

  describe("logout", () => {
    it("should clear token and schedule", () => {
      // Arrange
      (tokenService.removeToken as jest.Mock).mockImplementation(() => {});
      (tokenService.clearRefreshSchedule as jest.Mock).mockImplementation(
        () => {}
      );

      // Act
      authService.logout();

      // Assert
      expect(tokenService.removeToken).toHaveBeenCalled();
      expect(tokenService.clearRefreshSchedule).toHaveBeenCalled();
    });
  });

  describe("checkAuth", () => {
    it("should check auth status and schedule token refresh", async () => {
      // Arrange
      const mockUser: User = {
        id: "1",
        name: "John Doe",
        email: "john@example.com",
        roles: ["admin"],
        isActive: true,
        isAdmin: true,
      };

      const mockCallback = jest.fn();
      const mockToken = "fake-token";

      (tokenService.getToken as jest.Mock).mockReturnValue(mockToken);
      (tokenService.isTokenValid as jest.Mock).mockReturnValue(true);
      (api.get as jest.Mock).mockResolvedValueOnce(mockUser);
      (tokenService.scheduleTokenRefresh as jest.Mock).mockImplementation(
        () => {}
      );

      // Act
      const result = await authService.checkAuth(mockCallback);

      // Assert
      expect(tokenService.getToken).toHaveBeenCalled();
      expect(tokenService.isTokenValid).toHaveBeenCalledWith(mockToken);
      expect(api.get).toHaveBeenCalledWith("/auth", mockToken);
      expect(tokenService.scheduleTokenRefresh).toHaveBeenCalledWith(
        mockToken,
        mockCallback
      );
      expect(result).toEqual(mockUser);
    });

    it("should throw error when no token is available", async () => {
      // Arrange
      (tokenService.getToken as jest.Mock).mockReturnValue(null);

      // Act & Assert
      await expect(authService.checkAuth(() => {})).rejects.toThrow(
        "No token found"
      );
    });

    it("should throw error when token is invalid", async () => {
      // Arrange
      const mockToken = "invalid-token";
      (tokenService.getToken as jest.Mock).mockReturnValue(mockToken);
      (tokenService.isTokenValid as jest.Mock).mockReturnValue(false);
      (tokenService.removeToken as jest.Mock).mockImplementation(() => {});

      // Act & Assert
      await expect(authService.checkAuth(() => {})).rejects.toThrow(
        "Token expired"
      );
      expect(tokenService.removeToken).toHaveBeenCalled();
    });
  });

  describe("refreshToken", () => {
    it("should refresh token successfully", async () => {
      // Arrange
      const oldToken = "old-token";
      const mockResponse: AuthResponse = {
        accessToken: "new-token",
      };

      (api.post as jest.Mock).mockResolvedValueOnce(mockResponse);
      (tokenService.setToken as jest.Mock).mockImplementation(() => {});

      // Act
      const result = await authService.refreshToken(oldToken);

      // Assert
      expect(api.post).toHaveBeenCalledWith("/auth/refresh", {}, oldToken);
      expect(tokenService.setToken).toHaveBeenCalledWith(
        mockResponse.accessToken
      );
      expect(result).toEqual(mockResponse);
    });

    it("should throw error when refresh fails", async () => {
      // Arrange
      const oldToken = "old-token";
      const errorMessage = "Failed to refresh token";
      (api.post as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

      // Act & Assert
      await expect(authService.refreshToken(oldToken)).rejects.toThrow(
        errorMessage
      );
    });
  });
});
