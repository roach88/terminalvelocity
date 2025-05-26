import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
// @ts-ignore
import { beehiivProxy } from './server/beehiiv-proxy.js';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    svelte(),
    {
      name: 'beehiiv-proxy',
      configureServer(server) {
        server.middlewares.use(beehiivProxy);
      }
    }
  ],
  server: {
    port: 3000,
  },
});
