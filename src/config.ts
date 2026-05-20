export type AuthPaths = {
	auth: string;
	refresh: string;
	session: string;
	check: string;
	logout: string;
};

export type AuthCookieConfig = {
	sessionName: string;
	path: string;
};

export type AuthSessionConfig = {
	refreshBeforeExpiryMs: number;
	defaultAccessTokenTtlSec: number;
};

export type AuthConfig = {
	authUrl: string;
	paths: AuthPaths;
	cookie?: Partial<AuthCookieConfig>;
	session?: Partial<AuthSessionConfig>;
	fetchCredentials?: RequestCredentials;
	onAfterSignOut?: () => void | Promise<void>;
};

export type ResolvedAuthConfig = {
	authUrl: string;
	paths: AuthPaths;
	cookie: AuthCookieConfig;
	session: AuthSessionConfig;
	fetchCredentials: RequestCredentials;
	onAfterSignOut?: () => void | Promise<void>;
};

const defaultCookie: AuthCookieConfig = {
	sessionName: 'sid',
	path: '/'
};

const defaultSession: AuthSessionConfig = {
	refreshBeforeExpiryMs: 60_000,
	defaultAccessTokenTtlSec: 15 * 60
};

let resolvedConfig: ResolvedAuthConfig | null = null;

function mergeConfig(config: AuthConfig) {
	return {
		paths: config.paths,
		cookie: { ...defaultCookie, ...config.cookie },
		session: { ...defaultSession, ...config.session },
		fetchCredentials: config.fetchCredentials ?? 'include',
		onAfterSignOut: config.onAfterSignOut
	};
}

export function configureAuth(config: AuthConfig): void {
	const authUrl = config.authUrl.trim().replace(/\/$/, '');
	if (!authUrl) {
		throw new Error('SvelteSession: authUrl is required in config');
	}
	resolvedConfig = { ...mergeConfig(config), authUrl };
}

export function getAuthConfig(): ResolvedAuthConfig {
	if (!resolvedConfig) {
		throw new Error('SvelteSession: pass config to SessionProvider or getServerSession');
	}
	return resolvedConfig;
}
