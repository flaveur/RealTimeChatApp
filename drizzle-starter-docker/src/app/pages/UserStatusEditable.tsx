// src/components/UserStatusEditable.tsx
import { rwsdk, type Status } from "@/app/lib/rwdsk";
import { useState, useSyncExternalStore } from "react";

const labels: Record<Status, string> = { online: "Online", busy: "Opptatt", away: "Borte" };
const dot: Record<Status, string> = { online: "bg-green-500", busy: "bg-red-500", away: "bg-yellow-400" };

export default function UserStatusEditable() {
  // abonnér på rwsdk-auth endringer
  const me = useSyncExternalStore(
    rwsdk.auth.onChange,
    () => rwsdk.auth.useCurrentUser(),
    () => rwsdk.auth.useCurrentUser()
  );
  const [open, setOpen] = useState(false);

  function setStatus(s: Status) {
    rwsdk.auth.setStatus(s);
    setOpen(false);
  }

  return (
    <section aria-label={`${me.name} sin status`} className="px-4 pb-6">
      <header className="flex items-center gap-3">
        <span aria-hidden className="inline-block h-12 w-12 rounded-full bg-gray-200" />
        <section className="text-sm leading-tight">
          <h2 className="font-medium">{me.name}</h2>
          <p className="text-gray-500 inline-flex items-center gap-2">
            <span className={`inline-block h-2.5 w-2.5 rounded-full ${dot[me.status]}`} aria-hidden />
            <span className="capitalize">{labels[me.status]}</span>
          </p>
        </section>

        <button
          type="button"
          className="ml-auto rounded-lg border border-gray-300 px-3 py-1 text-xs hover:bg-gray-50"
          onClick={() => setOpen(v => !v)}
          aria-expanded={open}
          aria-controls="status-panel"
        >
          Endre status
        </button>
      </header>

      {open && (
        <form id="status-panel" className="mt-3 rounded-xl border border-gray-200 bg-white p-3">
          <fieldset className="space-y-2">
            <legend className="sr-only">Velg status</legend>
            {(["online","busy","away"] as Status[]).map(s => (
              <label key={s} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="status"
                  value={s}
                  defaultChecked={me.status === s}
                  onChange={() => setStatus(s)}
                />
                <span className="inline-flex items-center gap-2">
                  <span className={`inline-block h-2.5 w-2.5 rounded-full ${dot[s]}`} aria-hidden />
                  <span>{labels[s]}</span>
                </span>
              </label>
            ))}
          </fieldset>
        </form>
      )}
    </section>
  );
}
