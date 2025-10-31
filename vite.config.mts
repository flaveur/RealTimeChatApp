import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { dirname, resolve } from "node:path";
import { redwood } from "rwsdk/vite";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  environments: {
    ssr: {},
  },
  plugins: [
    tailwindcss(),
    cloudflare({
      viteEnvironment: { name: "worker" },
    }),
    redwood(),
    react({
      babel: {
        plugins: ["babel-plugin-react-compiler"],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: false,
    // Let Vite choose HMR port dynamically alongside chosen server port
    hmr: {},
    watch: {
      usePolling: true,
      interval: 1000,
    },
  },
});
