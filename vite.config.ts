import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'es2022',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('@tiptap') || id.includes('prosemirror') || id.includes('tippy.js')) {
            return 'tiptap';
          }
          if (id.includes('@radix-ui')) {
            return 'radix';
          }
          if (
            id.includes('lowlight') ||
            id.includes('highlight.js') ||
            id.includes('mammoth')
          ) {
            return 'syntax';
          }
          return 'vendor';
        },
      },
    },
  },
});
