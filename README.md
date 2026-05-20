# SvelteSession

SvelteKit session helpers for applications that use short-lived access tokens and a cookie-backed refresh session.

The package keeps the access token in memory, stores session state in Svelte 5 reactive state, and delegates durable session ownership to your backend through a small HTTP contract.

## Features

- Svelte 5 `SessionProvider` for client hydration and session refresh.
- SvelteKit server helper for SSR session loading.
- In-memory access token store, with no `localStorage` or `sessionStorage` persistence.
- Configurable endpoint paths, cookie name, credentials mode, and refresh timing.
- Backend-agnostic HTTP contract for auth, refresh, session introspection, token check, and logout.

## Install

```sh
npm install svelte-session
```

Peer requirements:

```sh
npm install svelte
```

## Auth Model

The package expects the backend to own the refresh session through an httpOnly cookie. The frontend receives short-lived access tokens and keeps them only in memory.

`SvelteSession` deliberately does not validate passwords, sign JWTs, store refresh tokens, or decide cookie policy. Those responsibilities stay on your backend. The package only coordinates SvelteKit SSR, browser state, access-token refresh, and calls to your configured identity endpoints.

The two tokens have different jobs:

- **Access token:** short-lived bearer token returned to the frontend. It is stored in memory and exposed through `getAccessToken()` and `getSession()`.
- **Refresh session:** durable backend-owned session, usually represented by an httpOnly cookie. The package never reads the cookie in the browser; it only sends credentialed requests so the backend can read it.

Typical flow:

1. `signIn()` calls the configured `auth` endpoint.
2. The backend sets a refresh-session cookie and returns an access token plus user data.
3. `SessionProvider` hydrates client state from SSR data and schedules token refresh.
4. `getServerSession()` calls the configured `session` endpoint during SSR. This endpoint should validate the cookie and return a fresh access token without rotating the refresh cookie.
5. Client refresh calls the configured `refresh` endpoint, which may rotate the refresh cookie.
6. `signOut()` calls the configured `logout` endpoint and clears client state.

## Automatic Refresh

Yes, refresh is automatic after the client session is initialized.

When `SessionProvider` mounts, it calls `initSession()`. If a valid hydrated access token is already present, the package schedules a timer. Otherwise it calls `refreshTokens()` immediately, which attempts to obtain a new access token through the configured `refresh` endpoint.

Whenever a session is committed with an access token, the package schedules the next refresh for:

```ts
expiresInSec * 1000 - refreshBeforeExpiryMs
```

with a minimum delay of 5 seconds. With the default config, a 15-minute access token is refreshed about 1 minute before expiry.

There are two important boundaries:

- `getAccessToken()` is synchronous and does not perform network refresh by itself. Use `refresh()` or `refreshTokens()` before an API call if your own request layer needs to force a fresh token.
- Timers can be delayed by browser tab suspension, sleep, or offline periods. When `refreshTokens()` runs after the access token has already expired, it falls back to the refresh-session cookie and asks the backend for a new access token.

SSR uses the configured `session` endpoint, not the `refresh` endpoint. This avoids rotating the refresh cookie on every server-rendered request.

## SvelteKit Setup

Create an auth config:

```ts
// src/auth.config.ts
import type { AuthConfig } from 'SvelteSession';

const authConfig: AuthConfig = {
	authUrl: 'http://localhost:3000',
	paths: {
		auth: '/api/identity/auth',
		refresh: '/api/identity/refresh',
		session: '/api/identity/session',
		check: '/api/identity/check',
		logout: '/api/identity/logout'
	},
	cookie: {
		sessionName: 'sid',
		path: '/'
	},
	session: {
		refreshBeforeExpiryMs: 60_000,
		defaultAccessTokenTtlSec: 15 * 60
	},
	fetchCredentials: 'include'
};

export default authConfig;
```

Load the session on the server:

```ts
// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';
import { getServerSession } from 'SvelteSession/server';
import authConfig from './auth.config';

export const handle: Handle = async ({ event, resolve }) => {
	const session = await getServerSession(event, authConfig);

	event.locals.user = session.user;
	event.locals.accessToken = session.accessToken;

	const response = await resolve(event);

	for (const cookie of session.setCookies) {
		response.headers.append('set-cookie', cookie);
	}

	return response;
};
```

Expose SSR data to the root layout:

```ts
// src/routes/+layout.server.ts
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	return {
		session: {
			user: locals.user,
			accessToken: locals.accessToken
		}
	};
};
```

Wrap your app:

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
	import { SessionProvider } from 'SvelteSession';
	import authConfig from '../auth.config';

	let { children, data } = $props();
</script>

<SessionProvider config={authConfig} session={data.session}>
	{@render children()}
</SessionProvider>
```

Use the client helpers:

```svelte
<script lang="ts">
	import { getSession, signIn, signOut } from 'SvelteSession';

	const session = getSession();

	async function login() {
		await signIn({ login: 'user@example.com', password: 'password' });
	}
</script>

{#if session.status === 'authorized'}
	<p>{session.data?.email}</p>
	<button type="button" onclick={() => signOut()}>Sign out</button>
{:else}
	<button type="button" onclick={login}>Sign in</button>
{/if}
```

## API

### Client exports

```ts
import {
	SessionProvider,
	getAccessToken,
	getSession,
	refresh,
	refreshTokens,
	signIn,
	signOut
} from 'SvelteSession';
```

Useful exported types:

```ts
import type {
	ApiResponse,
	AuthData,
	AuthResponseData,
	CheckSessionResponseData,
	RefreshResponseData,
	SessionResponseData
} from 'SvelteSession';
```

### Server exports

```ts
import { getServerSession } from 'SvelteSession/server';
```

### `AuthConfig`

```ts
type AuthConfig = {
	authUrl: string;
	paths: {
		auth: string;
		refresh: string;
		session: string;
		check: string;
		logout: string;
	};
	cookie?: {
		sessionName?: string;
		path?: string;
	};
	session?: {
		refreshBeforeExpiryMs?: number;
		defaultAccessTokenTtlSec?: number;
	};
	fetchCredentials?: RequestCredentials;
	onAfterSignOut?: () => void | Promise<void>;
};
```

## Backend Contract

The package is backend-agnostic. Your backend can be implemented with Hono, SvelteKit endpoints, Express, Fastify, Rails, Laravel, Go, or anything else, as long as it follows the configured HTTP contract.

All endpoints should return JSON in this envelope:

```ts
type ApiResponse<T> = {
	success: boolean;
	data: T | null;
	error: { code: string; message: string } | null;
};
```

### `POST auth`

Used by `signIn(credentials)`.

Request:

```ts
type AuthData = {
	login: string;
	password: string;
};
```

Response data:

```ts
type AuthResponseData = {
	accessToken: string;
	expires: number;
	user: {
		userId: string;
		email: string;
	};
};
```

The backend should set the refresh-session cookie on success.

### `POST refresh`

Used by the browser-side automatic refresh timer and by manual `refresh()` / `refreshTokens()` calls.

Response data:

```ts
type RefreshResponseData = AuthResponseData;
```

The backend may rotate the refresh-session cookie. If the refresh session has an absolute lifetime, the returned `expires` value and cookie max age should not exceed the remaining session lifetime.

### `GET session`

Used by `getServerSession()` during SvelteKit SSR.

Response data:

```ts
type SessionResponseData = AuthResponseData;
```

This endpoint is used by SSR. It should validate the refresh-session cookie and return a short-lived access token without rotating the refresh cookie.

### `GET check`

Used when the client already has a non-expired in-memory access token and needs to resolve the current user without refreshing.

Request header:

```http
Authorization: Bearer <access-token>
```

Response data:

```ts
type CheckSessionResponseData = {
	userId: string;
	email: string;
};
```

### `POST logout`

Used by `signOut()`.

Clears or revokes the refresh session. Response data is `null`.

## Session State

`getSession()` returns a Svelte reactive state object:

```ts
type ClientSession = {
	status: 'loading' | 'authorized' | 'unauthorized';
	data: { userId: string; email: string } | null;
	accessToken: string | null;
};
```

State meanings:

- `loading`: the package is signing in, signing out, hydrating, or refreshing.
- `authorized`: user data and an access token are available.
- `unauthorized`: no valid session is available.

The access token is also available through `getAccessToken()`. It returns the current in-memory token or `null`.

## Cookies and CORS

For browser requests, configure the backend to allow credentials and expose any headers required by your deployment. The refresh cookie should be httpOnly.

For same-site deployments, `SameSite=Lax` is usually sufficient. For cross-site frontend/backend deployments, use `SameSite=None; Secure` and a compatible CORS policy.

## Development

```sh
npm install
npm run check
npm run build
npm run pack:dry-run
```

## Security Notes

- Access tokens are stored in memory only.
- Refresh session cookies should be httpOnly and secure in production.
- Avoid returning different errors for unknown users and invalid passwords.
- Prefer an absolute maximum refresh-session lifetime on the backend.
- SSR session introspection should not rotate refresh tokens.

## License

ISC
