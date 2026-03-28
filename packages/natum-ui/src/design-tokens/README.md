# Design Tokens

Design tokens for the Natum UI component library. Provides semantic color tokens, raw color palette, typography presets, breakpoints, and dark mode support.

## Setup

Import the design tokens module in your SCSS file:

```scss
// Inside the natum-ui package
@use "../design-tokens" as *;

// From a consumer app
@use "@natum/natum-ui/design-tokens" as *;
```

### Customizing tokens

All design tokens can be overridden at compile time via `@use ... with()`. Only specify what you want to change — everything else keeps its default via `map.deep-merge`.

**Available override maps:**

| Override variable | What it customizes |
|---|---|
| `$palette-overrides` | Semantic palette (primary, secondary, error, etc.) |
| `$typography-preset-overrides` | Typography scale (h1–h6, body1–3, caption, code) |
| `$breakpoints-overrides` | Responsive breakpoints (xs, sm, md, lg, xl) |

```scss
@use "@natum/natum-ui/design-tokens" as * with (
  $palette-overrides: (
    primary: (main: #6200ea, dark: #3700b3),
  ),
  $typography-preset-overrides: (
    h1: (font-size: 40px),
  ),
  $breakpoints-overrides: (
    md: 768px,
    lg: 1024px,
  ),
);
```

If multiple files need design tokens, configure once in a central forwarding file:

```scss
// app/_design-tokens.scss
@forward "@natum/natum-ui/design-tokens" with (
  $palette-overrides: (
    primary: (main: #6200ea),
  ),
);

// Other files
@use "design-tokens" as *;
```

For global base styles (font, CSS reset, CSS variable registration), import `base.scss` once at the root of your app:

```scss
@import "@natum/natum-ui/design-tokens/base.scss";
```

---

## Semantic Color Tokens

The primary way components consume color. These tokens are theme-aware, switch automatically between light and dark mode, and guarantee WCAG AA contrast when used as intended.

**Always prefer semantic tokens over `get-color()` in component styles.**

### Per-semantic tokens

Available for all 7 semantic colors: `primary`, `secondary`, `error`, `success`, `warning`, `info`, `neutral`.

| Token | Role | Example usage |
|-------|------|---------------|
| `--{semantic}-bg` | Filled backgrounds | Filled buttons, badges, tags |
| `--{semantic}-surface` | Tinted/soft backgrounds | Alert panels, hover states, subtle cards |
| `--{semantic}-text` | Text on page surfaces | Error messages, links, status labels |
| `--{semantic}-contrast` | Text on `--{semantic}-bg` fills | Filled button labels, badge text |
| `--{semantic}-border` | Borders and outlines | Input focus ring, alert borders |

```scss
// Filled button
.filled {
  background-color: var(--primary-bg);
  color: var(--primary-contrast);
}

// Outlined button
.outlined {
  border: 1px solid var(--primary-border);
  color: var(--primary-text);
}

// Error alert
.alert-error {
  background-color: var(--error-surface);
  border: 1px solid var(--error-border);
  color: var(--error-text);
}
```

### Neutral extras

Additional tokens for text hierarchy and surface hierarchy:

| Token | Role |
|-------|------|
| `--neutral-text-secondary` | Muted/helper text, labels |
| `--neutral-text-disabled` | Disabled element text |
| `--neutral-text-link` | Link text color |
| `--neutral-text-inverse` | Text on dark/light inverse surfaces |
| `--neutral-bg-elevated` | Cards, modals, inputs |
| `--neutral-bg-overlay` | Modal/dialog panels |
| `--neutral-bg-inset` | Recessed areas, inset backgrounds |

```scss
.card {
  background-color: var(--neutral-bg-elevated);
  color: var(--neutral-text);
}

.helper-text {
  color: var(--neutral-text-secondary);
}

.disabled {
  color: var(--neutral-text-disabled);
}
```

---

## Raw Color Palette

Low-level access to the full shade range. **Use semantic tokens instead in component styles.** Reserve `get-color()` for token definitions and rare static values only.

### `get-color($name, $shade)`

Returns a hex color value at compile time.

**Parameters:**

| Parameter | Type   | Description                                                                |
| --------- | ------ | -------------------------------------------------------------------------- |
| `$name`   | string | Color family: `blue`, `orange`, `red`, `green`, `yellow`, `purple`, `pink`, `teal`, `grey` |
| `$shade`  | number | Shade: `50`, `100`, `200`, `300`, `400`, `500`, `600`, `700`, `800`, `900` |

Shade `500` is the main color of each family. Lower shades are lighter, higher shades are darker.

**Usage in token definitions** (the intended use case):

```scss
// In base.scss — defining semantic tokens
--primary-bg: #{get-color(blue, 500)};
--primary-text: #{get-color(blue, 700)};
```

**Usage on regular CSS properties** (rare, static values only):

```scss
.card {
  background-color: get-color(grey, 800);
  color: get-color(grey, 100);
}
```

**Usage on CSS custom properties** (`#{}` interpolation required — Sass language constraint):

```scss
.card {
  --card-bg: #{get-color(grey, 800)};
}
```

The raw palette is also available as CSS custom properties (`--palette-{family}-{shade}`) for runtime access, primarily used in Storybook stories.

---

## Typography

### Presets

Typography presets are applied through the `<Typography>` component. See the [Typography README](../Typography/README.md) for component usage and how to extend with custom variants.

**Available presets:** `h1`, `h2`, `h3`, `h4`, `h5`, `h6`, `body1`, `body2`, `body3`, `caption`, `code`

Presets can be customized or extended at compile time via `$typography-preset-overrides` (see [Customizing tokens](#customizing-tokens)).

---

## Breakpoints

Responsive breakpoint mixin using a mobile-first (`min-width`) approach.

### `breakpoint($bp)`

**Available breakpoints:**

| Key  | Min-width |
| ---- | --------- |
| `xs` | 0px       |
| `sm` | 600px     |
| `md` | 960px     |
| `lg` | 1280px    |
| `xl` | 1920px    |

```scss
.grid {
  flex-direction: column;

  @include breakpoint(md) {
    flex-direction: row;
  }

  @include breakpoint(lg) {
    max-width: 1200px;
  }
}
```

---

## Dark Mode

Dark mode is supported through two mechanisms — both are handled automatically by `base.scss`:

1. **System preference** — activates when the OS is set to dark mode via `prefers-color-scheme: dark`
2. **Manual toggle** — activates when `data-theme="dark"` is set on `<body>`

```html
<!-- Manual dark mode -->
<body data-theme="dark">...</body>
```

All semantic color tokens (`--{semantic}-*`, `--neutral-*`) switch automatically between themes. Raw palette variables (`--palette-*`) remain constant across themes.

---

## Utility Mixins

### `register-variable($map, $base-key)`

Registers a Sass map as CSS custom properties on the current selector. Handles nested maps recursively.

```scss
:root {
  @include register-variable($palette, "palette");
  // Generates: --palette-primary-main: #2196f3; --palette-primary-dark: #1976d2; ...
}
```
