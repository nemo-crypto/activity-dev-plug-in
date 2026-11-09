import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('/node_modules/')) return;
          if (/\/(motion|framer-motion|motion-dom|motion-utils)\//.test(id)) return 'motion';
          if (/\/(react|react-dom|scheduler)\//.test(id)) return 'react';
          if (id.includes('/@radix-ui/') || /\/(vaul|cmdk)\//.test(id)) return 'overlays';
        },
      },
    },
  },
});
