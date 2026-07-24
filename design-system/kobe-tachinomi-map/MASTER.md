# Kobe Tachinomi Map — Design System

Generated from UI/UX Pro Max on 2026-07-24, then corrected to the user-approved direction.

## Product principle

Help someone go from 「飲みたいけど店が決まらない」 to a confident shortlist and walking route in under two minutes.

## Experience model

1. **相談する** — free text or one-tap prompts.
2. **3軒で比較する** — photo, area, budget, rating, and why it fits.
3. **地図・コースで決める** — save stores, arrange a route, open Google Maps.

The chat stays visible on the first screen. The list, map, course, detail, and saved views use the same shell and navigation.

## Visual direction

**Name:** Harbor Signal

Refined Japanese street utility: bright white surfaces, cobalt actions with harbor-teal and label-violet supporting accents, cool ink contrast, real storefront photography, compact editorial labels, and highly legible controls. No orange, gold, paper beige, emoji icons, magazine masthead, or oversized Mincho typography.

## Color tokens

| Role | Hex |
|---|---|
| Canvas | `#F4F6F8` |
| Surface | `#FFFFFF` |
| Surface soft | `#EEF2F6` |
| Ink | `#121722` |
| Muted | `#647083` |
| Line | `#DCE2EA` |
| Primary | `#2437D8` |
| Primary hover | `#1727B2` |
| Primary soft | `#E9ECFF` |
| Harbor teal | `#0B7285` |
| Harbor teal soft | `#E6F5F7` |
| Wine violet | `#6D3FC0` |
| Wine violet soft | `#F0EBFB` |
| Success | `#087A61` |
| Destructive | `#C9364A` |
| Focus | `#5265FF` |

All normal text must meet WCAG AA. Orange is forbidden.

## Typography

- Japanese UI and headings: **Zen Kaku Gothic New**, weights 400/500/700/900.
- Latin labels and numerals: **Barlow Condensed**, weights 600/700.
- Base size: 16px; small metadata never below 12px.
- Display headings use compact tracking but must remain readable on Japanese text.

Zen Kaku Gothic New is available through Google Fonts under the SIL Open Font License. It has broad Japanese coverage and a modern, slightly distinctive construction without the heaviness of Dela Gothic One.

## Shape and elevation

- Cards: 18px radius, 1px cool-gray border.
- Inputs and primary controls: 14px radius.
- Pills: 999px radius, 44px minimum tap height when used as a control.
- Shadows are restrained: `0 16px 40px rgba(23, 32, 56, .08)`.
- Never use zero-radius paper/brutalist cards in the core product.

## Navigation

- Desktop: persistent 236px left rail with the four core destinations and a compact “3ステップ” guide.
- Mobile: 60px top bar and four-item safe-area bottom navigation.
- Core destinations: 相談, お店を探す, 地図とコース, 保存。
- The active item must have both color and shape change.

## Interaction

- All primary actions are at least 44×44px.
- Selected cards reveal actions without shifting unrelated content.
- Loading, empty, error, saved, and course-added states are explicit.
- Motion: 160–240ms using opacity/transform only; respect `prefers-reduced-motion`.
- Filters and list/map state remain clear and reversible.

## Responsive checkpoints

- 375px: one-column, bottom navigation, no horizontal page scroll.
- 768px: wider cards and two-column result grids where useful.
- 1024px+: persistent rail; list/map split layouts.
- 1440px: bounded content width and readable line lengths.

## Image rules

- Store photography must render in reserved aspect-ratio boxes to avoid layout shift.
- Broken or stale Google photo references fall back to a real project image, never an emoji or blank placeholder.
- Above-fold images load eagerly; the rest are lazy.
- Use descriptive alt text and keep text outside photography.
- Decorative tachinomi line art uses one flat outline color per motif: cobalt, harbor teal, or label violet. Do not use gradients or multicolor strokes inside a motif. Keep it desktop-only at 16% opacity or less, behind opaque content surfaces.

## Forbidden patterns

- Orange or gold accents.
- Dela Gothic One, Mincho display headlines, or generic Inter-only typography.
- Emoji as navigation, category, marker, or action icons.
- Tiny 11–12px primary UI.
- Full-width desktop lists with no max-width or information grouping.
- Hidden chat entry point, FAB-only chat, or editorial/magazine landing structure.
- `transition: all`, invisible focus, hover-only affordances, and controls below 44px.
