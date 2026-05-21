# Contributing

Thanks for taking the time to improve `svelte-session`.

## Development

Install dependencies from the repository root:

```sh
npm install
```

Run package checks:

```sh
cd svelte-session
npm run check
npm run build
```

Before publishing or reviewing package contents:

```sh
npm run pack:dry-run
```

## Code Style

- Keep the package framework-focused and backend-agnostic.
- Avoid persisting access tokens in browser storage.
- Keep public types small and explicit.
- Preserve SvelteKit SSR compatibility.
- Add comments only where behavior is not obvious from the code.

## Pull Requests

Pull requests should include:

- A concise description of the behavior change.
- Notes on any backend contract changes.
- Verification steps, including `npm run check` and `npm run build`.

## Security-Sensitive Changes

Auth changes should be reviewed with particular care. Call out changes that affect token lifetime, cookie behavior, refresh rotation, SSR session loading, or error disclosure.
