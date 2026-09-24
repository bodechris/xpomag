# Engagement collision pass 12

- Cover story engagement now sits in normal flow below the story node instead of inheriting the page-level absolute positioning.
- Regular page engagement is measured against the rendered headline and nearby deck. It is placed directly below them only when there is clear room.
- If that gap would collide with body content, the engagement rail automatically falls back to the padded reading-exit position at the bottom of the section.
- Safe edge inset is enforced for both title-anchored and fallback positions.
- Cover story legibility rules from pass 11 are preserved.
