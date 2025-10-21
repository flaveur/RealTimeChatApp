import { cn } from "@/app/lib/cn";

type Props = {
  name: string;
  status?: "online" | "busy" | "away";
  avatarUrl?: string;
};

const statusColors = {
  online: "bg-green-500",
  busy: "bg-red-500",
  away: "bg-yellow-400",
};

export default function UserStatus({ name, status = "online", avatarUrl }: Props) {
  return (
    <section
      aria-label={`${name} sin status`}
      className="flex items-center gap-3 px-4 pb-6"
    >
      <figure className="relative">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={`Profilbilde av ${name}`}
            className="h-12 w-12 rounded-full object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="block h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700"
          />
        )}

        <span
          className={cn(
            "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white",
            statusColors[status]
          )}
          aria-label={status}
          title={status}
        />
        <figcaption className="sr-only">
          {`${name} er ${status}`}
        </figcaption>
      </figure>

      <article className="text-sm leading-tight">
        <header>
          <h2 className="font-medium text-gray-900 dark:text-white">{name}</h2>
        </header>
        <p className="text-gray-500 dark:text-gray-400 capitalize">{status}</p>
      </article>
    </section>
  );
}
