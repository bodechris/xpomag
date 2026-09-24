# XPOMAG v13 — API Drizzle runtime dependency

The API now gets further through startup and failed on:

```text
ERR_MODULE_NOT_FOUND: Cannot find package 'drizzle-orm'
imported from apps/api/src/routes/account.ts
```

`account.ts` imports Drizzle query helpers directly, so `apps/api` must declare
`drizzle-orm` as its own runtime dependency. It is not enough for `packages/db`
to depend on it because pnpm uses strict package boundaries.

v13 adds:

```json
"drizzle-orm": "^0.44.7"
```

to `apps/api/package.json`.

Run:

```powershell
pnpm install
node scripts/verify-api-dependencies.mjs
node scripts/verify-api-runtime-wiring.mjs
pnpm --filter api dev
```

The API should now move beyond the `drizzle-orm` module-resolution error.
