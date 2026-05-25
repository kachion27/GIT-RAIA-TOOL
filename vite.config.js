import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        donate: resolve(__dirname, 'donate/index.html'),
      },
    },
    // Optional: make output names hash-based for cache busting
    // which Vite does by default anyway.
  },
});
