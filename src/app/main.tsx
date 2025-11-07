import * as ReactDOMClient from "react-dom/client";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import "./styles.css";

import FriendList from "./pages/FriendList";
import Login from "./pages/Login";
import Messages from "./pages/Messages";
import NotesPage from "./pages/NotesPage";
import Register from "./pages/Register";
import Settings from "./pages/Settings";

function App() {
  return (
    <BrowserRouter>
      <div className="p-6">
        <Routes>
          {/* Redirect fra / til /login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/friends" element={<FriendList />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

const container = document.getElementById("root");
if (container) {
  const root = ReactDOMClient.createRoot(container);
  root.render(<App />);
}
