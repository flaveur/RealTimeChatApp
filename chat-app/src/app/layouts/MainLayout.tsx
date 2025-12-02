import { logout } from "@/app/api/auth/authServerActions";
import { AuthProvider } from "@/app/context/AuthProvider";
import type { LayoutProps } from "rwsdk/router";
import Sidebar from "@/app/components/Sidebar/Sidebar";
import MobileNav from "@/app/components/shared/MobileNav";

export async function MainLayout({ children, requestInfo }: LayoutProps) {
  const user = requestInfo?.ctx.user ?? null;
  const session = requestInfo?.ctx.session;

  const isExpired = session && session.expiresAt < new Date();

  if (isExpired) {
    await logout();
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <main className="flex-1 overflow-hidden pb-16 md:pb-0">{children}</main>
      <MobileNav />
    </div>
  );
}

export default MainLayout;
