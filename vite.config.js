import { defineConfig } from 'vite';

// En producción (GitHub Pages) el sitio vive en /hospitalvirtual/.
// En dev se sirve desde la raíz.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/hospitalvirtual/' : '/',
  server: { port: 5173, open: true },
  build: { target: 'es2020', outDir: 'dist' }
}));
