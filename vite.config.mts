import { cloudflare } from "@cloudflare/vite-plugin";
import react from "@vitejs/plugin-react";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [
    react({
      babel: { plugins: ["babel-plugin-react-compiler"] },
    }),
    cloudflare({
      viteEnvironment: { name: "worker" },
    }),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      // Force rwsdk to use the runtime server entries when building the worker.
      "rwsdk/worker": resolve(__dirname, "node_modules/rwsdk/dist/runtime/entries/worker.js"),
      "rwsdk/router": resolve(__dirname, "node_modules/rwsdk/dist/runtime/entries/router.js"),
      // Shim virtual modules used by rwsdk runtime
  "virtual:use-server-lookup.js": resolve(__dirname, "src/rwsdk-shims/use-server-lookup.js"),
  "virtual:use-client-lookup.js": resolve(__dirname, "src/rwsdk-shims/use-client-lookup.js"),
    },
    // Ensure package exports choose the server-side entry when building the worker
    conditions: ["react-server", "workerd", "node", "default"],
  },
  build: {
    target: "esnext",
    modulePreload: false,
  },
});
