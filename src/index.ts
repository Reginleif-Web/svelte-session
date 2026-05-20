export { createAuth } from './create-auth.js';
export type { Auth } from './create-auth.js';
export type {
	ApiError,
	ApiResponse,
	AuthData,
	AuthResponseData,
	AuthResult,
	AuthUser,
	CheckSessionResponseData,
	CheckSessionResult,
	RefreshResponseData,
	RefreshResult,
	SessionResponseData,
	SessionResult,
	TokenSessionResponseData
} from './contracts.js';
export type {
	AuthConfig,
	AuthCookieConfig,
	AuthPaths,
	AuthSessionConfig,
	ResolvedAuthConfig
} from './config.js';
export { getAccessToken } from './lib/access-token-store.js';
export { getSession, refresh, refreshTokens, signIn, signOut } from './lib/session.js';
export { default as SessionProvider } from './session-provider.svelte';
export type { ProviderSession } from './session-provider.svelte';
export type {
	ClientSession,
	ServerSession,
	SessionStatus,
	SessionUser
} from './types.js';
