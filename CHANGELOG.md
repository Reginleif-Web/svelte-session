# Changelog

All notable changes to this package will be documented in this file.

This project follows semantic versioning where possible.

## 1.0.3

- fix imports to prevent error Unknown file extension ".svelte" for ....\node_modules\svelte-session\dist\client\provider\session-provider.svelte

## 1.0.2

- Added optional `paths.refresh` support for pure JWT lifetime mode without refresh endpoint calls.
- Updated session lifecycle to expire client session when refresh is not configured.
- Updated `AuthConfig` docs and README guidance for optional refresh behavior.
- Refactored source tree into explicit layers: `src/client`, `src/server`, `src/shared`, `src/core`, and `src/entrypoints`.
- Rebuilt package exports to use entrypoint modules:
  - `svelte-session`
  - `svelte-session/server`
  - `svelte-session/core`
  - `svelte-session/types`
- Moved auth API client and shared contracts into `src/shared` to remove client/server coupling in internal paths.
- Removed legacy internal source paths from the package surface as part of the structural refactor.

## 1.0.1

- Backend API contract — discriminated union
- Resolved Svelte prop warnings in package components
- Repository renamed from SvelteSession to svelte-session

## 1.0.0

- Initial workspace package version.
- Added package documentation for SvelteKit client and server usage.
- Documented the backend HTTP contract expected by the auth client.
- Added package-level contribution, security, and license files.
