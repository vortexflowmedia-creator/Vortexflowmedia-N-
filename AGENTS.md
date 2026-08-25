# Mobile Compatibility Requirements

Every mobile UI change must be tested and optimized for these two devices. Text, buttons, images, and other UI elements must display correctly — no cutoff, overlap, or layout issues.

| Device | Display Size | Resolution | Aspect Ratio | CSS Viewport (approx.) |
|--------|-------------|------------|--------------|------------------------|
| Samsung Galaxy S24 | 6.2 inches | 2340 × 1080 px (FHD+) | 19.5:9 | 360 × 780 CSS px |
| Samsung Galaxy S24 Ultra | 6.8 inches | 3120 × 1440 px (QHD+) | 19.5:9 | 384 × 824 CSS px |

Both devices fall under the site's `max-width: 768px` mobile breakpoint. Always verify the layout renders correctly at both **360px** and **384px** widths before finishing any mobile change.
