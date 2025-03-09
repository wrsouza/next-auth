export class Container {
  private static instance: Container;
  private services: Map<string, unknown>;

  private constructor() {
    this.services = new Map();
  }

  public static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  public register<T>(token: string, service: T): void {
    this.services.set(token, service);
  }

  public resolve<T>(token: string): T {
    const service = this.services.get(token);
    if (!service) {
      throw new Error(`Service ${token} not found in container`);
    }
    return service as T;
  }
}

// Service tokens as const to ensure type safety
export const SERVICE_TOKENS = {
  TOKEN_SERVICE: "TOKEN_SERVICE",
  AUTH_SERVICE: "AUTH_SERVICE",
} as const;

// Type for service tokens
export type ServiceToken = (typeof SERVICE_TOKENS)[keyof typeof SERVICE_TOKENS];
