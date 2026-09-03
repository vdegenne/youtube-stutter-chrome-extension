import {mdMangle} from 'material-all-mangle-names';
import {materialAll} from 'rollup-plugin-material-all';
import {defineConfig} from 'vite';
import {mdicon2svg} from 'vite-plugin-mdicon2svg';

export default defineConfig({
	build: {
		outDir: '.',
		emptyOutDir: false,
		minify: true,

		chunkSizeWarningLimit: 1000,

		rollupOptions: {
			input: {
				content: './src/content/content.ts',
			},
			output: {
				format: 'iife',
				entryFileNames: 'content.js',
			},
		},
	},

	plugins: [
		//
		materialAll(),
		mdicon2svg(),
		mdMangle(),
	],
});
