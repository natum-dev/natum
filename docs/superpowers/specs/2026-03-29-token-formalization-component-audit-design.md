# Design Spec: Token Formalization & Component Audit

> Formalize missing design tokens (spacing, radius, motion, z-index, disabled) and audit existing components against the updated design philosophy.

---

## Overview

The natum-ui design philosophy documents several token categories that are not yet implemented as CSS custom properties. This work adds them to `base.scss`, updates the philosophy doc to reflect decisions made during brainstorming, and audits existing components to adopt the new tokens and conform to the finalized philosophy.

**Approach:** Philosophy doc first → tokens → component audit (Approach C from brainstorming).

---

## Part 1: Token Definitions

### Spacing

4px base grid. Selective scale using multiplier naming — the token number is the multiplier (e.g. `--space-6` = 6 × 4px = 24px). Gaps in numbering are intentional constraints.

| Token | Value |
|-------|-------|
| `--space-1` | 4px |
| `--space-2` | 8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--space-6` | 24px |
| `--space-8` | 32px |
| `--space-12` | 48px |
| `--space-16` | 64px |

Theme-independent. Defined on `:root`.

### Radius

Proportional shape — border radius scales with component size.

| Token | Value | Default for |
|-------|-------|-------------|
| `--radius-sm` | 4px | Small elements |
| `--radius-md` | 8px | Buttons, inputs |
| `--radius-lg` | 12px | Cards |
| `--radius-xl` | 16px | Large surfaces |
| `--radius-full` | 9999px | Pills, avatars |

Theme-independent. Defined on `:root`.

### Motion

Duration maps to **cognitive weight** of the UI event, not physical size:

| Token | Value | Use |
|-------|-------|-----|
| `--duration-fast` | 125ms | Micro-feedback: hover, focus, toggle, checkbox |
| `--duration-normal` | 250ms | Informational feedback: toast slide-in, expand/collapse |
| `--duration-slow` | 450ms | Significant UI events: modal entrance, bottom sheet |

Easing curves (Material Design 3 standard set):

| Token | Value | Use |
|-------|-------|-----|
| `--easing-default` | `cubic-bezier(0.2, 0, 0, 1)` | General state changes (hover, color, opacity) |
| `--easing-enter` | `cubic-bezier(0, 0, 0, 1)` | Elements entering — starts fast, settles gently |
| `--easing-exit` | `cubic-bezier(0.3, 0, 1, 1)` | Elements exiting — gathers speed and vanishes |

Theme-independent. Defined on `:root`.

#### Reduced Motion

Under `@media (prefers-reduced-motion: reduce)`:

1. **Duration token override:** All `--duration-*` tokens are overridden to `100ms`.
2. **Per-component convention:** Components should replace spatial motion (translate, scale) with opacity crossfades where it makes sense. When a crossfade doesn't fit, the shortened duration alone is the fallback.
3. **Principle:** "Reduced means reduced, not removed." The goal is to eliminate vestibular triggers (large spatial movement) while preserving the "something changed" signal (opacity, color).

Research basis:
- ~35% of adults over 40 have some vestibular sensitivity
- High-risk triggers: parallax, full-screen zoom, 3D transforms, spatial translation
- Low-risk: opacity, color, blur changes
- Industry consensus (Apple, Framer Motion, NNGroup): replace transforms with crossfades, don't remove all motion

### Z-Index

1000-base, 100-gap scale. Follows MUI/Chakra convention. Gaps of 100 provide room for sub-layers.

| Token | Value | Usage |
|-------|-------|-------|
| `--z-base` | 0 | Default stacking |
| `--z-dropdown` | 1000 | Dropdown menus, selects, popovers |
| `--z-sticky` | 1100 | Sticky headers, floating actions |
| `--z-overlay` | 1200 | Modal/drawer backdrop |
| `--z-modal` | 1300 | Modal/dialog content |
| `--z-toast` | 1400 | Toast notifications |
| `--z-tooltip` | 1500 | Tooltips (always on top) |

Theme-independent. Defined on `:root`.

The `--z-overlay` layer separates modal backdrop from modal content, solving the backdrop-must-be-below-content problem without sub-values.

### Disabled

Shared disabled tokens using explicit muted colors (not opacity). Components use these by default; may override with grey palette values directly when component anatomy demands it.

| Token | Light | Dark |
|-------|-------|------|
| `--disabled-text` | grey-400 | grey-500 |
| `--disabled-bg` | grey-100 | grey-800 |
| `--disabled-border` | grey-300 | grey-600 |

Theme-dependent. Defined inside `light-scheme` and `dark-scheme` mixins.

Design rationale (vs opacity):
- Opacity interacts unpredictably with backgrounds and stacks multiplicatively
- Explicit colors allow independent tuning of text, bg, and border
- Consistent appearance regardless of what's behind the element
- Carbon and Atlassian use this approach successfully at scale

---

## Part 2: Design Philosophy Doc Updates

Changes to `DESIGN_PHILOSOPHY.md`:

### Pillar 3 — Purposeful Motion
- Update duration tokens to 125ms / 250ms / 450ms
- Add easing tokens: `--easing-default`, `--easing-enter`, `--easing-exit` with cubic-bezier values
- Add cognitive weight principle: duration maps to the importance of the UI event, not physical size
- Add reduced motion subsection with the crossfade-or-shorten convention

### Pillar 4 — Progressive Density
- Replace the generic "space-1 through space-16" description with the actual 8-token selective scale
- Document the multiplier naming convention

### Pillar 5 — Proportional Shape
- Add the explicit token values table

### Z-Index Scale section
- Update from 0/100/200/300/400/500 to 0/1000/1100/1200/1300/1400/1500
- Add `--z-overlay` for modal/drawer backdrops

### Disabled State Convention
- Keep "explicit muted colors, not opacity"
- Replace "each component defines its own disabled color palette" with shared `--disabled-*` tokens
- Add override convention: components use shared tokens by default, may override when anatomy demands it

---

## Part 3: Component Audit

### Scope

5 existing components: Button, IconButton, Typography, Toast, ThemeProvider.

### Audit Checklist (per component)

1. **Token adoption** — replace hardcoded px/ms/color values with new tokens (spacing, radius, motion, z-index, disabled)
2. **Variant naming** — matches philosophy (`soft` not `outlined` for tinted fills)
3. **Disabled state** — uses shared `--disabled-*` tokens, not opacity, not ad-hoc greys
4. **Motion** — uses `--duration-*` and `--easing-*` tokens, respects `prefers-reduced-motion`
5. **Surface-first hierarchy** — follows default variant guidance (Button → `filled`, etc.)
6. **Focus ring** — uses `--focus-ring-color/width/offset` tokens
7. **Z-index** — uses `--z-*` tokens where applicable (Toast)
8. **Logical properties** — `padding-inline`, `margin-inline-start`, etc. for RTL
9. **Accessibility** — ARIA, keyboard nav, 44×44px tap targets, `aria-disabled`

### Out of Scope

- Adding new features or props to existing components
- Writing new tests or stories (unless fixing a broken test from migration)
- Refactoring component architecture

The audit is a conformance pass — bring existing components in line with the finalized philosophy and tokens.

### Audit Order

1. **Button** — most foundational, validates spacing/radius/motion/disabled tokens
2. **IconButton** — shares patterns with Button, quick follow-up
3. **Typography** — simple, mostly spacing token adoption
4. **Toast** — validates z-index and motion tokens
5. **ThemeProvider** — minimal changes expected, mostly conformance check

---

## Execution Plan

### Phase 1: Update `DESIGN_PHILOSOPHY.md`
- Apply all doc changes from Part 2
- Commit

### Phase 2: Add tokens to `base.scss`
- Add spacing, radius, motion, z-index tokens on `:root`
- Add disabled tokens inside `light-scheme` and `dark-scheme` mixins
- Add `prefers-reduced-motion` override block
- Update design tokens `README.md` to document the new tokens
- Commit

### Phase 3: Component audit
- Audit and migrate one component at a time (order above)
- Each component gets its own commit
- Run existing tests after each migration to catch regressions
