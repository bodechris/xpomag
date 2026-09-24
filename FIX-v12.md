# XPOMAG v12 — complete API/auth runtime wiring

This revision addresses the remaining reason the browser showed:

```text
TypeError: Failed to fetch
```

## Fixes included

1. `packages/auth/src/server.ts` no longer imports `@xpomag/db` through a workspace alias.
2. Composer and engagement repositories no longer depend on `@xpomag/db` workspace resolution at runtime.
3. API Redis helper no longer depends on `@xpomag/config` workspace resolution.
4. The real `apps/api/src/index.ts` now mounts:
   ```text
   /api/account
   ```
5. `/api/account` now includes:
   - status
   - send verification code
   - verify code
   - onboarding load
   - onboarding save
6. Default onboarding categories are inserted automatically when needed.

## Run from the repo root

```powershell
pnpm install
node scripts/verify-api-runtime-wiring.mjs
pnpm --filter api dev
```

Do not continue until the API terminal stays alive and prints:

```text
XpoMag API listening on http://localhost:4000
```

Then open:

```text
http://localhost:4000/health
http://localhost:4000/api/auth-health
```

Then run:

```powershell
node scripts/check-composer-sync.mjs
```

Only after those pass, run the full stack:

```powershell
pnpm dev
```
