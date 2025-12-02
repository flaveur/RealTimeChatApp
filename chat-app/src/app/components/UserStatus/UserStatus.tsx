"use client";

import { rwsdk, type Status } from "@/app/lib/rwsdk";
import { useEffect, useState } from "react";

export default function UserStatus() {
  const [user, setUser] = useState<ReturnType<typeof rwsdk.auth.useCurrentUser>>(
    () => rwsdk.auth.useCurrentUser()
  );

  useEffect(() => {
    const unsub = rwsdk.auth.onChange(() => setUser(rwsdk.auth.useCurrentUser()));
    return () => unsub();
  }, []);

  const statusLabel: Record<Status, string> = {
    online: "Tilgjengelig",
    busy: "Opptatt",
    away: "Borte",
    offline: "Frakoblet",
  };

  const statusColor: Record<Status, string> = {
    online: "bg-green-500",
    busy: "bg-red-500",
    away: "bg-yellow-500",
    offline: "bg-gray-500",
  };

  const userStatus: Status = user?.status ?? "offline";

  return (
    <div className="flex items-center space-x-2">
      <span
        className={`h-3.5 w-3.5 rounded-full ${statusColor[userStatus]}`}
        title={statusLabel[userStatus]}
      />
      <span className="text-sm font-medium text-gray-900 dark:text-white">
        {statusLabel[userStatus]}
      </span>
    </div>
  );
}