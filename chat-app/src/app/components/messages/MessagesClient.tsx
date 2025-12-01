"use client";
import "./messages.css";

import React from "react";

export default function MessagesClient() {
  const [messages, setMessages] = React.useState<any[]>([]);
  const [text, setText] = React.useState("");

  React.useEffect(() => {
    fetch("/api/messages")
      .then((r) => r.json())
      .then((data) => setMessages(Array.isArray(data) ? data : []))
      .catch(() => setMessages([]));
  }, []);

  async function send() {
    if (!text) return;
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: 1, body: text }),
    });
    if (res.ok) {
      setText("");
      const result = await fetch("/api/messages");
      const data = await result.json();
      setMessages(Array.isArray(data) ? data : []);
    }
  }

  return (
    <div className="messages-root">
      <h1 className="text-2xl mb-4">Messages</h1>
      <div className="messages-list">
        {messages.map((m) => (
          <div key={m.id} className="message-item">
            <div className="text-sm text-gray-500">User {m.userId}</div>
            <div className="mt-1">{m.body}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input className="message-input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a message" />
        <button className="message-send" onClick={send}>Send</button>
      </div>
    </div>
  );
}

