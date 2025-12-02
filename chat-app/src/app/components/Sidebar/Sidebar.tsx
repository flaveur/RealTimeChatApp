'use client';

import { rwsdk } from "@/app/lib/rwsdk";
import { applyTheme } from "@/app/lib/theme";
import { MessageSquare, Settings, StickyNote, Users } from "lucide-react";
import { useEffect, useState } from "react";

export default function Sidebar() {
  useEffect(() => applyTheme(), []);
  const [user, setUser] = useState(() => rwsdk.auth.useCurrentUser());

  return (
    <div>
      {/* Sidebar content goes here */}
      <p>Sidebar Component</p>
    </div>
  );
}