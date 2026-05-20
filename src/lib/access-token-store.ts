let accessToken: string | null = null;
let expiresAtMs = 0;

export function getAccessToken(): string | null {
	return accessToken;
}

export function getAccessTokenExpiresInSec(): number {
	if (!accessToken || expiresAtMs <= Date.now()) {
		return 0;
	}
	return Math.max(0, Math.floor((expiresAtMs - Date.now()) / 1000));
}

export function clearAccessToken(): void {
	accessToken = null;
	expiresAtMs = 0;
}

export function setAccessToken(token: string, expiresInSec: number): void {
	accessToken = token;
	expiresAtMs = Date.now() + expiresInSec * 1000;
}

export function isAccessTokenExpired(): boolean {
	if (!accessToken) {
		return true;
	}
	return Date.now() >= expiresAtMs;
}
