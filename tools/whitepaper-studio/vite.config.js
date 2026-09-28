import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  base: './',
  build: {
    rolldownOptions: { cwd: fileURLToPath(new URL('./', import.meta.url)) },
    lib: {
      entry: fileURLToPath(new URL('./src/js/build-entry.js', import.meta.url)),
      formats: ['es'],
      fileName: () => 'whitepaper.js',
      cssFileName: 'whitepaper',
    },
    sourcemap: false,
    write: false,
  },
  server: {
    port: 4175,
    open: false,
  },
});

