import { defineConfig } from "vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import { redwood } from "rwsdk/vite";
import tailwindcss from "@tailwindcss/vite";

import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  environments: {
    ssr: {},
  },
  plugins: [
    cloudflare({
      viteEnvironment: { name: "worker" },
    }),
    redwood(),
    tailwindcss(),
  ],
  server: {
    host: "127.0.0.1",
    port: 5173,
    open: true,
  },

  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
