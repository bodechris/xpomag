# XPOMAG v15 — stable same-origin authentication

The repeated `Failed to fetch` problem came from making browser authentication depend
on a separate Express process at `localhost:4000`.

That created a long chain of failure points:

```text
browser
  -> port 4000
  -> CORS
  -> Express startup
  -> pnpm workspace aliases
  -> Better Auth handler
  -> PostgreSQL
```

v15 removes the entire network/process boundary for authentication.

## New architecture

```text
Browser :3000
   |
   +-- /api/auth/*       Better Auth (Next.js route handler)
   |
   +-- /api/account/*    verification + onboarding
   |
   +-- PostgreSQL :5434
```

The separate Express API on `:4000` remains for magazine composer/engagement only.
Signup no longer depends on that API being alive.

## Important changes

- Better Auth runs inside `apps/frontend`.
- `authClient` uses same-origin requests; there is no `baseURL: localhost:4000`.
- Verification and onboarding also use same-origin Next.js route handlers.
- Auth tables are created idempotently on first auth request.
- In local development, if Resend is not configured, OTP codes print in the
  **frontend terminal**:
  ```text
  [XPOMAG AUTH OTP] you@example.com -> 123456
  ```
- The Express API no longer imports Better Auth at startup.

## Run

Make sure PostgreSQL is running:

```powershell
docker compose up -d postgres
```

Then:

```powershell
pnpm install
node scripts/verify-auth-v15.mjs
pnpm --filter frontend dev
```

In another terminal:

```powershell
node scripts/check-frontend-auth.mjs
```

Expected:

```text
/api/auth/ok -> 200
/api/account/health -> 200
```

Then test:

```text
http://localhost:3000/auth?mode=signup
```

## Google OAuth

The local Google callback is now:

```text
http://localhost:3000/api/auth/callback/google
```

not port 4000.

For email signup, Google credentials are not required.
