import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  root: "./", // hvis index.html ligger i prosjektroten
  build: {
    outDir: "dist",
  },
  server: {
    port: 5180,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8787",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
