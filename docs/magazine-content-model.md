# XpoMag Magazine Content Model

The canonical composition tree is now:

`Magazine -> Master Spread -> Spread -> Spread Layout -> Spread Piece / Section -> Element Composition -> Design Elements`

A **spread is the authoritative visual design unit**. A page is no longer authored as an isolated composition. The physical left and right pages are **leaves**: clipped viewports onto one continuous two-page spread canvas.

## Magazine global definition

Every published issue owns one global configuration object containing:

- metadata: city, issue label, month, publishing details and future SEO/social metadata
- colors: issue-wide named color tokens
- fonts: semantic font roles used across the issue
- styles: issue-wide design tokens
- resources: fonts, images and stylesheets preloaded once for the issue
- designElements: reusable global design elements and compositions
- spreads: native spread-authored editorial compositions
- pages: retained during migration for routing, article views and legacy content

Global design elements can be reused by a `reference` design element rather than duplicated into every spread tree.

## Master spread

A master spread owns the physical reading mechanics:

- left leaf
- right leaf
- page/leaf indices
- clipping
- perspective and turning surfaces
- front/back faces
- stacking, fold shadows and highlights

The master spread does **not** own editorial design. Its job is to present a spread through physical leaves.

Legacy page-authored magazines are normalized with `buildMasterSpreadsFromPages()`, so the old Rosebank/Sandton samples and new spread-authored issues use the same reader/navigation architecture.

## Spread

A spread is one continuous two-page canvas and owns:

- stable `id` and `slug`
- title and optional kind
- spread-level resources and styles
- one spread background
- ordered spread pieces
- optional transitional page references

All visual coordinates are conceptually relative to the full spread. The gutter sits at 50% of the canvas.

`MagazineSpreadCanvas` renders the authoritative full composition once conceptually. `MagazineSpreadLeaf` clips that same composition into the left or right physical leaf rather than reconstructing two independent designs.

## Spread pieces / sections

A spread piece is an addressable editorial unit and can target:

- `spread` — may occupy or cross the complete two-page canvas
- `left` — constrained to the left leaf
- `right` — constrained to the right leaf

Pieces also declare gutter behaviour:

- `cross`
- `avoid`
- `clip`
- `duplicate`
- `reflow`

Sections/pieces remain the primary engagement target. Reactions, comments and saves attach to an editorial piece rather than arbitrary nested visual nodes.

## Element compositions and design elements

Design elements remain small serializable presentation primitives such as frame, grid, stack, text, image, divider, spacer, background, composer canvas and brand mark.

Nested element trees are reusable **element compositions**. This keeps the model flexible enough for recurring editorial treatments such as a portrait + pull quote, title systems, sponsor lockups and data cards without turning every treatment into a hard-coded page component.

## Content geometry vs physical geometry

Keep these responsibilities separate.

**Spread/content geometry owns:**

- typography
- imagery
- editorial hierarchy
- positioning
- backgrounds
- piece composition
- gutter intent

**Master spread/physical geometry owns:**

- page turning
- perspective
- leaf clipping
- fold/gutter mechanics
- shadows/highlights
- drag thresholds
- stacking order

A spread can therefore be shown as a desktop two-page composition, clipped leaves during a flip, or a compact single-leaf view without changing its authored design.

## Page compatibility layer

`MagazinePageDefinition` remains available while existing samples and article routes migrate.

The reader no longer creates a private page-pair structure. It calls `buildMasterSpreadsFromPages(issue.pages, singleLeaf)`, which means every existing issue participates in the master-spread architecture immediately.

New editorial work — starting with Steyn City — should be authored natively as `MagazineSpreadDefinition[]`. Do not introduce new page-first design templates.

## URL model

During migration, page deep links remain:

`/magazine/:issueSlug/:pageSlug`

Section deep links remain:

`/magazine/:issueSlug/:pageSlug#:sectionSlug`

This preserves existing shared links and SEO while the visual authoring model becomes spread-first.

## Layout philosophy

Spread layouts should deliberately support editorial relationships across the gutter:

- cinematic full-bleed spread
- editorial contrast
- typography bridge
- object/image bridge
- asymmetric grid
- full-bleed + inset
- diptych
- sequential narrative
- data/directory spread
- advertising takeover

Body copy, faces, logos and small UI should normally avoid the gutter. Backgrounds, large imagery, decorative geometry and selected display typography may deliberately cross it.

## Rendering API

The shared `@xpomag/magazine` package now exports:

- `MagazineSpreadDefinition`
- `MagazineSpreadPiece`
- `MagazineMasterSpread`
- `buildMasterSpreadsFromPages`
- `MagazineSpreadCanvas`
- `MagazineSpreadLeaf`
- `MagazineMasterSpreadRenderer`

These are foundational XpoMag primitives, not Steyn City-specific components.
