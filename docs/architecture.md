# XpoMag initial architecture

## 1. App boundaries

- `apps/frontend` — public magazine experience. SSR/SEO first. Uses CSS/Tailwind + the design-element renderer. Avoid Chakra for magazine composition so editorial pages are not constrained by application UI primitives.
- `apps/business` — business workspace. Chakra UI is appropriate here for forms, dashboards, dialogs, tables and accessibility-heavy controls.
- `apps/admin` — internal editorial/design/advertising workspace. Chakra UI + custom builder surfaces.
- `apps/api` — Express API and background-job producer/consumer boundary.

## 2. Shared packages

- `@xpomag/magazine` — serializable magazine design-tree schema and SSR-safe React renderer.
- `@xpomag/ui` — shared application UI provider/components (Chakra layer).
- `@xpomag/db` — PostgreSQL/Drizzle access and initial city/issue/page schema.
- `@xpomag/auth` — RBAC constants + env-only superadmin check.
- `@xpomag/config` — validated server environment.

## 3. Styling philosophy

XpoMag has two visual layers:

1. Product shell: neutral, consistent global tokens (`--xp-*`), Helvetica/Geist-like UI typography, accessibility defaults and layout primitives.
2. Magazine canvas: each issue/page is a tree of design elements where props + whitelisted style properties are persisted as JSON. Individual issues may override typography, palette and layout without changing the product shell.

Do not save arbitrary HTML/CSS/JS from the builder. Save typed design nodes and render only registered components. This keeps pages crawlable, testable and safer.

## 4. Location -> magazine resolution

Resolve city on the server using this precedence:

1. Explicit city chosen by user in the current session.
2. Logged-in user's preferred/home city.
3. Previously accepted city cookie.
4. Edge geolocation city/country (Vercel/Cloudflare headers).
5. Closest published city edition by distance.
6. Launch/default edition.

Never silently overwrite an explicit city with IP location. Store city-level preference, not precise coordinates, unless a later feature genuinely needs consented precise location.

The resolver should only select among **published and available** issues. A city with no issue falls through to nearest available city and UI should say what edition is being shown.

## 5. SEO + guest gating

Do not serve a full article to crawlers while hiding that same article from human guests. Instead classify each page/section as `public` or `member` at publishing time.

- Public pages render complete SSR HTML and are indexable.
- Member pages can expose indexable metadata and a deliberately public excerpt, then require sign-in for the rest.
- The guest experience can open the sign-in UI after N preview sections, but access control must be enforced on the server/API too.

## 6. Business content model

Keep an evergreen business profile separate from time-based editorial submissions.

Evergreen profile: description, categories, locations, contact links, founders, team, history/timeline, products/services, media kit, brand assets, social links.

Submission types: founder story, business story, launch, event, milestone/achievement, guide/how-to, local insight, community impact, customer/case story, team/culture.

`Goals` should normally be a field/topic inside a story rather than a top-level content type. `History` should primarily live in the profile, with exceptional history stories submitted editorially.

Recommended initial plans:

- Free — profile + limited submissions.
- Spotlight R500/mo — richer profile, more submissions, analytics, eligibility for recurring directory/highlight inventory.
- Growth R1,000/mo — higher limits, richer analytics, additional promotional inventory/credits.
- Premier R1,999/mo — highest tool limits and premium promotional inventory/credits.

Paid tier should not imply an undisclosed editorial endorsement. Distinguish editorial selection from sponsored/paid placements in the data model and UI.

## 7. Advertising inventory (max 10 types)

1. Inside front cover
2. Opening spread
3. Full-page display
4. Half-page display
5. Section sponsor
6. Sponsored story
7. Native recommendation card
8. Featured directory/business slot
9. Event spotlight
10. Inside back cover / closing page

Inventory is attached to an issue, position and date window. Sponsored formats are labelled.

## 8. Admin roles

- `superadmin` — env-defined only; unrestricted; manage admins/roles/system configuration.
- `admin` — broad operational access excluding superadmin/system ownership.
- `content_manager` — editorial queue, stories, issue planning and publishing workflow.
- `designer` — cover/page builder and visual assets; no user/admin management.
- `ad_manager` — inventory, bookings, creatives, sponsor/business coordination.
- `moderator` — comments/user-generated content moderation.
- `analyst` — read-only analytics/reporting.

Superadmin membership is evaluated from `SUPERADMIN_EMAILS` and should never be assignable from the admin UI or database.

## 9. Data / infrastructure

Use PostgreSQL as the primary source of truth. XpoMag is strongly relational (users, businesses, cities, issues, pages, submissions, comments, collections, subscriptions, inventory, bookings) while `jsonb` is ideal for page design trees.

Use Redis Stack for cache, sessions/rate-limits if needed, BullMQ and later vector/similarity search. Do not make Redis the canonical magazine/content database.

BullMQ queues to add next: `issue-generation`, `content-enrichment`, `image-generation`, `search-index`, `notifications`, `analytics-rollup`.
