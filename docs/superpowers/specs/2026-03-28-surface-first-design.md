# Surface-First Design

> Shift natum-ui's visual language toward borderless components, using surfaces (elevation, fill, color) as the primary means of defining boundaries. Borders remain available but are no longer the default.

## Motivation

Modern design systems (Material 3, Apple HIG) have moved away from explicit borders toward surface differentiation — shadows, fills, and color tints communicate structure without the visual weight of lines. natum-ui already leans this way (Button defaults to `filled`, Card to `elevated`), but the philosophy isn't codified, and some components still use borders as their default treatment.

This spec formalizes the surface-first direction and makes concrete changes to align the component library.

## Scope

### In scope
- New "Surface-First Hierarchy" section in DESIGN_PHILOSOPHY.md
- Replace `outlined` variant with `soft` on Button and IconButton
- New `--*-soft` design tokens using `color-mix()`
- Toast: replace left accent border with full semantic background fill
- Migrate all usages of `variant="outlined"` in stories, tests, and natum-web

### Out of scope
- Card (already defaults to `elevated`)
- TextField (keeps `outlined` — input affordance exception)
- Modal (subtle internal borders at 25% opacity are fine)
- Divider (borders are its purpose)
- Surface color layering / elevation tint system for dark mode (future token work)

## Design Decisions

### 1. Philosophy Doc — New Section: "Surface-First Hierarchy"

Added after the "Disabled State Convention" section in DESIGN_PHILOSOPHY.md.

Content:

> **Surface-First Hierarchy**
>
> Prefer surfaces — elevation, fill, and color — over borders to define component boundaries. Borders add visual weight and reduce the feeling of openness. Use them only when surface differentiation alone doesn't provide enough clarity.
>
> **Guiding principle:** If a component can communicate its boundaries through shadow, background color, or spacing alone, it should. Borders are an explicit tool, not a default.
>
> **When to use surfaces (default):**
> - Cards, containers, and content regions — use elevation (box-shadow) or fill (background tint)
> - Buttons — primary uses fill, secondary uses soft tinted background, tertiary uses text-only
> - Toasts and feedback — use background fill with semantic color tinting
> - Dark mode — use surface color layering (higher elevation = lighter surface) since shadows lose effectiveness
>
> **When borders are appropriate:**
> - Form inputs (TextField, Select, etc.) — users need clear input affordance; outlined remains the default
> - Explicit visual separation — Dividers exist specifically for this purpose
> - High-density layouts — when many same-elevation surfaces sit adjacent, a subtle border can prevent visual merging
>
> **Default variant guidance:**
>
> | Component type | Recommended default | Why |
> |---|---|---|
> | Containers (Card) | `elevated` | Shadow provides depth without line weight |
> | Actions (Button, IconButton) | `filled` | Color fill is the strongest action affordance |
> | Form inputs (TextField) | `outlined` | Border signals interactivity and input affordance |
> | Feedback (Toast) | Filled background | Semantic color tint communicates status |

### 2. New `soft` Variant (Button, IconButton)

Replaces `outlined`. A tinted background with no border, derived from the component's semantic color.

**Visual spec:**
- Background: `color-mix(in srgb, var(--*-bg) 12%, var(--neutral-bg))`
- Text/icon color: `var(--*-text)`
- Border: none
- Hover: increase mix ratio from 12% to 20%
- Focus: standard `--focus-ring-color` outline (unchanged)
- Active/pressed: increase mix ratio to ~25%
- Disabled: muted colors per existing disabled convention (explicit muted colors, not opacity)
- Dark mode: same `color-mix()` formula — mixing against dark `--neutral-bg` handles inversion automatically

**Variant set after change:**

| Component | Variants | Default |
|-----------|----------|---------|
| Button | `filled`, `soft`, `text` | `filled` |
| IconButton | `filled`, `soft` | `filled` |

### 3. New Design Tokens

7 new `--*-soft` CSS custom properties. Since they reference other custom properties via `var()`, they only need to be defined once on `:root` — they automatically resolve to the correct values in both light and dark themes:

```scss
// In light-scheme (mix against --neutral-bg which is grey-50):
--primary-soft: color-mix(in srgb, var(--primary-bg) 12%, var(--neutral-bg));
--secondary-soft: color-mix(in srgb, var(--secondary-bg) 12%, var(--neutral-bg));
--error-soft: color-mix(in srgb, var(--error-bg) 12%, var(--neutral-bg));
--success-soft: color-mix(in srgb, var(--success-bg) 12%, var(--neutral-bg));
--warning-soft: color-mix(in srgb, var(--warning-bg) 12%, var(--neutral-bg));
--info-soft: color-mix(in srgb, var(--info-bg) 12%, var(--neutral-bg));
--neutral-soft: color-mix(in srgb, var(--neutral-border) 12%, var(--neutral-bg));

// Dark-scheme uses identical declarations — color-mix() references
// the same custom properties, which resolve to dark values automatically.
// No separate dark-scheme overrides needed for --*-soft tokens.
```

Hover states use a higher mix ratio (20%). Define as separate `--*-soft-hover` tokens alongside the base tokens to keep component SCSS clean:

```scss
--primary-soft-hover: color-mix(in srgb, var(--primary-bg) 20%, var(--neutral-bg));
// ... same pattern for all 7 semantic colors
```

### 4. Toast — Borderless Treatment

Replace the left accent border with a full semantic background fill.

**Current:**
```scss
border-left: 4px solid var(--toast-accent-color);
background: var(--neutral-bg-elevated);
```

**New:**
```scss
border-left: none;
background: var(--*-soft); // uses the new soft tokens based on toast type
```

The toast type (success, error, warning, info) maps to the corresponding `--*-soft` token for the background. Icon and text colors use `--*-text` as before.

### 5. Breaking Changes

`variant="outlined"` is removed from Button and IconButton. This is a breaking change for consumers.

**Migration path:** All instances of `variant="outlined"` become `variant="soft"`.

**Files requiring migration:**
- Button stories, tests
- IconButton stories, tests
- Any usage in natum-web or playground-web
- ThemeProvider stories (if referencing outlined buttons)
- Modal stories (if referencing outlined buttons)

### 6. Component API Update in DESIGN_PHILOSOPHY.md

Update the Component API Conventions table:

| Prop | Type | Purpose |
|------|------|---------|
| `variant` | String union | Visual style (e.g., `filled`, `soft`, `text`) |

The `outlined` example is replaced with `soft`.

## Browser Compatibility

`color-mix()` is supported in all modern browsers (Chrome 111+, Firefox 113+, Safari 16.2+). Given this is a component library targeting modern applications, this is acceptable.

## Dark Mode Behavior

The `color-mix()` approach handles dark mode automatically:
- Light mode: mixes semantic color with white/light background → subtle light tint
- Dark mode: mixes semantic color with dark background → subtle dark tint
- No separate dark mode overrides needed for the soft variant beyond the token definitions

## Testing Requirements

- All existing Button and IconButton tests updated: `outlined` → `soft`
- Verify `soft` variant applies correct CSS class
- Verify `soft` variant respects `color` prop (all 7 semantic colors)
- Verify disabled state on `soft` variant
- Verify dark mode rendering
- Toast tests updated for borderless treatment
- Visual regression via Storybook stories
