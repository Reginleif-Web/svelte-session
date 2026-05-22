import { resolveAuthConfig, type AuthConfig } from '../../shared/config.js';
import type { ServerSession } from '../../shared/types.js';
import type { SessionResult } from '../../shared/contracts.js';

function hasCookie(cookieHeader: string, cookieName: string): boolean {
	const chunks = cookieHeader.split(';');
	for (const chunk of chunks) {
		if (chunk.trim().startsWith(`${cookieName}=`)) {
			return true;
		}
	}
	return false;
}

export async function getServerSession(
	event: { request: Request },
	config: AuthConfig
): Promise<ServerSession> {
	const resolved = resolveAuthConfig(config);
	const cookieHeader = event.request.headers.get('cookie') ?? '';
	if (!hasCookie(cookieHeader, resolved.cookie.sessionName)) {
		return { user: null, accessToken: null, accessTokenExpiresInSec: 0, setCookies: [] };
	}

	try {
		const response = await fetch(`${resolved.authUrl}${resolved.paths.session}`, {
			method: 'GET',
			headers: {
				cookie: cookieHeader
			}
		});
		const setCookies =
			typeof response.headers.getSetCookie === 'function' ? response.headers.getSetCookie() : [];
		let result: SessionResult;
		try {
			result = (await response.json()) as SessionResult;
		} catch {
			result = {
				success: false,
				error: { code: 'invalid_response', message: 'Invalid API response' }
			};
		}
		if (!result.success || !result.data) {
			return { user: null, accessToken: null, accessTokenExpiresInSec: 0, setCookies };
		}

		return {
			user: result.data.user,
			accessToken: result.data.accessToken,
			accessTokenExpiresInSec: result.data.expires,
			setCookies
		};
	} catch {
		return { user: null, accessToken: null, accessTokenExpiresInSec: 0, setCookies: [] };
	}
}
