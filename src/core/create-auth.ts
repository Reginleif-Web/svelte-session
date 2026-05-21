import { configureAuth, type AuthConfig } from '../shared/config.js';
import { getAccessToken } from '../client/state/access-token-store.js';
import {
	getSession,
	refresh,
	refreshTokens,
	signIn,
	signOut
} from '../client/services/session.js';
import { getServerSession } from '../server/session/get-server-session.js';

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
