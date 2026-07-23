import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import checker from "vite-plugin-checker";

export default defineConfig({
  plugins: [
    nitro(),
    tailwindcss(),
    tanstackStart({
      // see issue: https://github.com/TanStack/router/issues/6602
      // spa: {
      //   enabled: true,
      // },
      // pages: [
      //   { path: "/", prerender: { enabled: true } },
      //   { path: "/upload", prerender: { enabled: true } },
      // ],
    }),
    viteReact(),
    checker({ oxlint: true }),
  ],
  server: {
    port: 3001,
  },
  resolve: {
    tsconfigPaths: true,
  },
  optimizeDeps: {
    exclude: ["@duckdb/duckdb-wasm"],
  },
  ssr: {
    // Keep the Node entry out of the SSR bundle; duckdb-wasm is browser-only.
    external: ["@duckdb/duckdb-wasm"],
  },
});
