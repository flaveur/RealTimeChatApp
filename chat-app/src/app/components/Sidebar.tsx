'use client';

import { rwsdk } from "@/app/lib/rwsdk";
import { applyTheme } from "@/app/lib/theme";
import { MessageSquare, Settings, StickyNote, Users } from "lucide-react";
import { useEffect, useState } from "react";

export default function Sidebar() {
  useEffect(() => applyTheme(), []);
  const [user, setUser] = useState(() => rwsdk.auth.useCurrentUser());

  // Lytt til endringer i brukerdata (inkludert status)
  useEffect(() => {
    const unsub = rwsdk.auth.onChange(() => {
      setUser(rwsdk.auth.useCurrentUser());
    });
    return unsub;
  }, []);

  const items = [
    { label: "Meldinger", icon: MessageSquare, href: "/messages" },
    { label: "Venneliste", icon: Users, href: "/friends" },
    { label: "Mine notater", icon: StickyNote, href: "/notes" },
    { label: "Innstillinger", icon: Settings, href: "/settings" },
  ];

  const statusColor: Record<string, string> = {
    online: "bg-green-500",
    busy: "bg-red-500",
    away: "bg-yellow-400",
    offline: "bg-gray-400",
  };

  const statusLabel: Record<string, string> = {
    online: "Tilgjengelig",
    busy: "Opptatt",
    away: "Borte",
    offline: "Frakoblet",
  };

  function getInitials(name?: string) {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  const userStatus = user?.status ?? "offline";

  const [pathname, setPathname] = useState<string>(typeof window !== "undefined" ? window.location.pathname : "");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onPop = () => setPathname(window.location.pathname);
    window.addEventListener("popstate", onPop);
    // also listen for pushState/replaceState if your app uses them
    const origPush = history.pushState;
    history.pushState = function (...args) {
      // @ts-ignore
      const ret = origPush.apply(this, args);
      setPathname(window.location.pathname);
      return ret;
    };
    return () => {
      window.removeEventListener("popstate", onPop);
      history.pushState = origPush;
    };
  }, []);

  return (
    <nav className="flex flex-col gap-4 md:gap-6">
      {/* Profilkort - Kun desktop */}
      <header className="hidden md:block rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4">
        <div className="flex items-center gap-3 mb-3">
          <figure className="relative h-12 w-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center select-none flex-shrink-0">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={`${user.name}'s avatar`}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <span className="text-sm font-bold text-white">
                {getInitials(user?.name)}
              </span>
            )}
            <span
              title={statusLabel[userStatus]}
              className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-gray-50 dark:border-gray-800 ${statusColor[userStatus]}`}
            />
          </figure>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
              {user?.name ?? "Gjest"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {statusLabel[userStatus]}
            </p>
          </div>
        </div>
        <a
          href="/settings"
          className="block w-full text-center text-xs px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          Rediger profil
        </a>
      </header>

      {/* Navigasjon - Horisontal på mobil, vertikal på desktop */}
      <ul className="flex md:flex-col justify-around md:justify-start md:space-y-1">
        {items.map(({ label, icon: Icon, href }) => {
          const active = pathname === href;
          return (
            <li key={href} className="flex-1 md:flex-none">
              <a
                href={href}
                onClick={(e) => {
                  // basic SPA navigation: prevent full reload if possible
                  if (typeof window !== "undefined") {
                    e.preventDefault();
                    try {
                      history.pushState({}, "", href);
                      setPathname(href);
                    } catch {}
                  }
                }}
                className={`flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 px-2 md:px-4 py-2 md:py-2 rounded-lg transition ${
                  active
                    ? "bg-blue-600 text-white dark:bg-blue-600"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <Icon className="w-5 h-5 md:w-5 md:h-5" />
                <span className="text-xs md:text-base">{label}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
