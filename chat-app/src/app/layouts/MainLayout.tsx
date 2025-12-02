import { logout } from "@/app/api/auth/authServerActions";
import { AuthProvider } from "@/app/context/AuthProvider";
import type { LayoutProps } from "rwsdk/router";
import { Navigation } from "@/app/components/shared/Navigation";
import Sidebar from "@/app/components/Sidebar/Sidebar";

export async function MainLayout({ children, requestInfo }: LayoutProps) {
  const user = requestInfo?.ctx.user ?? null;
  const session = requestInfo?.ctx.session;

  const isExpired = session && session.expiresAt < new Date();

  if (isExpired) {
    await logout();
  }

  return (
    <div className="flex h-screen bg-gray-950">
      <Sidebar />
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}

export default MainLayout;
