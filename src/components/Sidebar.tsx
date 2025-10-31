'use client';

import { rwsdk } from "@/app/lib/rwdsk";
import { applyTheme } from "@/app/lib/theme";
import { MessageSquare, Settings, StickyNote, Users } from "lucide-react";
import { useEffect } from "react";
import UserStatus from "./UserStatus";

export default function Sidebar() {
  // Ensure html.dark is applied on every page that renders the sidebar
  useEffect(() => {
    applyTheme();
  }, []);

  const me = rwsdk.auth.useCurrentUser();
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/messages';
  
  const items = [
    { label: "Meldinger", icon: MessageSquare, href: "/messages" },
    { label: "Venneliste", icon: Users, href: "/friendlist" },
    { label: "Mine notater", icon: StickyNote, href: "/notespage" },
    { label: "Innstillinger", icon: Settings, href: "/settings" }
  ];

  return (
    <aside aria-label="Hovedmeny" className="w-64 shrink-0 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <header className="px-4 pt-6 pb-4">
        <a href="/" className="inline-flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-brand-blue dark:text-blue-400" aria-hidden />
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Real-Time Chat</h1>
        </a>
      </header>

      <UserStatus 
        name={me?.name ?? "Bruker"}
        status={me?.status ?? "online"}
      />

      <nav className="px-2">
        <ul className="space-y-1">
          {items.map(({label, icon:Icon, href}) => {
            const isActive = currentPath === href || (href === "/messages" && currentPath === "/");
            return (
              <li key={label}>
                <a
                  href={href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors
                    ${isActive 
                      ? "bg-blue-50 dark:bg-blue-950 text-brand-blue dark:text-blue-400" 
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  <span>{label}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
