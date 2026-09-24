# XpoMag Magazine Content Model

The canonical composition tree is:

`Magazine -> Page -> Layout -> Section / Design Piece -> Design Elements`

## Magazine global definition

Every published issue owns one global configuration object containing:

- metadata: city, issue label, month, publishing details and future SEO/social metadata
- colors: issue-wide named color tokens
- fonts: semantic font roles used across the issue
- styles: issue-wide design tokens
- resources: fonts, images and stylesheets that should be preloaded once for the issue
- designElements: reusable global design elements such as the XpoMag masthead, recurring labels or branded marks
- pages

Global design elements can be reused by a `reference` design element rather than duplicated into every page tree.

## Page definition

Every page, including front and back covers, contains:

- stable `id` and `slug`
- type/kind
- access level
- `layoutId` from the predefined layout registry
- page-specific resource manifest
- page-specific styles
- ordered sections

Page resources are loaded when the page enters the rendered reader. Target pages are mounted underneath a turning page during the page-turn animation, so their resource hints are emitted before they become fully visible.

## Sections / design pieces

A section is an addressable unit of content. It has:

- stable ID and URL-safe slug
- a named layout slot
- section-specific resources
- engagement permissions
- design elements

Sections are the primary engagement target. Reactions, comments and saves attach to a section rather than to arbitrary nested visual nodes.

## Design elements

Design elements remain small, serializable presentation primitives such as frame, grid, stack, text, image, divider, spacer and brand mark. A `reference` element resolves a reusable item from the magazine's global design-element registry.

## URL model

Page deep link:

`/magazine/:issueSlug/:pageSlug`

Section deep link:

`/magazine/:issueSlug/:pageSlug#:sectionSlug`

Example:

`/magazine/demo-johannesburg-001/founder#founder-main`

The reader keeps the URL synchronized as the reader changes spread while preserving a requested right-hand page when a desktop spread contains two pages.

## Layout registry

`packages/magazine/src/layouts.ts` contains 50 predefined layout definitions. Layout definitions are data, not hard-coded React components. A new layout only needs:

- id
- name/category/description
- `grid` or `flex` mode
- CSS layout styles
- named slots

The admin builder can therefore present the same registry as a visual layout picker.

## Engagement

The data model includes:

- section reactions: like, love, insightful, celebrate
- section comments and replies
- personal collections
- collection-section saves

The frontend includes a member-only section engagement control surface. It is intentionally gated behind `viewerAuthenticated`; production authentication and API persistence are the next wiring step.

## Background design element

Every page owns an explicit `background` design element. Background art is not a special CSS escape hatch: it is part of the page design model and can be edited by the builder like every other design element.

Supported background layer directions include:

- solid color
- linear/radial/conic gradients
- image layers
- transparent PNG/WebP/AVIF art
- SVG/image shape layers
- gobo/light textures
- opacity, filters, transforms and CSS blend modes

Background layers render behind layout sections inside an isolated page stacking context. This keeps them independent from the editorial grid while still serializable in the page document and database.

The database stores the page background independently as `background_design`, making it possible to swap cover/background art without replacing the page's section content.
