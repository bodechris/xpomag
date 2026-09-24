# XPOMAG admin → frontend sync fix v9

This build fixes the two separate causes of the cover mismatch.

## Root cause 1 — database persistence was being disabled

The root `.env` contained a valid `DATABASE_URL` near the top **and another blank `DATABASE_URL=` at the bottom**. The composer repository treated an empty string as a real connection string, which is why the admin previously reported PostgreSQL startup/username errors and stayed in local-only mode.

The duplicate blank value is removed, and the API now also treats a blank value as missing and safely falls back to the local Docker PostgreSQL connection.

## Root cause 2 — the frontend overwrote admin-authored cover copy

`apps/frontend/lib/demo-magazine.ts` called `withCoverStoryLinks()` on the saved composer document. That function did not only add story links; it forcibly replaced cover text such as `left-headline`, `left-copy`, `right-story-1`, `right-story-2`, `issue-meta`, `lead-kicker`, and `lead-headline` with hardcoded demo content.

That meant even a correctly published admin document could not render faithfully on the frontend.

It now preserves **all content, placement, typography, image settings and background layers from the composer document** and only backfills missing story metadata for older documents.

## Additional fixes

- Admin now loads server draft first, then published version, then localStorage only as a fallback.
- Admin status clearly says when it is local-only vs saved/published.
- Frontend composer fetching logs API/persistence failures instead of silently hiding them.
- Added `GET /v1/composer-health`.
- Added `node scripts/check-composer-sync.mjs`.

## Run

```powershell
pnpm install
pnpm dev
```

Make one small cover edit in Admin, click **Save draft**, then **Preview draft**. The preview URL should show the exact edited cover.

Then click **Publish** and refresh:

```text
http://localhost:3000/magazine/demo-johannesburg-001/cover
```

The published frontend should now match the admin canvas.

To verify persistence:

```powershell
node scripts/check-composer-sync.mjs
```

`/v1/composer-health` should report `hasDraft: true` after Save draft and `hasPublished: true` after Publish.
