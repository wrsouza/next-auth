import { ServiceFactory } from "@/services/factory";
import { initializeServices } from "@/services/initialize";

export function useAuth() {
  // Ensure services are initialized
  initializeServices();

  const authService = ServiceFactory.getAuthService();
  return {
    login: authService.login.bind(authService),
    getProfile: authService.checkAuth.bind(authService),
    refreshToken: authService.refreshToken.bind(authService),
  };
}
