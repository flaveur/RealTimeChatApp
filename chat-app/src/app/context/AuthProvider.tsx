"use client";
import React from "react";

interface AuthProviderProps {
  children: React.ReactNode;
  initialUser?: any;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // Minimal provider stub; extend with context state as needed.
  return <>{children}</>;
}

export default AuthProvider;
