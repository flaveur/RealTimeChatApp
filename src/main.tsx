import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { applyTheme } from "./app/lib/theme";

import FriendsPage from "./app/pages/FriendList";
import Login from "./app/pages/Login";
import Messages from "./app/pages/Messages";
import NotesPage from "./app/pages/NotesPage";
import Register from "./app/pages/Register";
import Settings from "./app/pages/Settings";

export default function App() {
  useEffect(() => applyTheme(), []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Standard redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Auth sider */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* App sider */}
        <Route path="/messages" element={<Messages />} />
        <Route path="/friends" element={<FriendsPage />} />
        <Route path="/notes" element={<NotesPage />} />
        <Route path="/settings" element={<Settings />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/messages" replace />} />
      </Routes>
    </BrowserRouter>
  );
}