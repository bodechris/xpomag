# XpoMag Navigation Experience Pass 13

This pass makes page navigation resilient across imagery and decorative surfaces.

- Horizontal page-dragging is captured at the magazine stage in the capture phase, so images and nested decorative surfaces cannot swallow the gesture.
- Native image dragging is suppressed while ordinary vertical scrolling remains available on touch devices.
- Drag completion is more forgiving: lower turn threshold plus quick-flick velocity support.
- Clicking a non-interactive point on the right half of the magazine advances; clicking the left half goes back.
- Links, buttons, form controls, story links and engagement controls keep their own click behaviour and never trigger a page turn.
- Desktop pointer guide follows the mouse with backdrop blur and displays `Next` / `Previous`; it collapses to a small dot over interactive controls.
- Existing keyboard navigation remains unchanged.
