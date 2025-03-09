"use client";

import {
  FaRegUser,
  FaRegEnvelope,
  FaShieldAlt,
  FaChartBar,
  FaUsersCog,
  FaCheckCircle,
  FaCrown,
  FaUserTag,
} from "react-icons/fa";
import { useAuthContext } from "../../contexts/AuthContext";

export default function DashboardPage() {
  const { user } = useAuthContext();

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center space-x-4 mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg">
          <FaRegUser className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {user?.name}!
          </h1>
          <p className="text-gray-600 mt-1">
            Here&apos;s your dashboard overview
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Information */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-6">
            <FaUsersCog className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              Profile Information
            </h2>
          </div>
          <div className="space-y-6">
            <div className="flex items-start space-x-3">
              <FaRegUser className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Name
                </label>
                <p className="mt-1 text-base text-gray-900 font-medium">
                  {user?.name}
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <FaRegEnvelope className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Email
                </label>
                <p className="mt-1 text-base text-gray-900 font-medium">
                  {user?.email}
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <FaUserTag className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <label className="block text-md font-medium text-gray-600">
                  Roles
                </label>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex flex-wrap gap-2">
                {user?.roles?.map((role) => (
                  <span
                    key={role}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100"
                  >
                    {role === "admin" ? (
                      <FaCrown className="w-3 h-3 mr-1 text-amber-500" />
                    ) : (
                      <FaShieldAlt className="w-3 h-3 mr-1" />
                    )}
                    {role}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-6">
            <FaChartBar className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Quick Stats</h2>
          </div>
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-blue-600">
                    Role Count
                  </h3>
                  <p className="mt-2 text-4xl font-bold text-blue-900">
                    {user?.roles?.length || 0}
                  </p>
                  <p className="mt-1 text-sm text-blue-600">
                    Active roles assigned
                  </p>
                </div>
                <FaShieldAlt className="w-12 h-12 text-blue-200" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-green-600">
                    Account Status
                  </h3>
                  <p className="mt-2 text-2xl font-bold text-green-900 flex items-center">
                    <FaCheckCircle className="w-5 h-5 mr-2" />
                    Active
                  </p>
                  <p className="mt-1 text-sm text-green-600">
                    Your account is in good standing
                  </p>
                </div>
                <FaUsersCog className="w-12 h-12 text-green-200" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
