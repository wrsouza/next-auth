import { api } from "@/services/api";
import { Permission } from "@/types";

export function usePermissions() {
  const getAll = async (token: string) => {
    return api.get<Permission[]>("/permissions", token);
  };

  const getOne = async (id: string, token: string) => {
    return api.get<Permission>(`/permissions/${id}`, token);
  };

  const create = async (data: Omit<Permission, "id">, token: string) => {
    return api.post<Permission>("/permissions", data, token);
  };

  const update = async (
    id: string,
    data: Partial<Omit<Permission, "id">>,
    token: string
  ) => {
    return api.put<Permission>(`/permissions/${id}`, data, token);
  };

  const remove = async (id: string, token: string) => {
    return api.delete<void>(`/permissions/${id}`, token);
  };

  return {
    getAll,
    getOne,
    create,
    update,
    remove,
  };
}
