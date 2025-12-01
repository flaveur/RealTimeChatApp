'use client';

import "./SettingsComponent.css";
import { useEffect, useState } from 'react';
import { Button } from '@/app/components/ui/Button';
import UserStatus from '@/app/components/shared/UserStatus';
import { rwsdk } from '@/app/lib/rwsdk';

export default function SettingsComponent() {
  const me = rwsdk.auth.useCurrentUser?.() ?? null;
  const [name, setName] = useState(me?.name ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(me?.name ?? '');
  }, [me?.name]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await rwsdk.auth.updateName(name.trim());
    setSaving(false);
    if (!res.ok) alert(res.error ?? 'Kunne ikke lagre');
  }

  async function handleLogout() {
    try {
      await fetch('/api/logout', { method: 'POST' });
    } finally {
      window.location.href = '/login';
    }
  }

  return (
    <div className="settings-root">
      <h1 className="text-xl font-semibold">Innstillinger</h1>
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Visningsnavn</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-xl border px-4 py-3" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <div className="mt-2">
            <UserStatus />
          </div>
        </div>

        <div className="flex gap-2">
          <Button type="submit">{saving ? 'Lagrer...' : 'Lagre'}</Button>
          <Button variant="ghost" onClick={handleLogout}>Logg ut</Button>
        </div>
      </form>
    </div>
  );
}
 
