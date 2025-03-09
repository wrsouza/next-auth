"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRoles } from "@/hooks";
import { usePermissions } from "@/hooks";
import type { Role, Permission } from "@/types";
import { use } from "react";
import { IoArrowBack } from "react-icons/io5";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

interface RoleEditData {
  name?: string;
  description?: string;
  permissions?: string[];
}

export default function EditRolePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id: roleId } = use(params);
  const { getOne, update } = useRoles();
  const { getAll: getAllPermissions } = usePermissions();
  const [role, setRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState<RoleEditData>({});
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const token = localStorage.getItem("token") || "";
        const data = await getOne(roleId, token);
        setRole(data);
        setFormData({
          name: data.name,
          description: data.description,
          permissions: data.permissions,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch role");
      }
    };

    const fetchPermissions = async () => {
      try {
        const token = localStorage.getItem("token") || "";
        const data = await getAllPermissions(token);
        setPermissions(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch permissions"
        );
      }
    };

    Promise.all([fetchRole(), fetchPermissions()]).finally(() =>
      setLoading(false)
    );
  }, [roleId, getOne, getAllPermissions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const token = localStorage.getItem("token") || "";
      await update(roleId, formData, token);
      setSuccessMessage("Role updated successfully!");
      setTimeout(() => {
        router.push("/dashboard/roles/list");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update role");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error && !role) {
    return (
      <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        <strong className="font-bold">Error! </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-gray-800">Role not found</h2>
        <p className="text-gray-600 mt-2">
          The requested role could not be found.
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
        <h1 className="text-2xl font-bold text-gray-900">Edit Role</h1>
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
          <div className="grid grid-cols-1 gap-8">
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
                name="name"
                required
                autoComplete="off"
                className="mt-1 block w-full h-12 px-4 rounded-md border border-gray-300 text-blue-600 text-base shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={3}
                autoComplete="off"
                className="mt-1 block w-full px-4 py-3 rounded-md border border-gray-300 text-blue-600 text-base shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Permissions
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {permissions.map((permission) => (
                  <label
                    key={permission.id}
                    className="relative flex items-center p-2 hover:bg-blue-50 cursor-pointer rounded-md transition-colors group"
                  >
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={formData.permissions?.includes(permission.id)}
                        onChange={(e) => {
                          const isChecked = e.target.checked;
                          setFormData((prev) => ({
                            ...prev,
                            permissions: isChecked
                              ? [...(prev.permissions || []), permission.id]
                              : prev.permissions?.filter(
                                  (id) => id !== permission.id
                                ),
                          }));
                        }}
                      />
                    </div>
                    <div className="ml-2">
                      <span className="font-medium text-blue-600 capitalize text-sm">
                        {permission.name}
                      </span>
                      {permission.description && (
                        <span className="hidden group-hover:block absolute bg-gray-800 text-white text-xs rounded py-1 px-2 left-1/2 transform -translate-x-1/2 translate-y-2 mt-1 w-max z-10">
                          {permission.description}
                        </span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
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
