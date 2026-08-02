# Design QA — White Live Map Home

## Comparison target

- Source visual truth: `design-reference-white-map.png`
- Source pixels: 1774 × 887
- Final implementation: `qa-home-live-reference-viewport-final.png`
- Implementation pixels: 1774 × 887
- CSS viewport: 1774 × 887
- Device scale factor: 1
- Density normalization: none; source and implementation were compared at identical pixel dimensions.
- State: production build, initial three real store recommendations loaded, live opening count visible, initial route selected.

## Evidence

- Full-view comparison: `qa-home-live-comparison-final.jpg`
- Focused typography and consultation comparison: `qa-home-live-focus-left-final.jpg`
- Focused map, route, store-photo label, and selected-card comparison: `qa-home-live-focus-map-final.jpg`
- Mobile implementation: `qa-home-live-mobile-final.png` at 390 × 844, device scale factor 1.
- Focused comparisons were required because input, store labels, and map photo details were too small to judge reliably in the full-view sheet.

## Findings

- No actionable P0, P1, or P2 findings remain.
- Intentional adaptation: the source bottom strip of three large store cards is represented by three photo-backed map labels, the route switcher, and one selected-store card. This keeps all three stops discoverable while preserving more map area.
- Intentional adaptation: the source headline receives a thin cobalt-to-harbor animated underline. The copy and two-line structure match the selected source; the added motion answers the requested lively direction without changing the white visual base.
- P3 follow-up only: labels are deliberately compact because the real initial route is 11 minutes and geographically tighter than the conceptual source route.

## Required fidelity surfaces

- Fonts and typography: Zen Kaku Gothic New remains the Japanese UI face and Barlow Condensed remains the label and numeric face. The two-line hero copy, strong weight, compact tracking, and small live labels preserve the source hierarchy. No clipping or unintended truncation was observed.
- Spacing and layout rhythm: persistent left rail, consultation-first left column, live-map right column, white canvas, rounded frame, and first-viewport proportions match the selected direction. Desktop uses the available viewport height; mobile keeps the consultation input in the first 844 px.
- Colors and tokens: white and cool-gray surfaces dominate, with cobalt for action and harbor cyan for status and route accents. Contrast remains strong for body text, form controls, and map labels.
- Image quality and asset fidelity: all visible store imagery uses real store photo references through `StoreImage`. Photos appear in map labels and the selected-store card with contained crops; no placeholder illustration, emoji, custom SVG, or CSS-drawn store asset is used.
- Copy and content: hero copy matches the selected visual direction. Opening count, three-stop count, route minutes, store names, areas, and budgets are populated from product data rather than decorative mock values.

## Comparison history

### Pass 1 — blocked

- Findings: the development preview remained in a loading state because its HMR connection was unhealthy; the implementation also left the consultation input below the first viewport and wrapped the headline too aggressively.
- Fixes: validation moved to the production build, the consultation form and quick conditions moved into the left hero, and the desktop grid and type scale were rebalanced.
- Post-fix evidence: real candidates, map route, photos, and interaction state loaded with no horizontal overflow.

### Pass 2 — blocked

- Findings: the desktop frame left excessive blank space below the hero, and the first diverse route measured 42 walking minutes.
- Fixes: the desktop stage now fills the viewport, and candidate selection evaluates real coordinates to choose a high-quality three-stop route capped at 18 minutes.
- Post-fix evidence: final initial route measures 11 minutes and all three stops render on the map.

### Pass 3 — blocked

- Findings: the implementation was less photo-led than the source and geographically close labels overlapped.
- Fixes: actual store photos were added to permanent map labels, then label offsets were distributed while mobile keeps compact number-only labels.
- Post-fix evidence: `qa-home-live-focus-map-final.jpg` shows three photo-backed labels, route line, selected-store card, and no blocking overlap.

### Pass 4 — passed

- Finding fixed: hero copy and optical structure were aligned to `今夜の3軒、歩いてつなぐ。`; the former orange emphasis was replaced with the product cobalt and harbor palette.
- Post-fix evidence: `qa-home-live-comparison-final.jpg` and both focused comparison images.

## Functional and responsive validation

- Desktop: 1536 × 1024; mobile: 390 × 844.
- Horizontal overflow: none on either viewport.
- Initial state: three candidates loaded, selected card rendered, 7 stores open at test time, 11-minute route.
- Primary interactions tested: focus and fill consultation input; submit becomes enabled; switch to stop 02; selected card updates to the requested store.
- Console errors: 0 on desktop and mobile.
- External request note: Google Analytics collection was aborted by the isolated headless environment; product API, map, photos, and interaction code loaded successfully.
- Reduced-motion verification: hero and route animation duration resolves to 0.00001 seconds under `prefers-reduced-motion: reduce`.
- Production build: passed with Next.js 16.2.12 and TypeScript.

## Final result

final result: passed
