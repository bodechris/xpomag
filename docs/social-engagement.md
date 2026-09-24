# Section engagement

XpoMag now renders a Facebook-inspired social rail on magazine sections with reactions, comments, sharing and saving.

## UI

- Reaction summary + counts
- Hover reaction picker with Like, Love, Insightful and Celebrate
- Comment modal (mobile becomes a bottom sheet)
- Share popover for copy link, LinkedIn, Facebook, X, WhatsApp and email
- Save / unsave with optimistic UI
- Logged-out readers can see the rail, but any action opens the sign-in gate
- Reduced-motion support, keyboard focus states and Escape-to-close for comments

## API

The API exposes public summary/comment reads and authenticated writes under:

`/v1/engagement/:issueSlug/:pageSlug/:sectionId`

Tables are created by `packages/db/drizzle/0002_section_engagement.sql`. The API repository also performs `CREATE TABLE IF NOT EXISTS` so local development remains resilient.

## Authentication boundary

The current app still has a placeholder authentication provider. Engagement treats a request as signed in when the existing auth layer supplies an `xpomag_user_id` cookie. For local/trusted development only, the API can also accept `x-xpomag-user-id` when `ALLOW_DEV_AUTH_HEADER=true`.

When Auth.js / Better Auth / Clerk (or the chosen provider) is wired, replace `viewerId()` in `apps/api/src/index.ts` with the provider's verified session/user identity and set `viewerAuthenticated` from that same verified session on the frontend. Do not enable the development header in production.

## Environment

Frontend:

`NEXT_PUBLIC_API_ORIGIN=http://localhost:4000`

API:

`WEB_ORIGIN=http://localhost:3000`

`DATABASE_URL=postgres://xpomag:xpomag@localhost:5434/xpomag` (or the active database URL)
