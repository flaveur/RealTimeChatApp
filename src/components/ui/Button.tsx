"use client";

import * as React from "react";

export function Button({
  children,
  fullWidth = false,
  variant = "primary",
  className = "",
  ...props
}: {
  children: React.ReactNode;
  fullWidth?: boolean;
  variant?: "primary" | "secondary" | "danger";
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const base =
    "px-4 py-2 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary:
      "bg-gray-200 hover:bg-gray-300 text-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100",
    danger: "bg-red-600 hover:bg-red-700 text-white",
  };
  const width = fullWidth ? "w-full" : "";

  return (
    <button
      {...props}
      className={`${base} ${variants[variant]} ${width} ${className}`}
    >
      {children}
    </button>
  );
}
