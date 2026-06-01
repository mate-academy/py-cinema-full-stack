import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue2 from '@vitejs/plugin-vue2';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue2()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    headers: {
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
        "font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net",
        "img-src 'self' data: blob: http://localhost:8080",
        "connect-src 'self' ws://localhost:5173 http://localhost:8080"
      ].join('; ')
    }
  }
});
