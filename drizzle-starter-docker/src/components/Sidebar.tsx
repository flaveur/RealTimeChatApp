'use client';

import { rwsdk } from "@/app/lib/rwdsk";
import { MessageSquare, Settings, StickyNote, Users } from "lucide-react";
import UserStatus from "./UserStatus";

export default function Sidebar() {
  const me = rwsdk.auth.useCurrentUser();
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/messages';
  
  const items = [
    { label: "Meldinger", icon: MessageSquare, href: "/messages" },
    { label: "Venneliste", icon: Users, href: "/friends" },
    { label: "Mine notater", icon: StickyNote, href: "/notes" },
    { label: "Innstillinger", icon: Settings, href: "/settings" }
  ];

  return (
    <aside aria-label="Hovedmeny" className="w-64 shrink-0 border-r bg-white">
      <header className="px-4 pt-6 pb-4">
        <a href="/" className="inline-flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-brand-blue" aria-hidden />
          <h1 className="text-lg font-semibold">Real-Time Chat</h1>
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
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm
                    ${isActive ? "bg-blue-50 text-brand-blue" : "text-gray-700 hover:bg-gray-50"}`}
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
