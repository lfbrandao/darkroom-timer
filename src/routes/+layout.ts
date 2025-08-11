export const prerender = true;
export const ssr = false;

// Suppress 404 errors during prerendering for static assets
export function handleHttpError({ status, path }: { status: number; path: string }) {
	// Suppress 404 errors for manifest.json and other static assets during prerendering
	if (status === 404 && (path.includes('manifest.json') || path.includes('favicon'))) {
		return { status: 200, path };
	}
}
