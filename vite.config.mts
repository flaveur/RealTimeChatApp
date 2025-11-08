import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Dette er standardkonfigurasjonen for ditt prosjekt
export default defineConfig({
  plugins: [react()],

  // Vite skal lete etter index.html i rotmappa (C:\RealTimeChatApp)
  root: ".",

  // Sikrer at dev-server kjører på IPv4 (ikke [::1])
  server: {
    host: "127.0.0.1",
    port: 5173,
    open: true, // Åpner nettleseren automatisk
  },

  // Output bygges til "dist" ved build
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },

  // Støtte for absolutte imports (f.eks. "@/app/pages/...")
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
