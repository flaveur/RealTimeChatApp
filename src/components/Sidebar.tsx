'use client';

import { rwsdk } from "@/app/lib/rwsdk";
import { applyTheme } from "@/app/lib/theme";
import { MessageSquare, Settings, StickyNote, Users } from "lucide-react";
import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  useEffect(() => applyTheme(), []);
  const me = rwsdk.auth.useCurrentUser();
  const location = useLocation();

  const items = [
    { label: "Meldinger", icon: MessageSquare, href: "/messages" },
    { label: "Venneliste", icon: Users, href: "/friends" },
    { label: "Mine notater", icon: StickyNote, href: "/notes" },
    { label: "Innstillinger", icon: Settings, href: "/settings" },
  ];

  return (
    <nav className="flex flex-col gap-4">
      <header>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Real-Time Chat</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">{me?.name ?? "Bruker"}</p>
      </header>

      <ul className="space-y-1">
        {items.map(({ label, icon: Icon, href }) => {
          const active = location.pathname === href;
          return (
            <li key={href}>
              <Link
                to={href}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                  active
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
