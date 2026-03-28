# Token Formalization & Component Audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Formalize missing design tokens (spacing, radius, motion, z-index, disabled), update the design philosophy doc, and audit 5 existing components to adopt the new tokens and conform to the finalized philosophy.

**Architecture:** Three sequential phases — (1) update DESIGN_PHILOSOPHY.md, (2) add tokens to base.scss, (3) audit components one at a time. Each phase commits independently. The token layer is theme-independent except disabled tokens which are theme-aware.

**Tech Stack:** SCSS (design tokens), React/TypeScript (components), Vitest + RTL (tests)

**Spec:** `docs/superpowers/specs/2026-03-29-token-formalization-component-audit-design.md`

---

## File Map

### Phase 1: Philosophy doc
- Modify: `packages/natum-ui/DESIGN_PHILOSOPHY.md`

### Phase 2: Tokens
- Modify: `packages/natum-ui/src/design-tokens/base.scss`
- Modify: `packages/natum-ui/src/design-tokens/README.md`

### Phase 3: Component audit
- Modify: `packages/natum-ui/src/Button/Button.module.scss`
- Modify: `packages/natum-ui/src/IconButton/IconButton.module.scss`
- Modify: `packages/natum-ui/src/Typography/Typography.module.scss`
- Modify: `packages/natum-ui/src/Toast/Toast.module.scss`
- Modify: `packages/natum-ui/src/ThemeProvider/ThemeProvider.tsx` (conformance check only)

---

## Task 1: Update DESIGN_PHILOSOPHY.md — Purposeful Motion

**Files:**
- Modify: `packages/natum-ui/DESIGN_PHILOSOPHY.md:38-45`

- [ ] **Step 1: Update Pillar 3 — Purposeful Motion**

Replace the current content of Pillar 3 (lines 38–45) with:

```markdown
### 3. Purposeful Motion

- **CSS transitions** for state changes (hover, focus, active)
- **CSS keyframe animations** for entrances/exits (toast slide-in, modal fade-scale, skeleton shimmer)
- No animation library dependencies — pure CSS
- All motion wrapped in `@media (prefers-reduced-motion: no-preference)` or handled via reduced-motion token overrides
- Duration maps to **cognitive weight** of the UI event, not physical size:
  - `--duration-fast` (125ms) — micro-feedback: hover, focus, toggle, checkbox
  - `--duration-normal` (250ms) — informational feedback: toast slide-in, expand/collapse
  - `--duration-slow` (450ms) — significant UI events: modal entrance, bottom sheet
- Easing curves (Material Design 3 standard set):
  - `--easing-default` (`cubic-bezier(0.2, 0, 0, 1)`) — general state changes
  - `--easing-enter` (`cubic-bezier(0, 0, 0, 1)`) — elements entering (decelerate)
  - `--easing-exit` (`cubic-bezier(0.3, 0, 1, 1)`) — elements exiting (accelerate)

#### Reduced Motion

Under `@media (prefers-reduced-motion: reduce)`, all `--duration-*` tokens are overridden to `100ms`. Components should replace spatial motion (translate, scale) with opacity crossfades where it makes sense. When a crossfade doesn't fit the animation, the shortened duration alone is the fallback.

**Principle:** "Reduced means reduced, not removed." Eliminate vestibular triggers (large spatial movement) while preserving the "something changed" signal (opacity, color).
```

- [ ] **Step 2: Verify the edit**

Read `DESIGN_PHILOSOPHY.md` and confirm Pillar 3 now contains the updated content with duration tokens (125/250/450), easing curves, cognitive weight principle, and reduced motion subsection.

- [ ] **Step 3: Commit**

```bash
cd packages/natum-ui
git add DESIGN_PHILOSOPHY.md
git commit -m "docs(design-philosophy): update Purposeful Motion with finalized token values

Duration tokens: 125ms/250ms/450ms mapped to cognitive weight.
Easing: default/enter/exit curves (M3 standard set).
Reduced motion: override durations to 100ms, crossfade spatial motion."
```

---

## Task 2: Update DESIGN_PHILOSOPHY.md — Progressive Density (Spacing)

**Files:**
- Modify: `packages/natum-ui/DESIGN_PHILOSOPHY.md:47-52`

- [ ] **Step 1: Update Pillar 4 — Progressive Density**

Replace the current spacing description in Pillar 4 (lines 47–52) with:

```markdown
### 4. Progressive Density

- **4px base grid**, components default to **8px-aligned** sizes
- 4px increments reserved for internal component details (icon gaps, border offsets)
- Spacing token scale (selective, multiplier naming — `--space-N` = N × 4px):

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

- Gaps in numbering are intentional constraints — excluded values are not part of the scale
- Three core sizes: `sm`, `md`, `lg` — every component supports these
- Opt-in extremes: `xs`, `xl` — only added to a component when justified by a real use case
```

- [ ] **Step 2: Verify the edit**

Read `DESIGN_PHILOSOPHY.md` and confirm Pillar 4 now contains the 8-token spacing scale with multiplier naming.

- [ ] **Step 3: Commit**

```bash
cd packages/natum-ui
git add DESIGN_PHILOSOPHY.md
git commit -m "docs(design-philosophy): update Progressive Density with spacing token scale

8-token selective scale on 4px grid: space-1 (4px) through space-16 (64px).
Multiplier naming convention: --space-N = N * 4px."
```

---

## Task 3: Update DESIGN_PHILOSOPHY.md — Proportional Shape (Radius)

**Files:**
- Modify: `packages/natum-ui/DESIGN_PHILOSOPHY.md:54-59`

- [ ] **Step 1: Update Pillar 5 — Proportional Shape**

Replace the current content of Pillar 5 (lines 54–59) with:

```markdown
### 5. Proportional Shape

- Border radius scales with component size
- Token scale:

| Token | Value | Default for |
|-------|-------|-------------|
| `--radius-sm` | 4px | Small elements |
| `--radius-md` | 8px | Buttons, inputs |
| `--radius-lg` | 12px | Cards |
| `--radius-xl` | 16px | Large surfaces |
| `--radius-full` | 9999px | Pills, avatars |

- Small interactive elements stay crisp, large surfaces feel warmer
```

- [ ] **Step 2: Verify the edit**

Read `DESIGN_PHILOSOPHY.md` and confirm Pillar 5 now contains the 5-token radius scale with default-for column.

- [ ] **Step 3: Commit**

```bash
cd packages/natum-ui
git add DESIGN_PHILOSOPHY.md
git commit -m "docs(design-philosophy): update Proportional Shape with radius token scale

5 tokens: radius-sm (4px) through radius-full (9999px).
Defaults: buttons/inputs=md, cards=lg, avatars=full."
```

---

## Task 4: Update DESIGN_PHILOSOPHY.md — Z-Index Scale

**Files:**
- Modify: `packages/natum-ui/DESIGN_PHILOSOPHY.md:133-144`

- [ ] **Step 1: Update the Z-Index Scale section**

Replace the current Z-Index Scale table (lines 133–144) with:

```markdown
## Z-Index Scale

1000-base, 100-gap scale. Follows MUI/Chakra convention. Gaps of 100 provide room for sub-layers when needed.

| Token | Value | Usage |
|-------|-------|-------|
| `--z-base` | 0 | Default stacking |
| `--z-dropdown` | 1000 | Dropdown menus, selects, popovers |
| `--z-sticky` | 1100 | Sticky headers, floating actions |
| `--z-overlay` | 1200 | Modal/drawer backdrop |
| `--z-modal` | 1300 | Modal/dialog content |
| `--z-toast` | 1400 | Toast notifications |
| `--z-tooltip` | 1500 | Tooltips (always on top) |
```

- [ ] **Step 2: Verify the edit**

Read `DESIGN_PHILOSOPHY.md` and confirm the Z-Index table now uses 1000-base values with the `--z-overlay` layer added.

- [ ] **Step 3: Commit**

```bash
cd packages/natum-ui
git add DESIGN_PHILOSOPHY.md
git commit -m "docs(design-philosophy): update z-index scale to 1000-base with 100-gap

Shifted from 0-500 to 0-1500. Added --z-overlay (1200) for backdrops.
Follows MUI/Chakra convention with room for sub-layers."
```

---

## Task 5: Update DESIGN_PHILOSOPHY.md — Disabled State Convention

**Files:**
- Modify: `packages/natum-ui/DESIGN_PHILOSOPHY.md:93-100`

- [ ] **Step 1: Update the Disabled State Convention section**

Replace the current Disabled State Convention section (lines 93–100) with:

```markdown
## Disabled State Convention

- Use shared disabled tokens — **not opacity**:

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--disabled-text` | grey-400 | grey-500 | Labels, icons |
| `--disabled-bg` | grey-100 | grey-800 | Container fills |
| `--disabled-border` | grey-300 | grey-600 | Outlines |

- Components use shared tokens by default; may override with grey palette values when component anatomy demands it
- `cursor: not-allowed`
- `pointer-events: none` on interactive children
- Keep in DOM — screen readers should find it via `aria-disabled="true"`
- Removed from tab order (`tabIndex: -1` for non-native elements), matching native `<button disabled>` behavior. Screen readers discover disabled elements via browse mode regardless of tabIndex.
```

- [ ] **Step 2: Verify the edit**

Read `DESIGN_PHILOSOPHY.md` and confirm the Disabled State section now references shared `--disabled-*` tokens with the light/dark values.

- [ ] **Step 3: Commit**

```bash
cd packages/natum-ui
git add DESIGN_PHILOSOPHY.md
git commit -m "docs(design-philosophy): update disabled convention to shared tokens

Replace per-component disabled colors with shared --disabled-text/bg/border tokens.
Explicit muted colors (not opacity). Components may override when anatomy demands it."
```

---

## Task 6: Add tokens to base.scss — Spacing, Radius, Motion, Z-Index

**Files:**
- Modify: `packages/natum-ui/src/design-tokens/base.scss:198-206`

- [ ] **Step 1: Add theme-independent tokens to `:root`**

In `base.scss`, find the `:root` block (line 198) and add the new tokens after `@include light-scheme;` (line 200) and before the `prefers-color-scheme` media query (line 203):

```scss
:root {
  @include register-variable($palette, "palette");
  @include light-scheme;

  // --- Spacing tokens (4px base grid, multiplier naming) ---
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;
  --space-16: 64px;

  // --- Radius tokens ---
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;

  // --- Motion tokens ---
  --duration-fast: 125ms;
  --duration-normal: 250ms;
  --duration-slow: 450ms;
  --easing-default: cubic-bezier(0.2, 0, 0, 1);
  --easing-enter: cubic-bezier(0, 0, 0, 1);
  --easing-exit: cubic-bezier(0.3, 0, 1, 1);

  // --- Z-index tokens ---
  --z-base: 0;
  --z-dropdown: 1000;
  --z-sticky: 1100;
  --z-overlay: 1200;
  --z-modal: 1300;
  --z-toast: 1400;
  --z-tooltip: 1500;

  // Prevent flash: match bg-color to user preference before JS hydrates
  @media (prefers-color-scheme: dark) {
    --neutral-bg: #{get-color(grey, 900)};
  }
}
```

- [ ] **Step 2: Verify the edit**

Read `base.scss` and confirm all spacing, radius, motion, and z-index tokens are present inside `:root`.

- [ ] **Step 3: Commit**

```bash
cd packages/natum-ui
git add src/design-tokens/base.scss
git commit -m "feat(design-tokens): add spacing, radius, motion, and z-index tokens

Spacing: 8-token selective scale (space-1 through space-16).
Radius: sm/md/lg/xl/full.
Motion: duration-fast/normal/slow (125/250/450ms), easing-default/enter/exit.
Z-index: 1000-base scale with overlay/modal/toast/tooltip layers."
```

---

## Task 7: Add tokens to base.scss — Disabled tokens + Reduced motion

**Files:**
- Modify: `packages/natum-ui/src/design-tokens/base.scss` (inside `light-scheme` and `dark-scheme` mixins)

- [ ] **Step 1: Add disabled tokens to light-scheme mixin**

In the `light-scheme` mixin, after the focus tokens (line 99), add:

```scss
  // Disabled
  --disabled-text: #{get-color(grey, 400)};
  --disabled-bg: #{get-color(grey, 100)};
  --disabled-border: #{get-color(grey, 300)};
```

- [ ] **Step 2: Add disabled tokens to dark-scheme mixin**

In the `dark-scheme` mixin, after the focus tokens (line 192), add:

```scss
  // Disabled
  --disabled-text: #{get-color(grey, 500)};
  --disabled-bg: #{get-color(grey, 800)};
  --disabled-border: #{get-color(grey, 600)};
```

- [ ] **Step 3: Add reduced motion override block**

After the closing `}` of the `:root` block and before the `body` block, add:

```scss
// Reduced motion: shorten all durations, components handle spatial→opacity swap
@media (prefers-reduced-motion: reduce) {
  :root {
    --duration-fast: 100ms;
    --duration-normal: 100ms;
    --duration-slow: 100ms;
  }
}
```

- [ ] **Step 4: Verify the edits**

Read `base.scss` and confirm:
1. `--disabled-text/bg/border` exist in both `light-scheme` and `dark-scheme`
2. The `prefers-reduced-motion` block exists between `:root` and `body`

- [ ] **Step 5: Run the build to verify SCSS compiles**

```bash
cd packages/natum-ui && pnpm build
```

Expected: Build succeeds with no errors.

- [ ] **Step 6: Commit**

```bash
cd packages/natum-ui
git add src/design-tokens/base.scss
git commit -m "feat(design-tokens): add disabled tokens and reduced motion override

Disabled: --disabled-text/bg/border with light and dark theme values.
Reduced motion: all duration tokens overridden to 100ms under prefers-reduced-motion."
```

---

## Task 8: Update design-tokens README.md

**Files:**
- Modify: `packages/natum-ui/src/design-tokens/README.md`

- [ ] **Step 1: Add Spacing section**

After the "Semantic Color Tokens" section (after line 109), add a new section:

```markdown
---

## Spacing

4px base grid with selective scale. Token naming uses multipliers: `--space-N` = N × 4px.

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

Gaps in numbering are intentional — excluded values are not part of the scale.

```scss
.card {
  padding: var(--space-4);
  gap: var(--space-2);
}
```
```

- [ ] **Step 2: Add Radius section**

After the Spacing section, add:

```markdown
---

## Radius

Border radius scales with component size. Proportional shape — small elements stay crisp, large surfaces feel warmer.

| Token | Value | Default for |
|-------|-------|-------------|
| `--radius-sm` | 4px | Small elements |
| `--radius-md` | 8px | Buttons, inputs |
| `--radius-lg` | 12px | Cards |
| `--radius-xl` | 16px | Large surfaces |
| `--radius-full` | 9999px | Pills, avatars |

```scss
.button {
  border-radius: var(--radius-md);
}

.card {
  border-radius: var(--radius-lg);
}
```
```

- [ ] **Step 3: Add Motion section**

After the Radius section, add:

```markdown
---

## Motion

Duration maps to **cognitive weight** of the UI event, not physical size.

### Duration

| Token | Value | Use |
|-------|-------|-----|
| `--duration-fast` | 125ms | Micro-feedback: hover, focus, toggle |
| `--duration-normal` | 250ms | Informational feedback: toast, expand/collapse |
| `--duration-slow` | 450ms | Significant UI events: modal entrance, bottom sheet |

### Easing

| Token | Value | Use |
|-------|-------|-----|
| `--easing-default` | `cubic-bezier(0.2, 0, 0, 1)` | General state changes |
| `--easing-enter` | `cubic-bezier(0, 0, 0, 1)` | Elements entering (decelerate) |
| `--easing-exit` | `cubic-bezier(0.3, 0, 1, 1)` | Elements exiting (accelerate) |

```scss
.button {
  transition: background-color var(--duration-fast) var(--easing-default);
}

.modal {
  animation: fade-scale-in var(--duration-slow) var(--easing-enter);
}
```

### Reduced Motion

Under `@media (prefers-reduced-motion: reduce)`, all `--duration-*` tokens are overridden to `100ms`. Components should also replace spatial motion (translate, scale) with opacity crossfades where appropriate:

```scss
.modal-enter {
  animation: fade-scale-in var(--duration-slow) var(--easing-enter);
}

@media (prefers-reduced-motion: reduce) {
  .modal-enter {
    animation-name: fade-in; // opacity-only fallback
  }
}
```
```

- [ ] **Step 4: Add Z-Index section**

After the Motion section, add:

```markdown
---

## Z-Index

1000-base, 100-gap scale. Gaps provide room for sub-layers when needed.

| Token | Value | Usage |
|-------|-------|-------|
| `--z-base` | 0 | Default stacking |
| `--z-dropdown` | 1000 | Dropdown menus, selects, popovers |
| `--z-sticky` | 1100 | Sticky headers, floating actions |
| `--z-overlay` | 1200 | Modal/drawer backdrop |
| `--z-modal` | 1300 | Modal/dialog content |
| `--z-toast` | 1400 | Toast notifications |
| `--z-tooltip` | 1500 | Tooltips |

```scss
.toast-container {
  z-index: var(--z-toast);
}
```
```

- [ ] **Step 5: Add Disabled section**

After the Z-Index section, add:

```markdown
---

## Disabled

Shared disabled tokens using explicit muted colors (not opacity). Theme-aware — values switch between light and dark mode.

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--disabled-text` | grey-400 | grey-500 | Labels, icons |
| `--disabled-bg` | grey-100 | grey-800 | Container fills |
| `--disabled-border` | grey-300 | grey-600 | Outlines |

Components use shared tokens by default. Override with grey palette values when component anatomy demands different treatment.

```scss
.button.disabled {
  color: var(--disabled-text);
  background-color: var(--disabled-bg);
  cursor: not-allowed;
  pointer-events: none;
}
```
```

- [ ] **Step 6: Verify the README**

Read `README.md` and confirm all 5 new sections (Spacing, Radius, Motion, Z-Index, Disabled) are present with correct values.

- [ ] **Step 7: Commit**

```bash
cd packages/natum-ui
git add src/design-tokens/README.md
git commit -m "docs(design-tokens): document spacing, radius, motion, z-index, disabled tokens

Complete README coverage for all new token categories with usage examples."
```

---

## Task 9: Audit Button

**Files:**
- Modify: `packages/natum-ui/src/Button/Button.module.scss`

**Current issues found:**
1. `transition: all 0.25s ease` (line 17) — hardcoded duration/easing, uses `all` (wasteful)
2. `border-radius: 8px` (line 20) — hardcoded, should be `var(--radius-md)`
3. `padding: 10px 16px` (line 10) — 10px is not on the 4px grid. Closest: `var(--space-3)` (12px) vertical, `var(--space-4)` (16px) horizontal
4. Disabled state uses `--neutral-text-disabled` and `--neutral-bg-inset` (lines 63-78) — should use `--disabled-text` and `--disabled-bg`

- [ ] **Step 1: Fix transition**

Replace line 17:
```scss
// old
transition: all 0.25s ease;
// new
transition: background-color var(--duration-fast) var(--easing-default),
            color var(--duration-fast) var(--easing-default),
            filter var(--duration-fast) var(--easing-default);
```

- [ ] **Step 2: Fix border-radius**

Replace line 20:
```scss
// old
border-radius: 8px;
// new
border-radius: var(--radius-md);
```

- [ ] **Step 3: Fix padding**

Replace line 10:
```scss
// old
padding: 10px 16px;
// new
padding: var(--space-3) var(--space-4);
```

- [ ] **Step 4: Fix disabled state**

Replace the disabled block (lines 62-78):
```scss
// Disabled
.disabled {
  color: var(--disabled-text);
  cursor: not-allowed;
  pointer-events: none;

  &.filled {
    background-color: var(--disabled-bg);
  }

  &.soft {
    background-color: var(--disabled-bg);
    color: var(--disabled-text);
  }

  &.text {
    background: none;
  }
}
```

- [ ] **Step 5: Run tests**

```bash
cd packages/natum-ui && pnpm vitest run src/Button/Button.test.tsx
```

Expected: All 11 tests pass. These tests check class names and behavior, not CSS values, so token migration should not break them.

- [ ] **Step 6: Commit**

```bash
cd packages/natum-ui
git add src/Button/Button.module.scss
git commit -m "refactor(Button): adopt design tokens for spacing, radius, motion, disabled

Replace hardcoded values with --space-*, --radius-md, --duration-fast,
--easing-default, and --disabled-* tokens."
```

---

## Task 10: Audit IconButton

**Files:**
- Modify: `packages/natum-ui/src/IconButton/IconButton.module.scss`

**Current issues found:**
1. `transition: all 0.25s ease` (line 10) — hardcoded duration/easing, uses `all`
2. `border-radius: 50%` (line 9) — this is correct for a circular button, but should use `--radius-full` for consistency
3. Size classes use hardcoded px (lines 189-202) — these are hit target sizes (32/40/48), not from the spacing scale. Keep as-is since they define tap target dimensions, not spacing.
4. Disabled state uses `--neutral-text-disabled` and `--neutral-bg-inset` (lines 205-211) — should use `--disabled-text` and `--disabled-bg`
5. Close button transition `all 0.15s ease` (line 167 — that's in Toast, not here). Spinner animation `0.8s` (line 215) — functional, not a design token candidate.

- [ ] **Step 1: Fix transition**

Replace line 10:
```scss
// old
transition: all 0.25s ease;
// new
transition: background-color var(--duration-fast) var(--easing-default),
            color var(--duration-fast) var(--easing-default),
            filter var(--duration-fast) var(--easing-default);
```

- [ ] **Step 2: Fix border-radius**

Replace line 9:
```scss
// old
border-radius: 50%;
// new
border-radius: var(--radius-full);
```

- [ ] **Step 3: Fix disabled state**

Replace lines 205-211:
```scss
// Disabled
.disabled {
  --icon-button-color: var(--disabled-text);
  --icon-button-main-color: var(--disabled-bg);
  cursor: not-allowed;
  pointer-events: none;
  box-shadow: none;
}
```

- [ ] **Step 4: Run tests**

```bash
cd packages/natum-ui && pnpm vitest run src/IconButton/IconButton.test.tsx
```

Expected: All 10 tests pass.

- [ ] **Step 5: Commit**

```bash
cd packages/natum-ui
git add src/IconButton/IconButton.module.scss
git commit -m "refactor(IconButton): adopt design tokens for motion, radius, disabled

Replace hardcoded transition/radius/disabled values with
--duration-fast, --easing-default, --radius-full, --disabled-* tokens."
```

---

## Task 11: Audit Typography

**Files:**
- Modify: `packages/natum-ui/src/Typography/Typography.module.scss`

**Current issues found:**
1. Disabled color uses `--neutral-text-disabled` (line 29) — should use `--disabled-text`
2. No other token issues — Typography doesn't use spacing, radius, motion, or z-index in its SCSS. Typography spacing comes from the `$typography-preset` Sass map which is a different system.

- [ ] **Step 1: Fix disabled color**

Replace line 29:
```scss
// old
.disabled {
  color: var(--neutral-text-disabled);
}
// new
.disabled {
  color: var(--disabled-text);
}
```

- [ ] **Step 2: Run tests**

```bash
cd packages/natum-ui && pnpm vitest run src/Typography/Typography.test.tsx
```

Expected: All tests pass.

- [ ] **Step 3: Commit**

```bash
cd packages/natum-ui
git add src/Typography/Typography.module.scss
git commit -m "refactor(Typography): adopt --disabled-text token for disabled color

Replace --neutral-text-disabled with shared --disabled-text token."
```

---

## Task 12: Audit Toast

**Files:**
- Modify: `packages/natum-ui/src/Toast/Toast.module.scss`

**Current issues found:**
1. `z-index: 9999` (line 5) — should use `var(--z-toast)`
2. `gap: 8px` (line 8) — should use `var(--space-2)`
3. `padding: 16px` (line 9) — should use `var(--space-4)`
4. `gap: 12px` (line 49) — should use `var(--space-3)`
5. `padding: 12px 16px` (line 50) — should use `var(--space-3) var(--space-4)`
6. `border-radius: 8px` (line 51) — should use `var(--radius-md)`
7. Animation durations hardcoded: `0.2s` (line 68), `0.15s` (line 72) — should use `var(--duration-normal)` for enter, a calc or the token directly for exit
8. Animation easings hardcoded: `ease-out` (line 68), `ease-in` (line 72) — should use `var(--easing-enter)` and `var(--easing-exit)`
9. Close button `border-radius: 4px` (line 164) — should use `var(--radius-sm)`
10. Close button `transition: all 0.15s ease` (line 166) — should use tokens
11. Close button `width: 24px; height: 24px` (lines 162-163) — 24px = `--space-6`, but these are hit target dimensions. Keep as-is since 24px is below the 44px minimum tap target. Note: this is a pre-existing accessibility issue, not in scope for this audit.
12. Positional classes use `top/right/bottom/left` (lines 13-43) — should use logical properties (`inset-block-start`, `inset-inline-end`, etc.) for RTL support
13. `margin-bottom: 2px` (line 113), `margin-top: 6px` (line 135), `margin-top: 2px` (line 100) — small internal offsets, not from spacing scale. Keep as-is.

- [ ] **Step 1: Fix z-index, container spacing**

Replace lines 4-10:
```scss
.toast_container {
  position: fixed;
  z-index: var(--z-toast);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-4);
  pointer-events: none;
}
```

- [ ] **Step 2: Fix positional classes to use logical properties**

Replace lines 13-43:
```scss
.top_right {
  inset-block-start: 0;
  inset-inline-end: 0;
}

.top_left {
  inset-block-start: 0;
  inset-inline-start: 0;
}

.top_center {
  inset-block-start: 0;
  inset-inline-start: 50%;
  transform: translateX(-50%);
}

.bottom_right {
  inset-block-end: 0;
  inset-inline-end: 0;
}

.bottom_left {
  inset-block-end: 0;
  inset-inline-start: 0;
}

.bottom_center {
  inset-block-end: 0;
  inset-inline-start: 50%;
  transform: translateX(-50%);
}
```

- [ ] **Step 3: Fix toast item spacing, radius**

Replace lines 48-52 (inside `.toast`):
```scss
.toast {
  pointer-events: auto;
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  background: var(--toast-bg, var(--info-soft));
  box-shadow: var(--shadow-high);
  min-width: 300px;
  max-width: 420px;

  --toast-accent-color: var(--info-text);
}
```

- [ ] **Step 4: Fix animation durations and easings**

Replace lines 67-73:
```scss
// Animation
.entering {
  animation: toast_slide_in var(--duration-normal) var(--easing-enter) forwards;
}

.exiting {
  animation: toast_slide_out var(--duration-normal) var(--easing-exit) forwards;
}
```

- [ ] **Step 5: Add reduced motion override**

After the `@keyframes toast_slide_out` block (after line 95), add:

```scss
@media (prefers-reduced-motion: reduce) {
  .entering {
    animation-name: toast_fade_in;
  }

  .exiting {
    animation-name: toast_fade_out;
  }
}

@keyframes toast_fade_in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes toast_fade_out {
  from { opacity: 1; }
  to { opacity: 0; }
}
```

- [ ] **Step 6: Fix close button radius and transition**

Replace lines 164-166:
```scss
    border-radius: var(--radius-sm);
    color: var(--neutral-text-disabled);
    transition: background-color var(--duration-fast) var(--easing-default),
                color var(--duration-fast) var(--easing-default);
```

- [ ] **Step 7: Run tests**

```bash
cd packages/natum-ui && pnpm vitest run src/Toast/
```

Expected: All Toast tests pass.

- [ ] **Step 8: Commit**

```bash
cd packages/natum-ui
git add src/Toast/Toast.module.scss
git commit -m "refactor(Toast): adopt design tokens and add reduced motion support

Replace hardcoded z-index, spacing, radius, duration, easing with tokens.
Add opacity-only crossfade animations for prefers-reduced-motion.
Convert positional properties to logical equivalents for RTL."
```

---

## Task 13: Audit ThemeProvider

**Files:**
- Review: `packages/natum-ui/src/ThemeProvider/ThemeProvider.tsx`

**Current issues found:** None. ThemeProvider is a pure React component that manages the `data-theme` attribute on `<body>`. It does not use any CSS, spacing, radius, motion, z-index, or disabled tokens. It correctly uses `useState`, `useCallback`, `useMemo`, `useEffect`, and forwards the theme context.

- [ ] **Step 1: Confirm no changes needed**

Read `ThemeProvider.tsx` and `ThemeContext.ts` (if it exists). Verify:
1. No hardcoded colors, spacing, or timing values
2. Sets `data-theme` on `<body>` (which drives the light/dark scheme mixins)
3. No CSS module import (no styling to audit)

- [ ] **Step 2: Run tests**

```bash
cd packages/natum-ui && pnpm vitest run src/ThemeProvider/
```

Expected: All tests pass.

- [ ] **Step 3: No commit needed**

ThemeProvider conforms to the philosophy as-is. No changes required.

---

## Task 14: Final verification

- [ ] **Step 1: Run the full test suite**

```bash
cd packages/natum-ui && pnpm test
```

Expected: All tests pass.

- [ ] **Step 2: Run the build**

```bash
cd packages/natum-ui && pnpm build
```

Expected: Build succeeds. `dist/` contains compiled output with new CSS custom properties.

- [ ] **Step 3: Verify Storybook compiles (optional)**

```bash
cd packages/natum-ui && pnpm storybook --ci --smoke-test 2>/dev/null || echo "Storybook smoke test not available, skip"
```

If Storybook runs, verify components render correctly with new tokens. If not available as a CI command, skip — visual verification can happen manually.
