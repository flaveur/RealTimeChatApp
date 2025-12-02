'use client';

import "./UserStatus.css";
import { useEffect, useState, useSyncExternalStore } from 'react';
import { rwsdk, type Status } from "@/app/lib/rwsdk";

export default function UserStatus() {
  const [loading, setLoading] = useState(!rwsdk.auth.isInitialized());
  
  // Lytt på endringer i rwsdk state
  const me = useSyncExternalStore(
    rwsdk.auth.onChange,
    () => rwsdk.auth.useCurrentUser(),
    () => rwsdk.auth.useCurrentUser()
  );

  // Hent brukerdata ved oppstart hvis ikke allerede hentet
  useEffect(() => {
    if (!rwsdk.auth.isInitialized()) {
      rwsdk.auth.fetchCurrentUser().finally(() => setLoading(false));
    }
  }, []);

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

  const labels: Record<Status, string> = {
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
        <p className="userstatus-label">
          {labels[me.status] || me.status}
          {me.statusText && <span className="userstatus-text"> · {me.statusText}</span>}
        </p>
      </article>
    </section>
  );
}
