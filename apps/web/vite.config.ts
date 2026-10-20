import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { createLogger, defineConfig, type Logger } from "vite";
import checker from "vite-plugin-checker";

const baseLogger = createLogger();
const logger: Logger = {
  ...baseLogger,
  warnOnce: (msg, options) => {
    if (msg.includes("points to a source file outside its package") && msg.includes("@duckdb"))
      return;
    baseLogger.warnOnce(msg, options);
  },
};

export default defineConfig(({ command, isPreview }) => ({
  customLogger: logger,
  plugins: [
    nitro({
      // Served by the Rust server from `.br`/`.gz` siblings (DuckDB wasm is 36 MB raw, 8 MB gzip).
      compressPublicAssets: { brotli: true, gzip: true },
      devProxy: {
        "/api/**": "http://127.0.0.1:3000",
        "/files/**": "http://127.0.0.1:3000",
      },
    }),
    tailwindcss(),
    tanstackStart({
      // The landing page is prerendered to `index.html` so it shows without waiting for JS.
      pages: [{ path: "/", prerender: { enabled: true, crawlLinks: false } }],
      spa: {
        enabled: true,
        // Not "/": that path is taken by the landing page above.
        maskPath: "/upload",
      },
    }),
    viteReact({ compiler: true }),
    // Dev server only: in build and preview (used by the SPA prerender) its workers keep Node alive.
    command === "serve" && !isPreview ? checker({ oxlint: true }) : null,
  ],
  preview: {
    host: "127.0.0.1",
  },
  server: {
    port: 3001,
  },
  resolve: {
    tsconfigPaths: true,
  },
}));
