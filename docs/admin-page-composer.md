# Admin Page Composer v2

The cover composer and public cover now share the same `ComposerDocument` template and the same `ComposerCanvas` renderer from `@xpomag/magazine`. This keeps the admin canvas geometrically representative of the published page.

## Frontend asset library

The frontend exposes `GET /api/resources/images`, which recursively indexes image files under `apps/frontend/public/resources`. The admin uses `NEXT_PUBLIC_FRONTEND_ORIGIN` (default `http://localhost:3000`) to fetch that index and renders the returned static URLs directly from the frontend app.

Add cover subjects, textures, gobos and other images anywhere under `apps/frontend/public/resources`. The image picker can search across all folders. Assets under `images-with-alpha` are prioritized for the demo cover.

## Composer controls

The inspector uses semantic controls rather than raw text wherever possible: sliders + numeric fields for geometry and type scales, segmented controls for fit/alignment, color pickers, focal-point grid, switches for lock/visibility, and selects for font weights and blend modes. CSS gradient strings remain text-editable because they are intentionally advanced authoring values.

## Persistence

Draft/version persistence remains localStorage-only in this iteration. The next persistence milestone is storing `ComposerDocument` revisions in PostgreSQL and publishing the approved revision for the frontend route.
