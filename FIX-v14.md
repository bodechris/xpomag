# XPOMAG v14 — remove direct Drizzle resolution from API

The API still failed with:

```text
ERR_MODULE_NOT_FOUND: Cannot find package 'drizzle-orm'
imported from apps/api/src/routes/account.ts
```

even though `drizzle-orm` was listed in `apps/api/package.json`.

That means the local pnpm runtime was not resolving the package from the API workspace.

v14 removes that failure mode completely.

## Change

Before:

```ts
// apps/api/src/routes/account.ts
import { and, asc, eq, inArray } from "drizzle-orm"
import { createDb } from "../../../../packages/db/src/index"
```

Now:

```ts
import {
  and,
  asc,
  createDb,
  eq,
  inArray,
} from "../../../../packages/db/src/index"
```

And `packages/db/src/index.ts` re-exports those helpers:

```ts
export { and, asc, eq, inArray } from "drizzle-orm"
```

`drizzle-orm` is resolved from the DB package, where it is already installed and used by the schema.

## Run

```powershell
pnpm install
node scripts/verify-api-runtime-wiring.mjs
pnpm --filter api dev
```

The API should now get past the direct `drizzle-orm` resolution error.
