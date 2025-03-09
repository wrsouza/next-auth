"use client";

import { useAuthContext } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { AiOutlineHome, AiOutlineTeam } from "react-icons/ai";
import { MdOutlineSecurity, MdOutlineAdminPanelSettings } from "react-icons/md";
import { IoLogOutOutline } from "react-icons/io5";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuthContext();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const menuItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <AiOutlineHome className="w-5 h-5" />,
    },
    {
      name: "Users",
      href: "/dashboard/users/list",
      icon: <AiOutlineTeam className="w-5 h-5" />,
      permission: "users:list",
    },
    {
      name: "Roles",
      href: "/dashboard/roles/list",
      icon: <MdOutlineSecurity className="w-5 h-5" />,
      permission: "roles:list",
    },
    {
      name: "Permissions",
      href: "/dashboard/permissions/list",
      icon: <MdOutlineAdminPanelSettings className="w-5 h-5" />,
      permission: "permissions:list",
    },
  ];

  const hasPermission = (permission?: string) => {
    if (!permission) return true;
    if (user.isAdmin) return true;
    return user.permissions?.includes(permission);
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
          <div className="mt-2 flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium">
                {user.email?.[0]?.toUpperCase() || "U"}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{user.email}</p>
              <p className="text-xs text-gray-500">
                {user.isAdmin ? "Administrator" : "User"}
              </p>
            </div>
          </div>
        </div>
        <nav className="p-4 space-y-1">
          {menuItems
            .filter((item) => hasPermission(item.permission))
            .map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-150 ${
                  pathname === item.href
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <span
                  className={`mr-3 ${
                    pathname === item.href ? "text-blue-600" : ""
                  }`}
                >
                  {item.icon}
                </span>
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
          <button
            onClick={logout}
            className="flex items-center w-full px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-150"
          >
            <IoLogOutOutline className="w-5 h-5 mr-3" />
            <span className="font-medium">Logout</span>
          </button>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1">
        <div className="py-6 px-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
