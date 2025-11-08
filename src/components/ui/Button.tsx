"use client";

/**
 * En gjenbrukbar knappkomponent som støtter ulike stiler
 * (primary, secondary, danger) og håndterer dark/light mode automatisk.
 */

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
  fullWidth?: boolean;
};

export function Button({
  variant = "primary",
  fullWidth = false,
  className = "",
  ...props
}: Props) {
  const base =
    "inline-flex items-center justify-center px-4 py-2 rounded-xl font-medium transition-all focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-400 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-400",
    secondary:
      "bg-gray-200 hover:bg-gray-300 text-gray-900 focus:ring-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100",
    danger:
      "bg-red-600 hover:bg-red-700 text-white focus:ring-red-400 dark:bg-red-500 dark:hover:bg-red-600 dark:focus:ring-red-400",
  };

  return (
    <button
      {...props}
      className={`${base} ${variants[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
    />
  );
}
