# Cover story navigation + inline engagement

The cover is a visual table of contents. Each editorial coverline can own a `story` link with:

- `id`: stable story identity
- `targetPageSlug`: magazine page
- `targetSectionSlug`: exact section anchor
- `engagementAnchor`: whether this layer shows the compact engagement metadata
- `engagementAppearance`: auto / dark / light

The cover renderer places engagement against the *rendered text height* rather than the composer layer box, so the icons sit directly beneath the headline or deck even when the design layer itself is taller.

Current Issue 001 mappings:

- “Rosebank's green town square comes alive.” → `editorial#rosebank-nine-yards`
- “Retail is tightening up…” → `editorial#rosebank-retail`
- “Sandton's skyline goes residential” → `feature#sandton-olympus`
- “Gautrain enters its post-2026 era” → `weekend#gautrain-next`
- “The new hospitality playbook.” → `guide#hospitality-shift`

The destination magazine sections render their own engagement component and use the same issue/page/section identity as the cover teaser, so counts remain consistent wherever the story is surfaced.
