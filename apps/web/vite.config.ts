import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import checker from "vite-plugin-checker";

export default defineConfig(({ command, isPreview }) => ({
  plugins: [
    nitro({
      devProxy: {
        "/api/**": "http://127.0.0.1:3000",
        "/files/**": "http://127.0.0.1:3000",
      },
    }),
    tailwindcss(),
    tanstackStart({
      spa: {
        enabled: true,
      },
    }),
    viteReact(),
    // Dev server only: in build and preview (used by the SPA prerender) its workers keep Node alive.
    command === "serve" && !isPreview ? checker({ oxlint: true }) : null,
  ],
  server: {
    port: 3001,
  },
  resolve: {
    tsconfigPaths: true,
  },
}));
