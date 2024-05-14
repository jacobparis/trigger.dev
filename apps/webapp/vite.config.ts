import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import envOnly from 'vite-env-only'

const MODE = process.env.NODE_ENV

export default defineConfig({
  optimizeDeps: {
    exclude: ["fsevents", "https"]
  },
  build: {
		cssMinify: MODE === 'production',
		rollupOptions: {
			external: [/node:.*/, /.*\.node$/, 'https', 'stream', 'crypto', 'fsevents', '@radix-ui/react-tooltip'],
		},
	},

  server: {
    port: 8002,
  },

  plugins: [
    envOnly(),
    remix({
      ignoredRouteFiles: ["**/.*"],
      serverModuleFormat: "esm",
    }),
    tsconfigPaths(),
  ],
});
