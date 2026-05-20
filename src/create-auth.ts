import { configureAuth, type AuthConfig } from './config.js';
import { getAccessToken } from './lib/access-token-store.js';
import { getSession, refresh, refreshTokens, signIn, signOut } from './lib/session.js';
import { getServerSession } from './server/get-server-session.js';

let initialized = false;

export type Auth = {
	signIn: typeof signIn;
	signOut: typeof signOut;
	getSession: typeof getSession;
	refresh: typeof refresh;
	refreshTokens: typeof refreshTokens;
	getAccessToken: typeof getAccessToken;
	getServerSession: typeof getServerSession;
};

export function createAuth(config: AuthConfig): Auth {
	if (!initialized) {
		initialized = true;
		configureAuth(config);
	}
	return {
		signIn,
		signOut,
		getSession,
		refresh,
		refreshTokens,
		getAccessToken,
		getServerSession
	};
}
