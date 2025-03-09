import { api } from "@/services";
import { User } from "@/types";

export function useUsers() {
  const getAll = async (token: string) => {
    return api.get<User[]>("/users", token);
  };

  const getOne = async (id: string, token: string) => {
    return api.get<User>(`/users/${id}`, token);
  };

  const create = async (data: Omit<User, "id">, token: string) => {
    return api.post<User>("/users", data, token);
  };

  const update = async (
    id: string,
    data: Partial<Omit<User, "id">>,
    token: string
  ) => {
    return api.put<User>(`/users/${id}`, data, token);
  };

  const remove = async (id: string, token: string) => {
    return api.delete<void>(`/users/${id}`, token);
  };

  const updateRoles = async (id: string, roles: string[], token: string) => {
    return api.put<User>(`/users/${id}/roles`, { roles }, token);
  };

  return {
    getAll,
    getOne,
    create,
    update,
    remove,
    updateRoles,
  };
}
