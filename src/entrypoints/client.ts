export { createAuth } from '../core/create-auth.js';
export type { Auth } from '../core/create-auth.js';
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
} from '../shared/contracts.js';
export type {
	AuthConfig,
	AuthCookieConfig,
	AuthPaths,
	AuthSessionConfig,
	ResolvedAuthConfig
} from '../shared/config.js';
export { getAccessToken } from '../client/state/access-token-store.js';
export { getSession, refresh, refreshTokens, signIn, signOut } from '../client/services/session.js';
export { default as SessionProvider } from '../client/provider/session-provider.svelte';
export type { ProviderSession } from '../client/provider/session-provider.svelte';
export type {
	ClientSession,
	ServerSession,
	SessionStatus,
	SessionUser
} from '../shared/types.js';
