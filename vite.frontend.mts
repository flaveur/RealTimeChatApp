import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  root: ".", // bruker index.html i rotmappa
  build: {
    outDir: "dist-frontend",
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
});
