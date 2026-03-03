# @natum/natum-ui

React component library built with TypeScript, SCSS Modules, and Vite.

## Components

- **Button** — Configurable button with `variant`, `color`, `size`, `fullWidth`, and `disabled` props.
- **Typography** — Text component supporting heading/body/caption/code variants and semantic color tokens.
- **Container** — Polymorphic layout wrapper with an `as` prop for rendering as any HTML element.

## Hooks

- **useCountdown** — Countdown timer hook.

## Installation

```bash
pnpm add @natum/natum-ui
```

Peer dependencies: `react` and `react-dom` (v17 or v18).

## Usage

Import individual components for optimal tree-shaking:

```tsx
import Button from "@natum/natum-ui/Button";
import Typography from "@natum/natum-ui/Typography";
import Container from "@natum/natum-ui/Container";
import { useCountdown } from "@natum/natum-ui/hooks";
```

Or import from the root entry point:

```tsx
import { Button, Container } from "@natum/natum-ui";
```

### Design tokens

SCSS variables, mixins, breakpoints, and functions are available for use in consuming apps:

```scss
@use "@natum/natum-ui/design-tokens" as tokens;
```

Or import individual token files:

```scss
@use "@natum/natum-ui/design-tokens/base.scss";
```

## Build output

The library outputs separate directories for each module format:

```
dist/
├── esm/       # ES modules (.js)
├── cjs/       # CommonJS (.cjs)
├── types/     # TypeScript declarations (.d.ts)
└── design-tokens/  # SCSS token files
```

CSS is co-located with JS chunks in both `esm/` and `cjs/` and is automatically injected via `vite-plugin-lib-inject-css`.

## Development

```bash
pnpm build    # Type-check with tsc, then bundle with Vite
pnpm dev      # Start Vite dev server
pnpm lint     # Run ESLint
```
