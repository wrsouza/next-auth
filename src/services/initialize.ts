import { ServiceFactory } from "./factory";

let initialized = false;

export function initializeServices(): void {
  if (initialized) {
    return;
  }

  ServiceFactory.initializeServices();
  initialized = true;
}
