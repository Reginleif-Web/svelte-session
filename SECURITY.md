# Security Policy

## Supported Versions

Security fixes are expected to target the latest released version.

## Reporting a Vulnerability

Please do not open a public issue for a suspected vulnerability.

Report security concerns privately to the maintainers. Include:

- Affected version or commit.
- A clear description of the issue.
- Steps to reproduce, if available.
- Potential impact and suggested mitigation, if known.

The maintainers will acknowledge valid reports, investigate, and coordinate a fix before public disclosure when appropriate.

## Security Scope

This package provides frontend and SvelteKit session helpers. The backend remains responsible for:

- Validating credentials.
- Creating and verifying access tokens.
- Setting, rotating, expiring, and revoking refresh-session cookies.
- Enforcing absolute session lifetime.
- Applying CORS and cookie security policy.
