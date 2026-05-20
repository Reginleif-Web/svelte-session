import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/package').SvelteConfig} */
const config = {
	preprocess: vitePreprocess(),
	compilerOptions: {
		runes: true
	}
};

export default config;
