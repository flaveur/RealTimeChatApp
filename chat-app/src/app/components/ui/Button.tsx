"use client";
import React from "react";
import cn from "clsx";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "ghost" | "outline" | "danger";
}

export function Button({ className, variant = "default", ...props }: ButtonProps) {
  const base = "inline-flex items-center justify-center px-4 py-2 rounded-md font-semibold transition-colors";
  const variants: Record<string, string> = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    ghost: "bg-transparent text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800",
    outline: "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  return <button className={cn(base, variants[variant], className)} {...props} />;
}

export default Button;
