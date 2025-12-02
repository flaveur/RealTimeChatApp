'use client';

import "./UserStatus.css";
import { useEffect, useState } from 'react';

interface User {
  id: number;
  username: string;
  name?: string;
  status: string;
  avatarUrl?: string;
}

export default function UserStatus() {
  const [me, setMe] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const res = await fetch("/api/me", { credentials: "same-origin" });
      if (res.ok) {
        const data = await res.json();
        setMe(data);
      }
    } catch (err) {
      console.error("Feil ved henting av bruker:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <aside className="userstatus-loading">Laster brukerstatus...</aside>
    );
  }

  if (!me) {
    return (
      <aside className="userstatus-loading">Ingen bruker funnet</aside>
    );
  }

  const labels: Record<string, string> = {
    online: 'Tilgjengelig',
    busy: 'Opptatt',
    away: 'Borte',
    offline: 'Frakoblet',
  };

  const getInitials = () => {
    if (me.name) return me.name[0]?.toUpperCase();
    if (me.username) return me.username[0]?.toUpperCase();
    return "?";
  };

  return (
    <section aria-label="Brukerstatus" className="userstatus-root">
      <figure className="userstatus-avatar" aria-hidden>
        {me.avatarUrl ? (
          <img src={me.avatarUrl} alt="" className="userstatus-avatar-img" />
        ) : (
          <span className="userstatus-avatar-initials">{getInitials()}</span>
        )}
        <span 
          className={`userstatus-indicator userstatus-${me.status}`} 
          title={labels[me.status] || me.status} 
        />
      </figure>

      <article className="userstatus-content">
        <h2 className="userstatus-name">{me.name || me.username}</h2>
        <p className="userstatus-label">{labels[me.status] || me.status}</p>
      </article>
    </section>
  );
}
