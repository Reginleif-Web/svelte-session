import type { AuthData } from '../contracts.js';
import type { SessionUser } from '../types.js';
import { identityAuth, identityCheck, identityLogout, identityRefresh } from '../api/identity-api.js';
import {
	clearAccessToken,
	getAccessToken,
	isAccessTokenExpired,
	setAccessToken
} from './access-token-store.js';

export type ResolvedSession = {
	user: SessionUser | null;
	accessToken: string | null;
	expiresInSec: number;
};

export async function resolveClientSession(): Promise<ResolvedSession> {
	if (!isAccessTokenExpired()) {
		const token = getAccessToken();
		if (token) {
			const check = await identityCheck(token);
			if (check.success && check.data) {
				return {
					user: { userId: check.data.userId, email: check.data.email },
					accessToken: token,
					expiresInSec: 0
				};
			}
		}
	}

	const { result } = await identityRefresh();
	if (!result.success || !result.data) {
		clearAccessToken();
		return { user: null, accessToken: null, expiresInSec: 0 };
	}

	setAccessToken(result.data.accessToken, result.data.expires);

	return {
		user: result.data.user,
		accessToken: result.data.accessToken,
		expiresInSec: result.data.expires
	};
}

export async function loginClientSession(credentials: AuthData): Promise<{
	ok: boolean;
	user: SessionUser | null;
	accessToken: string | null;
	expiresInSec: number;
	error?: { code: string; message: string };
}> {
	const { result } = await identityAuth(credentials);
	if (!result.success) {
		clearAccessToken();
		return {
			ok: false,
			user: null,
			accessToken: null,
			expiresInSec: 0,
			error: result.error
		};
	}

	setAccessToken(result.data.accessToken, result.data.expires);

	return {
		ok: true,
		user: result.data.user,
		accessToken: result.data.accessToken,
		expiresInSec: result.data.expires
	};
}

export async function logoutClientSession(): Promise<void> {
	await identityLogout();
	clearAccessToken();
}
