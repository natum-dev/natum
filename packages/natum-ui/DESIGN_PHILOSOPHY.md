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
