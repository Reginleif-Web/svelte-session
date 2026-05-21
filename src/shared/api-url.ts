import { getAuthConfig } from './config.js';

export function apiUrl(path: string): string {
	const base = getAuthConfig().authUrl;
	return base ? `${base}${path}` : path;
}
