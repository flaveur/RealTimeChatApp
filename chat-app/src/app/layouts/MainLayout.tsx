import { logout } from "@/app/api/auth/authServerActions";
import { AuthProvider } from "@/app/context/AuthProvider";
import type { LayoutProps } from "rwsdk/router";
import { Navigation } from "@/app/components/shared/Navigation";

export async function MainLayout({ children, requestInfo }: LayoutProps) {
  const user = requestInfo?.ctx.user ?? null;
  const session = requestInfo?.ctx.session;

  const isExpired = session && session.expiresAt < new Date();

  if (isExpired) {
    await logout();
  }

  return (
    <>
      {/* <AuthProvider initialUser={user}> */}
      <header className="bg-white shadow-sm border-b">
        <Navigation user={user} />
      </header>
      <div>
        <main>{children}</main>
      </div>
      {/* </AuthProvider> */}
    </>
  );
}

export default MainLayout;
