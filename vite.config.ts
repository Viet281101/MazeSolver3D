import { defineConfig } from 'vite';

export default defineConfig({
	base: '/MazeSolver3D/',
	build: {
		outDir: 'dist',
	},
	server: {
		open: true,
	},
});
