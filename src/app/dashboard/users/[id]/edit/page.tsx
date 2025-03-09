"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { IoArrowBack } from "react-icons/io5";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useUsers, useRoles } from "@/hooks";

interface UserEditData {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  roles?: string[];
  isActive?: boolean;
  isAdmin?: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  roles: { id: string }[];
  isActive: boolean;
  isAdmin: boolean;
}

interface Role {
  id: string;
  name: string;
  description: string;
}

export default function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id: userId } = use(params);
  const {
    getOne: getUser,
    update: updateUser,
    updateRoles: updateUserRoles,
  } = useUsers();
  const { getAll: getAllRoles } = useRoles();
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserEditData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const token = localStorage.getItem("token") || "";
        const data = await getAllRoles(token);
        setAvailableRoles(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch roles");
      } finally {
        setLoadingRoles(false);
      }
    };

    fetchRoles();
  }, [getAllRoles]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token") || "";
        const data = await getUser(userId, token);
        setUser(data as User);
        setFormData({
          name: data.name,
          email: data.email,
          password: "",
          confirmPassword: "",
          roles: data.roles.map((role) => role.id),
          isActive: data.isActive,
          isAdmin: data.isAdmin,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch user");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId, getUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const token = localStorage.getItem("token") || "";

      // Validar se as senhas são iguais
      if (formData.password && formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        setSaving(false);
        return;
      }

      // Remove confirmPassword before sending to API
      const { confirmPassword, ...dataToSend } = formData;

      // Remove password if empty
      if (!dataToSend.password) {
        delete dataToSend.password;
      }

      // Update user data
      await updateUser(userId, dataToSend, token);

      // Update user roles if they have changed
      if (formData.roles && user?.roles) {
        const currentRoles = user.roles.map((role) => role.id);
        const newRoles = formData.roles;

        // Only update if the roles have changed
        if (
          JSON.stringify(currentRoles.sort()) !==
          JSON.stringify(newRoles.sort())
        ) {
          await updateUserRoles(userId, newRoles, token);
        }
      }

      setSuccessMessage("User updated successfully!");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  const handleRoleToggle = (roleId: string) => {
    const currentRoles = formData.roles || [];
    const newRoles = currentRoles.includes(roleId)
      ? currentRoles.filter((r) => r !== roleId)
      : [...currentRoles, roleId];
    setFormData({ ...formData, roles: newRoles });
  };

  if (loading || loadingRoles) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <strong className="font-bold">Error! </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-gray-800">User not found</h2>
        <p className="text-gray-600 mt-2">
          The requested user could not be found.
        </p>
        <button
          onClick={() => router.back()}
          className="mt-4 text-indigo-600 hover:text-indigo-800"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit User</h1>
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-900 flex items-center"
        >
          <IoArrowBack className="w-4 h-4 mr-1" />
          Back
        </button>
      </div>

      <div className="bg-white shadow rounded-lg p-8">
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <strong className="font-bold">Error! </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
            <strong className="font-bold">Success! </strong>
            <span className="block sm:inline">{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8" autoComplete="off">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                required
                autoComplete="off"
                className="mt-1 block w-full h-12 px-4 rounded-md border border-gray-300 text-blue-600 text-base shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter user name"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                required
                autoComplete="off"
                className="mt-1 block w-full h-12 px-4 rounded-md border border-gray-300 text-blue-600 text-base shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={formData.email || ""}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="Enter email address"
              />
            </div>

            <div>
              <label
                htmlFor="new-password"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="new-password"
                name="new-password"
                autoComplete="new-password"
                className="mt-1 block w-full h-12 px-4 rounded-md border border-gray-300 text-blue-600 text-base shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={formData.password || ""}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>

            <div>
              <label
                htmlFor="new-password-confirm"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                Confirm Password
              </label>
              <input
                type="password"
                id="new-password-confirm"
                name="new-password-confirm"
                autoComplete="new-password"
                className="mt-1 block w-full h-12 px-4 rounded-md border border-gray-300 text-blue-600 text-base shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={formData.confirmPassword || ""}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex items-center space-x-8">
            <div className="flex items-center">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                <span className="ml-3 text-sm font-medium text-gray-900">
                  Active
                </span>
              </label>
            </div>

            <div className="flex items-center">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={formData.isAdmin}
                  onChange={(e) =>
                    setFormData({ ...formData, isAdmin: e.target.checked })
                  }
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                <span className="ml-3 text-sm font-medium text-gray-900">
                  Admin
                </span>
              </label>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              User Roles
            </label>
            <div className="flex flex-wrap gap-2">
              {availableRoles.map((role) => (
                <label
                  key={role.id}
                  className="relative flex items-center p-2 hover:bg-blue-50 cursor-pointer rounded-md transition-colors group"
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={(formData.roles || []).includes(role.id)}
                      onChange={() => handleRoleToggle(role.id)}
                    />
                  </div>
                  <div className="ml-2">
                    <span className="font-medium text-blue-600 capitalize text-sm">
                      {role.name}
                    </span>
                    {role.description && (
                      <span className="hidden group-hover:block absolute bg-gray-800 text-white text-xs rounded py-1 px-2 left-1/2 transform -translate-x-1/2 translate-y-2 mt-1 w-max">
                        {role.description}
                      </span>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="bg-white py-3 px-6 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-indigo-600 text-white py-3 px-6 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center text-base font-medium"
            >
              {saving ? (
                <>
                  <AiOutlineLoading3Quarters className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
