import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        donate: resolve(__dirname, 'donate/index.html'),
        404: resolve(__dirname, '404.html'),
      },
    },
    // Optional: make output names hash-based for cache busting
    // which Vite does by default anyway.
  },
});
