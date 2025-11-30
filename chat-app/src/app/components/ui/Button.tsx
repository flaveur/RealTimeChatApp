"use client";
import React from "react";
import cn from "clsx";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "ghost" | "outline";
}

export function Button({ className, variant = "default", ...props }: ButtonProps) {
  const base = "inline-flex items-center justify-center px-4 py-2 rounded-md font-semibold transition-colors";
  const variants: Record<string, string> = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    ghost: "bg-transparent text-gray-900 hover:bg-gray-100",
    outline: "bg-white text-gray-900 border border-gray-200 hover:bg-gray-50",
  };

  return <button className={cn(base, variants[variant], className)} {...props} />;
}

export default Button;
