<script lang="ts">
	import { onMount } from 'svelte';
	import { configureAuth, getAuthConfig, type AuthConfig } from './config.js';
	import { initSession } from './lib/session.js';
	import { hydrateSession } from './lib/session-state.svelte.js';
	import { setAccessToken } from './lib/access-token-store.js';
	import type { SessionUser } from './types.js';

	export type ProviderSession = {
		user: SessionUser | null;
		accessToken: string | null;
	};

	let {
		config,
		session = null,
		children
	}: {
		config: AuthConfig;
		session?: ProviderSession | null;
		children: import('svelte').Snippet;
	} = $props();

	configureAuth(config);

	hydrateSession(session?.user ?? null, session?.accessToken ?? null);

	if (session?.accessToken && session?.user) {
		setAccessToken(session.accessToken, getAuthConfig().session.defaultAccessTokenTtlSec);
	}

	onMount(() => {
		void initSession();
	});
</script>

{@render children()}
