import {nodeResolve} from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
// import typescript from '@rollup/plugin-typescript';

const plugins = [
	// typescript(),
	nodeResolve(),
	// json(),
	terser({
		format: {
			comments: false,
		},
	}),
];

export default [
	// {
	// 	input: './lib/content.js',
	// 	output: {file: './content.js', format: 'iife'},
	// 	plugins,
	// },
	{
		input: './lib/background.js',
		output: {file: './background.js', format: 'iife'},
		plugins,
	},
	// {
	// 	input: './lib/offscreen/script.js',
	// 	output: {file: './documents/offscreen/offscreen.js', format: 'iife'},
	// 	plugins,
	// },
];
