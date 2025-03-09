"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePermissions } from "@/hooks";
import type { Permission } from "@/types";
import { use } from "react";
import { IoArrowBack } from "react-icons/io5";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

interface PermissionEditData {
  name?: string;
  description?: string;
}

export default function EditPermissionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id: permissionId } = use(params);
  const { getOne, update } = usePermissions();
  const [permission, setPermission] = useState<Permission | null>(null);
  const [formData, setFormData] = useState<PermissionEditData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchPermission = async () => {
      try {
        const token = localStorage.getItem("token") || "";
        const data = await getOne(permissionId, token);
        setPermission(data);
        setFormData({
          name: data.name,
          description: data.description,
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch permission"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPermission();
  }, [permissionId, getOne]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const token = localStorage.getItem("token") || "";
      await update(permissionId, formData, token);
      setSuccessMessage("Permission updated successfully!");
      setTimeout(() => {
        router.push("/dashboard/permissions/list");
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update permission"
      );
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

  if (error && !permission) {
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

  if (!permission) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-gray-800">
          Permission not found
        </h2>
        <p className="text-gray-600 mt-2">
          The requested permission could not be found.
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
        <h1 className="text-2xl font-bold text-gray-900">Edit Permission</h1>
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-900 flex items-center"
        >
          <IoArrowBack className="w-4 h-4 mr-1" />
          Back
        </button>
      </div>

      <div className="bg-white shadow rounded-lg p-8">
        {successMessage && (
          <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
            <strong className="font-bold">Success! </strong>
            <span className="block sm:inline">{successMessage}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <strong className="font-bold">Error! </strong>
            <span className="block sm:inline">{error}</span>
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
                required
                autoComplete="off"
                className="mt-1 block w-full h-12 px-4 rounded-md border border-gray-300 text-blue-600 text-base shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
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
                required
                rows={3}
                autoComplete="off"
                className="mt-1 block w-full px-4 py-3 rounded-md border border-gray-300 text-blue-600 text-base shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
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
