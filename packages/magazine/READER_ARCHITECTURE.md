# XpoMag universal magazine reader architecture

All publications must use the same reader runtime. A magazine may provide different content, art direction, fonts, colours, layouts, images and videos, but it must not fork the reader, navigation, responsive, media-lifecycle or performance systems.

## Canonical pipeline

1. A publication is represented as `MagazineGlobalDefinition`.
2. `normalizeMagazineForReader()` converts page-authored publications into the same spread runtime used by native-spread publications.
3. `createMagazineReaderPayload()` creates the lightweight manifest consumed by the application reader.
4. `MagazineReader` is the only magazine browsing shell.
5. `MagazineSpreadCanvas`, `MagazineSpreadLeaf` and `MagazinePageRenderer` are the shared rendering primitives.
6. The shared reader runtime selects either:
   - **spread mode** for sufficiently large real estate, or
   - **page mode** for compact real estate.
7. Page mode recomposes content into independent vertically scrollable pages. It must never be implemented as a scaled desktop spread.
8. Navigation, video lifecycle, caching, page-turn/page-slide behaviour, engagement and performance tuning belong to the shared runtime and must never be copied into an individual magazine.

## Responsive contract

The breakpoint is defined once in `reader-runtime.ts` as `MAGAZINE_COMPACT_MAX_WIDTH`. Components should consume the shared runtime mode rather than declaring magazine-specific responsive thresholds.

In compact/page mode:

- left and right sides of a spread become separate pages;
- complex absolute/grid/flex layouts collapse into normal box-model flow;
- simple media groups may use two columns when space allows;
- every page may overflow vertically;
- scrolling beyond the bottom/top advances to the next/previous page;
- body copy remains readable;
- media remains available even when the desktop composition changes;
- page transitions are lightweight slides rather than miniature 3D spread flips.

## Publication-specific code

Publication files may define content and authored layouts. They may also provide optional mobile-specific pieces when a deliberate art-directed compact composition is useful.

They must not implement their own reader, breakpoints, navigation state, cache, video lifecycle, page-turn engine or compact-layout engine.

This allows changes to the shared runtime to propagate to every publication, whether there are ten issues or tens of thousands.
