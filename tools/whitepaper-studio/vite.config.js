import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  base: './',
  build: {
    rolldownOptions: { cwd: fileURLToPath(new URL('./', import.meta.url)) },
    lib: {
      entry: fileURLToPath(new URL('./src/js/建置入口.js', import.meta.url)),
      formats: ['es'],
      fileName: () => '白皮書.js',
      cssFileName: '白皮書',
    },
    sourcemap: false,
    write: false,
  },
  server: {
    port: 4175,
    open: false,
  },
});

