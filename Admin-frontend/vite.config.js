import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const port = Number(env.VITE_PORT) || 5003;

  return {
    plugins: [react()],
    server: { port, strictPort: true },
    preview: { port, strictPort: true },
    test: {
      environment: 'jsdom',
      globals: true,
      include: ['tests/**/*.test.{js,jsx}'],
      setupFiles: ['tests/setup.js'],
    },
  };
});
