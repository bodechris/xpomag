# Image Box Fit Pass 25

Fixes the two boxed portrait treatments called out in review:

- Page 14 / Power Corridor II: portrait now uses `object-fit: cover` inside the green image frame, so the image fills the coloured box vertically with no empty band above it.
- Page 23 / Places II: portrait now uses `object-fit: cover` inside the purple image frame, so the image fills the coloured box vertically with no empty band above it.
- Removed the extra transform scaling previously used as a workaround; the frame itself now controls the crop cleanly.
