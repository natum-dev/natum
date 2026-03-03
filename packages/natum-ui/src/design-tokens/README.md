# Design Tokens

Design tokens for the Natum UI component library. Provides colors, typography, palette, breakpoints, and dark mode support.

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
| `$typography-light-scheme-overrides` | Semantic text colors in light mode |
| `$typography-dark-scheme-overrides` | Semantic text colors in dark mode |
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

## Colors

### `get-color($name, $shade)`

Returns a hex color value at compile time.

**Parameters:**

| Parameter | Type   | Description                                                                |
| --------- | ------ | -------------------------------------------------------------------------- |
| `$name`   | string | Color family: `blue`, `orange`, `red`, `green`, `yellow`, `purple`, `pink`, `teal`, `brown`, `grey` |
| `$shade`  | number | Shade: `50`, `100`, `200`, `300`, `400`, `500`, `600`, `700`, `800`, `900` |

Shade `500` is the main color of each family. Lower shades are lighter, higher shades are darker.

**Usage on regular CSS properties** (no interpolation needed):

```scss
.card {
  background-color: get-color(grey, 800);
  color: get-color(grey, 100);
}
```

**Usage on CSS custom properties** (`#{}` interpolation required — this is a Sass language constraint):

```scss
.card {
  --card-bg: #{get-color(grey, 800)};
}
```

**Usage inside CSS functions:**

```scss
.hero {
  background: linear-gradient(
    45deg,
    get-color(blue, 200),
    get-color(purple, 300)
  );
}
```

---

## Palette

Semantic color tokens registered as CSS custom properties on `:root`. Use these for theme-consistent UI elements.

**Available palettes:** `primary`, `secondary`, `error`, `info`, `success`, `warning`, `neutral`

Each palette has three variants: `main`, `dark`, `light`.

```scss
.alert {
  background-color: var(--palette-error-light);
  border: 1px solid var(--palette-error-main);
}
```

| Variable pattern               | Example                     |
| ------------------------------- | --------------------------- |
| `--palette-{name}-main`        | `var(--palette-primary-main)` |
| `--palette-{name}-dark`        | `var(--palette-primary-dark)` |
| `--palette-{name}-light`       | `var(--palette-primary-light)` |

---

## Typography

### Presets

Typography presets are applied through the `<Typography>` component. See the [Typography README](../Typography/README.md) for component usage and how to extend with custom variants.

**Available presets:** `h1`, `h2`, `h3`, `h4`, `h5`, `h6`, `body1`, `body2`, `body3`, `caption`, `code`

Presets can be customized or extended at compile time via `$typography-preset-overrides` (see [Customizing tokens](#customizing-tokens)).

### Semantic text colors

Automatically switch between light and dark schemes based on user preference or `data-theme`.

**Available colors:** `primary`, `secondary`, `disabled`, `link`, `inverse`, `error`, `info`, `success`, `warning`

```scss
.text {
  color: var(--typography-primary);
}

.muted {
  color: var(--typography-secondary);
}

.link {
  color: var(--typography-link);
}
```

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

Typography semantic colors (`--typography-*`) and `--bg-color` switch automatically. Palette variables (`--palette-*`) remain constant across themes.

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
