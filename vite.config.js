import { defineConfig } from 'vite';

export default defineConfig({
  base: '/new-game/',
  build: {
    sourcemap: true,
    minify: false
  }
});
