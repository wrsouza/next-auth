import { api } from "@/services";
import { Role } from "@/types";

export function useRoles() {
  const getAll = async (token: string) => {
    return api.get<Role[]>("/roles", token);
  };

  const getOne = async (id: string, token: string) => {
    return api.get<Role>(`/roles/${id}`, token);
  };

  const create = async (data: Omit<Role, "id">, token: string) => {
    return api.post<Role>("/roles", data, token);
  };

  const update = async (
    id: string,
    data: Partial<Omit<Role, "id">>,
    token: string
  ) => {
    return api.put<Role>(`/roles/${id}`, data, token);
  };

  const remove = async (id: string, token: string) => {
    return api.delete<void>(`/roles/${id}`, token);
  };

  const updatePermissions = async (
    id: string,
    permissions: string[],
    token: string
  ) => {
    return api.put<Role>(`/roles/${id}/permissions`, { permissions }, token);
  };

  return {
    getAll,
    getOne,
    create,
    update,
    remove,
    updatePermissions,
  };
}
