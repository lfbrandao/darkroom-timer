import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// adapter-static for GitHub Pages deployment
		adapter: adapter({
			// GitHub Pages expects files in the root
			pages: 'build',
			assets: 'build',
			fallback: 'index.html', // Important: fallback to index.html for SPA routing
			precompress: false,
			strict: true
		}),
		paths: {
			// For GitHub Pages deployment to subdirectory
			base: process.argv.includes('dev') ? '' : process.env.BASE_PATH
		}
	}
};

export default config;