import { Container, injectable } from "inversify";
import { TokenService } from "./token.service";
import { AuthService } from "./auth.service";
import { ApiService } from "./api.service";
import { TYPES } from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor = new (...args: any[]) => any;

type ServiceBinding = {
  type: symbol;
  implementation: Constructor;
};

@injectable()
export class ContainerService extends Container {
  private static instance: ContainerService;
  private initialized = false;

  private constructor() {
    super({ defaultScope: "Singleton" });
  }

  public static getInstance(): ContainerService {
    if (!ContainerService.instance) {
      ContainerService.instance = new ContainerService();
    }
    return ContainerService.instance;
  }

  private bindService(binding: ServiceBinding): void {
    if (!this.isBound(binding.type)) {
      this.bind(binding.type).to(binding.implementation).inSingletonScope();
    }
  }

  public initialize(): void {
    if (this.initialized) return;

    // Define service bindings
    const serviceBindings: ServiceBinding[] = [
      { type: TYPES.API_SERVICE, implementation: ApiService },
      { type: TYPES.TOKEN_SERVICE, implementation: TokenService },
      { type: TYPES.AUTH_SERVICE, implementation: AuthService },
    ];

    // Bind all services
    serviceBindings.forEach((binding) => this.bindService(binding));

    this.initialized = true;
  }

  public getService<T>(serviceType: symbol): T {
    this.initialize();
    return this.get<T>(serviceType);
  }
}

// Export singleton instance
export const containerService = ContainerService.getInstance();
