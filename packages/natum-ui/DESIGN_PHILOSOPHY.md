# natum-ui Design Philosophy

> **Identity: Functional Warmth** — A design system that prioritizes clarity and utility while embedding moments of warmth through purposeful motion, proportional softness, and interactive feedback.

---

## Priority Stack

When trade-offs arise, resolve them in this order:

1. **Accessibility** — WCAG AA minimum, keyboard nav, screen readers, touch targets, focus visibility
2. **Developer Experience** — Simple APIs, good defaults, easy to use correctly
3. **Visual Consistency** — Every component looks like it belongs to the same family
4. **Performance** — Small bundle, CSS over JS, no unnecessary re-renders
5. **Information Density** — Show more content with less chrome

---

## Seven Pillars

### 1. Accessibility First

- WCAG AA compliance everywhere, no exceptions
- Keyboard navigable — every interactive component operable via keyboard alone
- Focus visible — `:focus-visible` ring using `--focus-ring-color`, never suppressed
- ARIA compliance — correct roles, labels, states
- Minimum 44×44px tap area on all interactive elements (visual size can be smaller; use padding or `::after` pseudo-element to extend hit area)
- Screen reader tested

### 2. Opinionated Defaults, Flexible Escape Hatches

- Components work out of the box with constrained `variant`, `size`, `color` props
- Slot-based composition (`leftSection`, `rightSection`, `children`) handles edge cases
- 90% of use cases covered by the opinionated API; 10% by composition slots
- `className` always supported as an escape hatch, never required

### 3. Purposeful Motion

- **CSS transitions** for state changes (hover, focus, active)
- **CSS keyframe animations** for entrances/exits (toast slide-in, modal fade-scale, skeleton shimmer)
- No animation library dependencies — pure CSS
- All motion wrapped in `@media (prefers-reduced-motion: no-preference)`
- Duration tokens: `--duration-fast` (100ms), `--duration-normal` (200ms), `--duration-slow` (300ms)
- Easing token: `--easing-default` (cubic-bezier(0.2, 0, 0, 1))

### 4. Progressive Density

- **4px base grid**, components default to **8px-aligned** sizes
- 4px increments reserved for internal component details (icon gaps, border offsets)
- Three core sizes: `sm`, `md`, `lg` — every component supports these
- Opt-in extremes: `xs`, `xl` — only added to a component when justified by a real use case
- Spacing tokens: `--space-1` (4px) through `--space-16` (64px)

### 5. Proportional Shape

- Border radius scales with component size
- Token scale: `--radius-sm` (4px), `--radius-md` (8px), `--radius-lg` (12px), `--radius-xl` (16px), `--radius-full` (pill/circle)
- Small interactive elements stay crisp, large surfaces feel warmer
- Component defaults: buttons/inputs → `radius-md`, cards → `radius-lg`, avatars → `radius-full`

### 6. Universal Rendering

- **Dark mode**: CSS custom properties, never hardcode colors. Dark overrides via `body[data-theme="dark"]`
- **RTL direction**: Use logical CSS properties (`padding-inline`, `margin-inline-start`, `inset-inline-start`) over directional ones (`padding-left`, `margin-left`, `left`)
- **Responsive**: Every component considers all viewports. Special adaptations (e.g., Modal → bottom sheet on mobile) decided per-component during design discussion
- **Breakpoints**: Mobile-first using `breakpoint()` mixin (xs, sm, md, lg, xl)

### 7. Real-World Stories

- Storybook stories reflect actual usage scenarios, not abstract prop tables
- Every story answers "when would I use this?"
- Must include: default usage, all variants, all sizes, dark mode, RTL, disabled states, interactive examples
- Showcase real use case scenarios so developers see how components fit into actual UIs

---

## State Communication

### Minimum Two Signals Rule

Every component state must communicate through **at least two** channels:

| State Category | Required Signals | Example |
|---------------|-----------------|---------|
| **Error / Destructive** | Color + Icon + Text (all three) | Red border + error icon + error message |
| **Feedback** (success, warning, info) | Color + Text minimum, icon recommended | Green text + success message |
| **Interactive** (hover, focus, active, selected) | Color + Visual indicator | Background shift + underline |

This ensures colorblind, low-vision, and screen reader users all receive state information.

---

## Disabled State Convention

- Use explicit muted colors (e.g., `grey-300` text on `grey-100` background in light mode) — **not opacity**
- `cursor: not-allowed`
- `pointer-events: none` on interactive children
- Keep in DOM — screen readers should find it via `aria-disabled="true"`
- Removed from tab order (`tabIndex: -1` for non-native elements), matching native `<button disabled>` behavior. Screen readers discover disabled elements via browse mode regardless of tabIndex.
- Each component defines its disabled color palette using semantic tokens

---

## Surface-First Hierarchy

Prefer surfaces — elevation, fill, and color — over borders to define component boundaries. Borders add visual weight and reduce the feeling of openness. Use them only when surface differentiation alone doesn't provide enough clarity.

**Guiding principle:** If a component can communicate its boundaries through shadow, background color, or spacing alone, it should. Borders are an explicit tool, not a default.

**When to use surfaces (default):**

- Cards, containers, and content regions — use elevation (box-shadow) or fill (background tint)
- Buttons — primary uses fill, secondary uses soft tinted background, tertiary uses text-only
- Toasts and feedback — use background fill with semantic color tinting
- Dark mode — use surface color layering (higher elevation = lighter surface) since shadows lose effectiveness

**When borders are appropriate:**

- Form inputs (TextField, Select, etc.) — users need clear input affordance; outlined remains the default
- Explicit visual separation — Dividers exist specifically for this purpose
- High-density layouts — when many same-elevation surfaces sit adjacent, a subtle border can prevent visual merging

**Default variant guidance:**

| Component type | Recommended default | Why |
|---|---|---|
| Containers (Card) | `elevated` | Shadow provides depth without line weight |
| Actions (Button, IconButton) | `filled` | Color fill is the strongest action affordance |
| Form inputs (TextField) | `outlined` | Border signals interactivity and input affordance |
| Feedback (Toast) | Filled background | Semantic color tint communicates status |

---

## Z-Index Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--z-base` | 0 | Default stacking |
| `--z-dropdown` | 100 | Dropdown menus, selects |
| `--z-sticky` | 200 | Sticky headers, floating actions |
| `--z-modal` | 300 | Modal overlays |
| `--z-toast` | 400 | Toast notifications |
| `--z-tooltip` | 500 | Tooltips |

---

## Focus Management

- **Focus trap** inside Modals — Tab/Shift+Tab cycles within modal content
- **Focus return** — after Modal/Tooltip/Dropdown close, focus returns to the trigger element
- **Roving tabindex** for composite widgets (radio groups, tab bars, menu items)
- **Focus ring**: 2px outline with 2px offset using `--focus-ring-color`

---

## Component API Conventions

### Props Interface Pattern

Every component follows this standard props shape:

| Prop | Type | Purpose |
|------|------|---------|
| `variant` | String union | Visual style (e.g., `filled`, `soft`, `text`) |
| `size` | `"sm" \| "md" \| "lg"` | Dimensions (opt-in `xs`, `xl` per component) |
| `color` | Semantic color union | `primary`, `secondary`, `error`, `success`, `warning`, `info`, `neutral` |
| `disabled` | `boolean` | Disables interaction, applies muted styling |
| `className` | `string` | Escape hatch for custom styling |
| Slot props | `ReactNode` | `leftSection`, `rightSection`, `children` where appropriate |
| `...rest` | HTML attributes | Spread to root element |

### Naming Conventions

- `onX` for event callbacks (`onClick`, `onClose`, `onChange`)
- Native HTML boolean attributes use bare names: `disabled`, `required`, `readOnly`, `checked`
- `isX` for non-native boolean states only (`isOpen`, `isLoading`, `isInteractive`, `isSelected`)
- `xSection` for slot props (`leftSection`, `rightSection`)
- New naming conventions must be proposed and approved before adoption

### Ref Forwarding

All components that render DOM elements must use `React.forwardRef` to allow parent ref access.

---

## File Structure

Every component follows this structure:

```
src/ComponentName/
├── ComponentName.tsx              # Named export, forwardRef, "use client" if stateful
├── ComponentName.module.scss      # SCSS module, imports design-tokens
├── ComponentName.module.scss.d.ts # Auto-generated (gitignored)
├── ComponentName.test.tsx         # Vitest + RTL tests
├── ComponentName.stories.tsx      # Storybook stories with real-world scenarios
└── index.ts                       # Re-exports component + types
```

---

## Minimum Test Coverage

Every `.test.tsx` must cover:

- Renders without crashing
- All variants/sizes apply correct classes
- Disabled state (no click, correct `aria-disabled`)
- Keyboard interaction (Enter/Space for buttons, Escape for dismissals)
- `forwardRef` works correctly
- Custom `className` merges correctly
- RTL rendering (logical properties verified)
- Accessibility: correct roles, labels, ARIA attributes

---

## Engineering Workflow

### Phase 1: Design Discussion

Three roles must align before engineering begins:

- **UX Designer** — Defines component purpose, user flows, interaction states, edge cases, mobile behavior
- **UI Designer** — Defines visual treatment, spacing, color usage, animation specs, dark mode appearance
- **UI Architect** — Validates technical feasibility, API surface, composability, accessibility approach, performance

### Phase 2: Implementation (TDD)

1. Write test skeleton covering all minimum test requirements
2. Implement component to pass tests
3. Write SCSS module using design tokens
4. Export from component `index.ts` and main `index.ts`

### Phase 3: Storybook

- Stories reflect real-world use cases
- Include: default, all variants, all sizes, dark mode, RTL, disabled, interactive examples, responsive behavior

### Phase 4: UI/UX Audit

- **UI Designer audit** — Visual correctness, spacing, color, animation, dark mode, responsive behavior, visual consistency
- **UX Designer audit** — Interaction quality, keyboard flow, screen reader experience, RTL behavior, edge cases, mobile UX
- Both must approve before the component is considered done

### Phase 5: Commit

- Small, focused commits per logical change
- If implementation reveals issues, raise back to the design team before proceeding

### Escalation Rule

When a technical constraint prevents the intended design, the engineer raises it to the 3-agent team. The team reconvenes to find an alternative that satisfies the priority stack.
