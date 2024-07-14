import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  base: '/MazeSolver3D/',
  build: {
    outDir: 'dist',
  },
  server: {
    open: true,
  },
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: 'src',
          dest: 'src',
        },
      ],
    }),
  ],
});
