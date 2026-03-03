# Typography

A component for rendering text with consistent typographic styles and semantic colors.

## Usage

```tsx
import Typography from "@natum/natum-ui/Typography";

<Typography variant="h1">Heading</Typography>
<Typography variant="body1" color="secondary">Muted text</Typography>
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `TypographyVariant` | `"body1"` | Typographic preset to apply |
| `color` | `TypographyColor` | `"primary"` | Semantic text color |
| `tag` | `keyof JSX.IntrinsicElements` | Inferred from variant | HTML element to render |

When `tag` is omitted, the component infers the HTML element from the variant (`h1`–`h6` and `code` render as their corresponding elements, everything else renders as `<p>`).

### Available variants

`h1`, `h2`, `h3`, `h4`, `h5`, `h6`, `body1`, `body2`, `body3`, `caption`, `code`

### Available colors

`primary`, `secondary`, `disabled`, `link`, `inverse`, `error`, `info`, `success`, `warning`

---

## Extending Typography

Both variants and colors are extensible. Adding a custom variant (e.g. `h7`) requires two steps: defining the SCSS styles and extending the TypeScript type.

### 1. Define the SCSS preset

Use `$typography-preset-overrides` to add the new preset. This generates the CSS class automatically.

```scss
// app/_design-tokens.scss
@forward "@natum/natum-ui/design-tokens" with (
  $typography-preset-overrides: (
    h7: (
      letter-spacing: 0em,
      font-weight: 500,
      line-height: 1.6,
      font-size: 14px,
      margin-top: 8px,
      margin-bottom: 4px,
    ),
  )
);
```

See the [design tokens README](../design-tokens/README.md#customizing-tokens) for the full override mechanism.

### 2. Extend the TypeScript type

Use module augmentation to re-export `TypographyVariant` with the new value. Import the module first to preserve all other exports:

```typescript
// app/natum-ui.d.ts
import { TypographyVariantBase } from "@natum/natum-ui";

declare module "@natum/natum-ui" {
  export type TypographyVariant = TypographyVariantBase | "h7";
}
```

Now `<Typography variant="h7">` is type-safe and styled:

```tsx
<Typography variant="h7">Small heading</Typography>
<Typography variant="h7" tag="span">As a span</Typography>
```

### Extending colors

The same pattern works for colors. Add the SCSS token and extend `TypographyColor`:

```scss
// app/_design-tokens.scss
@forward "@natum/natum-ui/design-tokens" with (
  $typography-light-scheme-overrides: (
    accent: #6200ea,
  ),
  $typography-dark-scheme-overrides: (
    accent: #bb86fc,
  )
);
```

```typescript
// app/natum-ui.d.ts
import { TypographyColorBase } from "@natum/natum-ui";

declare module "@natum/natum-ui" {
  export type TypographyColor = TypographyColorBase | "accent";
}
```

```tsx
<Typography color="accent">Accent text</Typography>
```

---

## Exported types

| Type | Description |
|---|---|
| `TypographyVariantBase` | Base union of built-in variant strings |
| `TypographyColorBase` | Base union of built-in color strings |
| `TypographyVariant` | Active variant type — re-export via module augmentation to extend |
| `TypographyColor` | Active color type — re-export via module augmentation to extend |
| `TypographyProps<TTag>` | Full component props including `variant`, `color`, `tag`, and native HTML attributes |
