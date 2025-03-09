export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  isAdmin: boolean;
  isActive?: boolean;
  roles: string[];
  permissions?: string[];
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

export interface Permission {
  id: string;
  name: string;
  description: string;
}

export interface AuthResponse {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  roles: string[];
  permissions: string[];
  accessToken: string;
}
