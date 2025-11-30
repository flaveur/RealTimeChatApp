"use client";

import type { SafeUser } from "@/db/schema/user-schema";
import { logout } from "@/app/api/auth/authServerActions";
import { isAdmin, isUser } from "@/app/lib/auth/role";

export function Navigation({ user }: { user: SafeUser | null }) {
  const userIsAdmin = isAdmin(user);
  const userIsAuthenticated = isUser(user);

  const handleLogout = async () => {
    try {
      const result = await logout();
      if (result.success) {
        window.location.href = "/auth/login";
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <a href="/" className="text-xl font-bold text-gray-900">
              Spørsmålplattformen
            </a>

            <div className="hidden md:flex items-center space-x-4">
              <a
                href="/questions"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium"
              >
                Spørsmål
              </a>

              {userIsAuthenticated && (
                <a
                  href="/questions/new"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                >
                  Nytt spørsmål
                </a>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {userIsAuthenticated ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-700">Hei, {user?.username}</span>

                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    userIsAdmin ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {user?.role?.toUpperCase()}
                </span>

                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                >
                  Logg ut
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <a
                  href="/auth/login"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                >
                  Logg inn
                </a>
                <a
                  href="/auth/register"
                  className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Registrer
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
