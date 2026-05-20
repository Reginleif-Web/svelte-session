import { configureAuth, getAuthConfig, type AuthConfig } from '../config.js';
import type { ServerSession } from '../types.js';
import { identitySession } from '../api/identity-api.js';

export async function getServerSession(
	event: { request: Request },
	config: AuthConfig
): Promise<ServerSession> {
	configureAuth(config);
	const cookieHeader = event.request.headers.get('cookie') ?? '';
	const { cookie } = getAuthConfig();
	if (!cookieHeader.includes(`${cookie.sessionName}=`)) {
		return { user: null, accessToken: null, setCookies: [] };
	}

	const { result, setCookies } = await identitySession(cookieHeader);
	if (!result.success || !result.data) {
		return { user: null, accessToken: null, setCookies };
	}

	return {
		user: result.data.user,
		accessToken: result.data.accessToken,
		setCookies
	};
}
