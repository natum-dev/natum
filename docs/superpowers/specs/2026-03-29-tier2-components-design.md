# Tier 2 Components — Design Spec

> Completing the remaining Tier 2 components (Checkbox, Tooltip, Breadcrumb, Figure, Skeleton) to finish the foundation before Phase 2 (Beta) of the Vault project.

---

## 1. Checkbox

### Purpose

Selection control for both form contexts ("Remember me") and dense data contexts (multi-select file rows).

### Visual Style

- **Filled** — unchecked: outlined box with rounded corners. Checked: primary-color filled box with white checkmark SVG. Indeterminate: primary-color filled box with white horizontal dash.
- Border color on unchecked state uses neutral grey (grey-400 light / grey-500 dark); on hover, border shifts to the active `color` (primary by default).

### States

| State | Visual |
|-------|--------|
| Unchecked | Outlined box, neutral border |
| Checked | Primary-fill box, white checkmark |
| Indeterminate | Primary-fill box, white dash |
| Disabled | Uses `--disabled-text`, `--disabled-bg`, `--disabled-border` tokens. `cursor: not-allowed`, `aria-disabled="true"` |

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `checked` | `boolean` | — | Controlled checked state |
| `defaultChecked` | `boolean` | `false` | Uncontrolled initial state |
| `indeterminate` | `boolean` | `false` | Indeterminate visual state |
| `label` | `ReactNode` | — | Optional label rendered next to the checkbox. When omitted, `aria-label` or `aria-labelledby` is required |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Box size: 16px / 20px / 24px |
| `color` | Semantic color union | `"primary"` | Fill color when checked/indeterminate |
| `disabled` | `boolean` | `false` | Disables interaction |
| `onChange` | `(event) => void` | — | Change handler |
| `className` | `string` | — | Escape hatch |
| `...rest` | HTML attributes | — | Spread to root element |

### Sizes

| Size | Box | Hit Area |
|------|-----|----------|
| `sm` | 16px | 44px (via padding/pseudo-element) |
| `md` | 20px | 44px (via padding/pseudo-element) |
| `lg` | 24px | 44px (via padding/pseudo-element) |

The 44px minimum hit area is always enforced on the checkbox box itself. The label does not have its own 44px enforcement — clicking it activates the checkbox.

### Label Behavior

- When `label` is provided: renders an associated `<label>` element wrapping or `htmlFor`-linked to the input. Label accepts `ReactNode` for rich content.
- When `label` is omitted: renders only the checkbox. Developer must provide `aria-label` or `aria-labelledby` for accessibility.

### Control Mode

Uses the existing `useControllable` hook for controlled/uncontrolled support.

### Keyboard

- `Space` — toggles checked state
- Native `<input type="checkbox">` handles this by default

### Motion

- Check/uncheck transition: `--duration-fast` (125ms), `--easing-default`. Checkmark draws in via SVG stroke animation or scale.
- Reduced motion: duration drops to 100ms, opacity crossfade instead of spatial animation.

---

## 2. Tooltip

### Purpose

Hover/focus tooltip positioned relative to a trigger element. Used for truncated filenames, icon-only button labels, and short contextual messages.

### Positioning

- CSS-based positioning, no external library.
- Shared `useAnchorPosition` hook that calculates placement relative to a trigger element and handles viewport collision (flip to opposite side when near edges).
- This hook will also be used by a future `SelectionPopover` component that anchors to text selections.

### Trigger Behavior

- **Desktop:** Show on hover with ~200ms delay (prevents flicker). Also shows on keyboard focus of trigger.
- **Mobile:** Show on tap of trigger element.
- **Dismiss:** Hides on mouse leave, focus blur, `Escape` key, or scroll.

### Content

- Accepts `ReactNode` — intended for short messages but supports bold text, links, etc.
- When content is interactive (contains links/buttons), the tooltip must remain open while the user interacts with it.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `ReactNode` | — | Tooltip content |
| `placement` | `"top" \| "bottom" \| "left" \| "right"` | `"top"` | Preferred placement (flips on collision) |
| `delay` | `number` | `200` | Hover delay in ms before showing |
| `children` | `ReactElement` | — | Trigger element |
| `className` | `string` | — | Escape hatch for tooltip container |
| `...rest` | HTML attributes | — | Spread to tooltip container |

### Animation

- **Show:** Fade in with `--duration-fast` (125ms), `--easing-enter`
- **Hide:** Fade out with `--duration-fast`, `--easing-exit`
- **Reduced motion:** Duration drops to 100ms, opacity-only (no spatial motion to remove)

### Accessibility

- Tooltip container has `role="tooltip"` and a generated `id`
- Trigger element gets `aria-describedby` pointing to the tooltip `id`
- `Escape` key dismisses the tooltip

### Z-Index

Uses `--z-tooltip` (1500) from the design system.

---

## 3. Breadcrumb

### Purpose

Path navigation with clickable segments for folder hierarchy: `Home > Documents > Reports`.

### Segments

- Each segment is a clickable link that navigates to that location.
- The last segment is the current location — rendered as plain text (not a link) with `aria-current="page"`.

### Overflow

- When segments exceed a threshold (default: 4 visible), middle segments collapse into an ellipsis (`...`) button.
- Clicking the ellipsis opens a **dropdown menu** listing the hidden segments as clickable links.
- First segment (root) and last 2 segments always remain visible.

### Separator

- Configurable via `separator` prop (accepts `ReactNode`).
- Default: chevron icon (`›`).
- Separator is purely decorative — hidden from screen readers via `aria-hidden="true"`.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `BreadcrumbItem[]` | — | Breadcrumb segments |
| `separator` | `ReactNode` | `›` (chevron) | Separator between segments |
| `maxVisible` | `number` | `4` | Max visible segments before collapsing |
| `className` | `string` | — | Escape hatch |

### BreadcrumbItem Props

| Prop | Type | Description |
|------|------|-------------|
| `href` | `string` | Navigation target. Omit for current page (last segment) |
| `children` | `ReactNode` | Segment label |
| `onClick` | `(event) => void` | Click handler (for SPA navigation) |

### Accessibility

- Container: `<nav aria-label="Breadcrumb">`
- List: `<ol>` with `<li>` for each segment
- Current page: `aria-current="page"` on last segment
- Ellipsis button: `aria-label="Show hidden breadcrumbs"`, `aria-expanded` state

### Keyboard

- All segments and the ellipsis button are focusable via Tab
- `Enter` activates links and the ellipsis button
- When dropdown is open: `Escape` closes it, arrow keys navigate items

---

## 4. Figure

### Purpose

Generic layout component for combining an illustration, body text, and actions. Replaces the originally planned `EmptyState` — the Vault app will compose its own empty states using Figure.

### Layout Modes

- **`horizontal`** — left-aligned, three sections in a row (follows RTL direction): illustration → title & description → action
- **`vertical`** — centered, three sections stacked top to bottom: illustration → title & description → action

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `layout` | `"horizontal" \| "vertical"` | `"vertical"` | Layout direction |
| `illustration` | `ReactNode` | — | Visual element (icon, SVG, image) |
| `title` | `ReactNode` | — | Primary message |
| `description` | `ReactNode` | — | Secondary message |
| `action` | `ReactNode` | — | CTA slot (single button, multiple buttons, any content) |
| `className` | `string` | — | Escape hatch |

### Data Attributes

Each section is targetable via `data-figure-section` for styling overrides:

- `[data-figure-section="illustration"]`
- `[data-figure-section="body"]` (wraps title + description)
- `[data-figure-section="action"]`

### Default Alignment

- Horizontal: left-aligned (uses logical properties for RTL)
- Vertical: centered

Both overridable via `className` targeting `data-figure-section` selectors.

### Illustrations

Ship an `EmptyState` SVG illustration in natum-ui that apps can use with Figure or independently. Additional illustrations added as needed during Vault development.

---

## 5. Skeleton

### Purpose

Loading placeholder that mimics content shape. Primitive approach — each Skeleton is a single shape, composed by the consuming app to build loading layouts.

### Variants

| Variant | Description |
|---------|-------------|
| `text` | Rounded rectangle matching text line height. Height scales to font size. |
| `rectangular` | Block shape for images, cards, thumbnails |
| `circular` | Circle for avatars, icons |

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `"text" \| "rectangular" \| "circular"` | `"text"` | Shape type |
| `width` | `string \| number` | `"100%"` | Width |
| `height` | `string \| number` | — | Height (text variant derives from font size if omitted) |
| `borderRadius` | `string \| number` | — | Custom border radius override |
| `className` | `string` | — | Escape hatch |

### Animation

- **Default:** Horizontal shimmer sweep via CSS `@keyframes` — a translucent gradient moves left to right across the shape.
- **Reduced motion:** Replaces shimmer sweep with a subtle opacity pulse (fade in/out cycle). No spatial motion.
- Uses `--duration-normal` (250ms) for the pulse, shimmer sweep runs on a longer cycle (~1.5s).

### Colors

- Light mode: `--disabled-bg` (grey-100) base with lighter sweep highlight
- Dark mode: `--disabled-bg` (grey-800) base with lighter sweep highlight
- No semantic color prop — Skeleton is always neutral

### Accessibility

- `aria-hidden="true"` — skeleton is a visual placeholder, not content
- Screen readers should encounter the loading state via a parent container's `aria-busy="true"` or a visually hidden "Loading..." label, not through the skeleton itself

---

## Shared Infrastructure

### `useAnchorPosition` Hook

Shared positioning hook for Tooltip and future SelectionPopover.

**Input:**
- Anchor reference: element `RefObject` or `DOMRect` (for selection ranges)
- Preferred placement: `"top" | "bottom" | "left" | "right"`
- Offset: gap between anchor and floating element

**Output:**
- Calculated `top`, `left` position (CSS values)
- Actual placement after collision detection (may differ from preferred)

**Behavior:**
- Calculates position relative to anchor
- Detects viewport overflow and flips to opposite side
- Recalculates on scroll/resize (with passive listeners)
- Pure CSS positioning — no external dependencies

---

## Build Order

1. **Checkbox** — no dependencies, reuses `useControllable`
2. **Skeleton** — no dependencies, simplest component
3. **Figure** — no dependencies, layout-only
4. **Tooltip** — introduces `useAnchorPosition` hook
5. **Breadcrumb** — most complex (overflow logic, dropdown)
