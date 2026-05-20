export type ApiError = {
	code: string;
	message: string;
};

export type ApiResponse<T> = {
	success: boolean;
	data: T | null;
	error: ApiError | null;
};

export type AuthData = {
	login: string;
	password: string;
};

export type AuthUser = {
	userId: string;
	email: string;
};

export type TokenSessionResponseData = {
	accessToken: string;
	expires: number;
	user: AuthUser;
};

export type AuthResponseData = TokenSessionResponseData;

export type RefreshResponseData = TokenSessionResponseData;

export type SessionResponseData = TokenSessionResponseData;

export type CheckSessionResponseData = AuthUser;

export type AuthResult = ApiResponse<AuthResponseData>;

export type RefreshResult = ApiResponse<RefreshResponseData>;

export type SessionResult = ApiResponse<SessionResponseData>;

export type CheckSessionResult = ApiResponse<CheckSessionResponseData>;
