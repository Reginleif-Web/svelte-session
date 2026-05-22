<script lang="ts">
	import { onMount } from 'svelte';
	import { configureAuth, getAuthConfig, type AuthConfig } from '../../shared/config.js';
	import { initSession, startSessionAutoRecovery, stopSessionAutoRecovery } from '../services/session.js';
	import { hydrateSession } from '../state/session-state.svelte.js';
	import { setAccessToken } from '../state/access-token-store.js';
	import type { SessionUser } from '../../shared/types.js';

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

	function initializeProvider(config: AuthConfig, session: ProviderSession | null): void {
		configureAuth(config);

		hydrateSession(session?.user ?? null, session?.accessToken ?? null);

		if (session?.accessToken && session?.user) {
			setAccessToken(session.accessToken, getAuthConfig().session.defaultAccessTokenTtlSec);
		}
	}

	const getInitialConfig = () => config;
	const getInitialSession = () => session;

	initializeProvider(getInitialConfig(), getInitialSession());

	onMount(() => {
		void initSession();
		startSessionAutoRecovery();
		return () => {
			stopSessionAutoRecovery();
		};
	});
</script>

{@render children()}
