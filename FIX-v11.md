# XPOMAG v11 — API auth import resolution fix

The local API was crashing with:

```text
ERR_MODULE_NOT_FOUND: Cannot find package '@xpomag/auth'
imported from apps/api/src/auth-bootstrap.ts
```

Even though `apps/api/package.json` included:

```json
"@xpomag/auth": "workspace:*"
```

To remove workspace-link resolution as a runtime dependency, the API now imports
the auth source directly from the monorepo:

```ts
import { auth } from "../../../packages/auth/src/index.ts"
```

and from nested route/middleware files:

```ts
import { auth } from "../../../../packages/auth/src/index.ts"
```

This is appropriate for the current `tsx` development setup and avoids the failed
pnpm symlink lookup entirely.

## Run

```powershell
pnpm install
node scripts/verify-api-auth-imports.mjs
pnpm --filter api dev
```

Then, in another terminal:

```powershell
node scripts/check-composer-sync.mjs
```

The API must be reachable on port 4000 before the frontend can load the saved/published
composer document instead of falling back to the bundled demo magazine.
