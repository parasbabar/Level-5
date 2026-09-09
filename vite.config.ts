import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import wasm from 'vite-plugin-wasm';

export default defineConfig({
  plugins: [
    wasm(),
    react(),
    nodePolyfills({
      include: ['buffer', 'crypto', 'stream', 'util'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
  server: {
    port: 5173,
  },
  build: {
    target: 'esnext',
  },
  esbuild: {
    supported: {
      'top-level-await': true,
    },
  },
});
