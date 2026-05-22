export type SessionUser = {
	userId: string;
	email: string;
};

export type SessionStatus = 'loading' | 'authorized' | 'unauthorized';

export type ClientSession = {
	status: SessionStatus;
	data: SessionUser | null;
	accessToken: string | null;
};

export type ServerSession = {
	user: SessionUser | null;
	accessToken: string | null;
	accessTokenExpiresInSec: number;
	setCookies: string[];
};
