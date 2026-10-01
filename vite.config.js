import { defineConfig } from 'vite';

// Lovable runs the dev server on port 8080; the build goes to dist/
export default defineConfig({
  server: { host: '::', port: 8080 },
  build: { target: 'es2020', assetsInlineLimit: 0, chunkSizeWarningLimit: 800 },
});
