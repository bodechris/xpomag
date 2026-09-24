# XPOMAG v10 fix

This build fixes the API startup failure shown as:

```text
ERR_MODULE_NOT_FOUND: Cannot find package '@xpomag/auth'
```

Changes:

- `apps/api/package.json` now declares `@xpomag/auth: workspace:*`.
- `pnpm-lock.yaml` now links `apps/api` to `packages/auth`.
- removed the duplicate blank `DATABASE_URL=` at the bottom of the root `.env`.
- `packages/auth/src/server.ts` now creates its Drizzle DB instance with `createDb()` instead of importing a non-existent `db` export.
- local auth no longer crashes during module initialization if the root env loader has not run yet; production still requires `BETTER_AUTH_SECRET`.

## Start

From the repo root:

```powershell
pnpm install
pnpm --filter api dev
```

The API should print:

```text
XpoMag API listening on http://localhost:4000
```

Then in another terminal:

```powershell
node scripts/check-composer-sync.mjs
```

After the API is reachable, run the whole workspace:

```powershell
pnpm dev
```
