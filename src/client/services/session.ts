import type { AuthData } from '../../shared/contracts.js';
import type { ClientSession } from '../../shared/types.js';
import { getAuthConfig } from '../../shared/config.js';
import {
	clearAccessToken,
	getAccessTokenExpiresInSec,
	setAccessToken
} from '../state/access-token-store.js';
import { loginClientSession, logoutClientSession, resolveClientSession } from './resolve-session.js';
import type { ResolvedSession } from './resolve-session.js';
import { applySession, sessionState, setSessionLoading } from '../state/session-state.svelte.js';

let refreshTimer: ReturnType<typeof setTimeout> | null = null;

function clearRefreshTimer(): void {
	if (refreshTimer !== null) {
		clearTimeout(refreshTimer);
		refreshTimer = null;
	}
}

function scheduleAccessTokenRefresh(expiresInSec: number): void {
	const { paths, session } = getAuthConfig();
	clearRefreshTimer();
	if (expiresInSec <= 0) {
		return;
	}
	if (!paths.refresh) {
		refreshTimer = setTimeout(() => {
			commitSession({ user: null, accessToken: null, expiresInSec: 0 });
		}, expiresInSec * 1000);
		return;
	}
	const delayMs = Math.max(expiresInSec * 1000 - session.refreshBeforeExpiryMs, 5_000);
	refreshTimer = setTimeout(() => {
		void refreshTokens();
	}, delayMs);
}

function commitSession(resolved: ResolvedSession): void {
	const { session } = getAuthConfig();
	if (resolved.user && resolved.accessToken) {
		const expiresInSec =
			resolved.expiresInSec > 0
				? resolved.expiresInSec
				: getAccessTokenExpiresInSec() || session.defaultAccessTokenTtlSec;
		setAccessToken(resolved.accessToken, expiresInSec);
		applySession(resolved.user, resolved.accessToken);
		scheduleAccessTokenRefresh(expiresInSec);
		return;
	}
	clearAccessToken();
	clearRefreshTimer();
	applySession(null, null);
}

export function getSession(): ClientSession {
	return sessionState;
}

export async function refreshTokens(): Promise<void> {
	try {
		const resolved = await resolveClientSession();
		commitSession(resolved);
	} catch {
		commitSession({ user: null, accessToken: null, expiresInSec: 0 });
	}
}

export async function refresh(): Promise<void> {
	setSessionLoading();
	await refreshTokens();
}

export async function signIn(
	credentials: AuthData
): Promise<{ ok: boolean; error?: { code: string; message: string } }> {
	setSessionLoading();
	const result = await loginClientSession(credentials);
	if (!result.ok) {
		commitSession({ user: null, accessToken: null, expiresInSec: 0 });
		return { ok: false, error: result.error };
	}
	commitSession({
		user: result.user,
		accessToken: result.accessToken,
		expiresInSec: result.expiresInSec
	});
	return { ok: true };
}

export async function signOut(): Promise<void> {
	const { onAfterSignOut } = getAuthConfig();
	setSessionLoading();
	clearRefreshTimer();
	await logoutClientSession();
	commitSession({ user: null, accessToken: null, expiresInSec: 0 });
	await onAfterSignOut?.();
}

export async function initSession(): Promise<void> {
	if (sessionState.status === 'authorized' && sessionState.data && sessionState.accessToken) {
		const expiresInSec = getAccessTokenExpiresInSec();
		if (expiresInSec > 0) {
			scheduleAccessTokenRefresh(expiresInSec);
		}
		return;
	}
	const { paths } = getAuthConfig();
	if (!paths.refresh) {
		commitSession({ user: null, accessToken: null, expiresInSec: 0 });
		return;
	}
	setSessionLoading();
	await refreshTokens();
}
