import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    watch: {
      ignored: [
        '**/releases/**',
        '**/published-apps/**',
        '**/Anything Child app realse/**',
        '**/*.exe',
        '**/*.zip',
        '**/*.msix',
        '**/*.apk',
        '**/*.asar',
        '**/.temp_user_data*/**',
        '**/electron-dist/**',
        '**/dist/**',
        '**/*.db*',
        '**/*.journal',
      ],
    },
  },
  preview: {
    host: '127.0.0.1',
    port: 5173,
  },
});
