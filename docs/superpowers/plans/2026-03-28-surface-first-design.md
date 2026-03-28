# Surface-First Design Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Shift natum-ui toward borderless components — add `--*-soft` design tokens, replace `outlined` with `soft` on Button/IconButton, make Toast borderless, and update the design philosophy doc.

**Architecture:** SCSS `color.mix()` precomputes tinted background tokens at build time. Button/IconButton get a new `soft` variant (tinted bg, no border). Toast drops its left accent border in favor of full semantic background fill. The design philosophy doc gets a new "Surface-First Hierarchy" section.

**Tech Stack:** SCSS (color.mix), React, Vitest + RTL, Storybook

---

### Task 1: Add `--*-soft` and `--*-soft-hover` design tokens

**Files:**
- Modify: `packages/natum-ui/src/design-tokens/base.scss`

- [ ] **Step 1: Add `@use "sass:color"` import**

At the top of `base.scss`, add the sass:color import after the existing `@use` statement:

```scss
@use "index" as *;
@use "sass:color";
```

- [ ] **Step 2: Add soft tokens to `light-scheme` mixin**

Inside `@mixin light-scheme`, after the `// Shadow` section and before `// Focus`, add:

```scss
  // Soft backgrounds (surface-first design — tinted fills for soft variant)
  --primary-soft: #{color.mix(get-color(blue, 500), get-color(grey, 50), 12%)};
  --secondary-soft: #{color.mix(get-color(purple, 500), get-color(grey, 50), 12%)};
  --error-soft: #{color.mix(get-color(red, 500), get-color(grey, 50), 12%)};
  --success-soft: #{color.mix(get-color(green, 500), get-color(grey, 50), 12%)};
  --warning-soft: #{color.mix(get-color(yellow, 500), get-color(grey, 50), 12%)};
  --info-soft: #{color.mix(get-color(blue, 400), get-color(grey, 50), 12%)};
  --neutral-soft: #{color.mix(get-color(grey, 500), get-color(grey, 50), 12%)};

  --primary-soft-hover: #{color.mix(get-color(blue, 500), get-color(grey, 50), 20%)};
  --secondary-soft-hover: #{color.mix(get-color(purple, 500), get-color(grey, 50), 20%)};
  --error-soft-hover: #{color.mix(get-color(red, 500), get-color(grey, 50), 20%)};
  --success-soft-hover: #{color.mix(get-color(green, 500), get-color(grey, 50), 20%)};
  --warning-soft-hover: #{color.mix(get-color(yellow, 500), get-color(grey, 50), 20%)};
  --info-soft-hover: #{color.mix(get-color(blue, 400), get-color(grey, 50), 20%)};
  --neutral-soft-hover: #{color.mix(get-color(grey, 500), get-color(grey, 50), 20%)};
```

- [ ] **Step 3: Add soft tokens to `dark-scheme` mixin**

Inside `@mixin dark-scheme`, in the same position (after shadows, before focus):

```scss
  // Soft backgrounds (surface-first design — tinted fills for soft variant)
  --primary-soft: #{color.mix(get-color(blue, 400), get-color(grey, 900), 12%)};
  --secondary-soft: #{color.mix(get-color(purple, 400), get-color(grey, 900), 12%)};
  --error-soft: #{color.mix(get-color(red, 400), get-color(grey, 900), 12%)};
  --success-soft: #{color.mix(get-color(green, 400), get-color(grey, 900), 12%)};
  --warning-soft: #{color.mix(get-color(yellow, 300), get-color(grey, 900), 12%)};
  --info-soft: #{color.mix(get-color(blue, 300), get-color(grey, 900), 12%)};
  --neutral-soft: #{color.mix(get-color(grey, 400), get-color(grey, 900), 12%)};

  --primary-soft-hover: #{color.mix(get-color(blue, 400), get-color(grey, 900), 20%)};
  --secondary-soft-hover: #{color.mix(get-color(purple, 400), get-color(grey, 900), 20%)};
  --error-soft-hover: #{color.mix(get-color(red, 400), get-color(grey, 900), 20%)};
  --success-soft-hover: #{color.mix(get-color(green, 400), get-color(grey, 900), 20%)};
  --warning-soft-hover: #{color.mix(get-color(yellow, 300), get-color(grey, 900), 20%)};
  --info-soft-hover: #{color.mix(get-color(blue, 300), get-color(grey, 900), 20%)};
  --neutral-soft-hover: #{color.mix(get-color(grey, 400), get-color(grey, 900), 20%)};
```

- [ ] **Step 4: Verify build compiles**

Run: `cd packages/natum-ui && pnpm build`
Expected: Build succeeds with no errors.

- [ ] **Step 5: Commit**

```bash
git add packages/natum-ui/src/design-tokens/base.scss
git commit -m "feat(design-tokens): add --*-soft and --*-soft-hover semantic tokens

SCSS color.mix() precomputes tinted backgrounds for the soft variant
at 12% (base) and 20% (hover) mix ratios, in both light and dark schemes."
```

---

### Task 2: Replace `outlined` with `soft` on Button

**Files:**
- Modify: `packages/natum-ui/src/Button/Button.tsx`
- Modify: `packages/natum-ui/src/Button/Button.module.scss`
- Modify: `packages/natum-ui/src/Button/Button.test.tsx`

- [ ] **Step 1: Update the test — change `outlined` to `soft`**

In `packages/natum-ui/src/Button/Button.test.tsx`, change the test at line 18-20:

```tsx
  it("applies variant class", () => {
    render(<Button variant="soft">btn</Button>);
    expect(screen.getByRole("button")).toHaveClass("soft");
  });
```

Also add a disabled soft test after the existing disabled test (line 38):

```tsx
  it("applies disabled styling to soft variant", () => {
    render(<Button variant="soft" disabled>btn</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toHaveClass("disabled", "soft");
    expect(btn).toBeDisabled();
  });
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd packages/natum-ui && pnpm vitest run src/Button/Button.test.tsx`
Expected: FAIL — `"soft"` is not a valid variant yet.

- [ ] **Step 3: Update Button type and SCSS**

In `packages/natum-ui/src/Button/Button.tsx`, change the variant type at line 6:

```tsx
  variant?: "filled" | "soft" | "text";
```

In `packages/natum-ui/src/Button/Button.module.scss`, replace the `.outlined` block (lines 43-49) with:

```scss
.soft {
  background-color: var(--primary-soft);
  color: var(--primary-text);

  &:hover {
    background-color: var(--primary-soft-hover);
  }
}
```

Update the disabled `.outlined` rule (lines 71-74) — replace `&.outlined` with:

```scss
  &.soft {
    background-color: var(--neutral-bg-inset);
    color: var(--neutral-text-disabled);
  }
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd packages/natum-ui && pnpm vitest run src/Button/Button.test.tsx`
Expected: All tests PASS.

- [ ] **Step 5: Verify build**

Run: `cd packages/natum-ui && pnpm build`
Expected: Build succeeds.

- [ ] **Step 6: Commit**

```bash
git add packages/natum-ui/src/Button/Button.tsx packages/natum-ui/src/Button/Button.module.scss packages/natum-ui/src/Button/Button.test.tsx
git commit -m "feat(Button): replace outlined variant with soft

Soft variant uses --primary-soft token (tinted background, no border).
This is a breaking change: variant=\"outlined\" is removed."
```

---

### Task 3: Replace `outlined` with `soft` on IconButton

**Files:**
- Modify: `packages/natum-ui/src/IconButton/IconButton.tsx`
- Modify: `packages/natum-ui/src/IconButton/IconButton.module.scss`
- Modify: `packages/natum-ui/src/IconButton/IconButton.test.tsx`

- [ ] **Step 1: Update the test — change `outlined` to `soft`**

In `packages/natum-ui/src/IconButton/IconButton.test.tsx`, change the test at line 26-28:

```tsx
  it("applies variant class", () => {
    render(<IconButton icon={MockIcon} aria-label="Close" variant="soft" />);
    expect(screen.getByRole("button")).toHaveClass("soft");
  });
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd packages/natum-ui && pnpm vitest run src/IconButton/IconButton.test.tsx`
Expected: FAIL — `"soft"` is not a valid variant yet.

- [ ] **Step 3: Update IconButton type and SCSS**

In `packages/natum-ui/src/IconButton/IconButton.tsx`, change the variant type at line 13:

```tsx
  variant?: "filled" | "light" | "soft" | "text";
```

In `packages/natum-ui/src/IconButton/IconButton.module.scss`, replace the `.outlined` block (lines 32-37) with:

```scss
.soft {
  background-color: var(--icon-button-soft-color, var(--primary-soft));
  color: var(--icon-button-main-color);

  &:hover {
    filter: none;
    background-color: var(--icon-button-soft-hover-color, var(--primary-soft-hover));
  }
}
```

Then update each color block to add soft token mappings. For each color (primary, secondary, error, warning, success), add a `&.soft` block after the existing `&.light` block. Example for primary (after the `&.filled` block at line 62-64):

```scss
  &.soft {
    --icon-button-soft-color: var(--primary-soft);
    --icon-button-soft-hover-color: var(--primary-soft-hover);
    --icon-button-main-color: var(--primary-text);
  }
```

For secondary:
```scss
  &.soft {
    --icon-button-soft-color: var(--secondary-soft);
    --icon-button-soft-hover-color: var(--secondary-soft-hover);
    --icon-button-main-color: var(--secondary-text);
  }
```

For error:
```scss
  &.soft {
    --icon-button-soft-color: var(--error-soft);
    --icon-button-soft-hover-color: var(--error-soft-hover);
    --icon-button-main-color: var(--error-text);
  }
```

For warning:
```scss
  &.soft {
    --icon-button-soft-color: var(--warning-soft);
    --icon-button-soft-hover-color: var(--warning-soft-hover);
    --icon-button-main-color: var(--warning-text);
  }
```

For success:
```scss
  &.soft {
    --icon-button-soft-color: var(--success-soft);
    --icon-button-soft-hover-color: var(--success-soft-hover);
    --icon-button-main-color: var(--success-text);
  }
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd packages/natum-ui && pnpm vitest run src/IconButton/IconButton.test.tsx`
Expected: All tests PASS.

- [ ] **Step 5: Verify build**

Run: `cd packages/natum-ui && pnpm build`
Expected: Build succeeds.

- [ ] **Step 6: Commit**

```bash
git add packages/natum-ui/src/IconButton/IconButton.tsx packages/natum-ui/src/IconButton/IconButton.module.scss packages/natum-ui/src/IconButton/IconButton.test.tsx
git commit -m "feat(IconButton): replace outlined variant with soft

Soft variant uses --*-soft tokens per semantic color.
This is a breaking change: variant=\"outlined\" is removed."
```

---

### Task 4: Make Toast borderless

**Files:**
- Modify: `packages/natum-ui/src/Toast/Toast.module.scss`

- [ ] **Step 1: Replace left accent border with semantic background fill**

In `packages/natum-ui/src/Toast/Toast.module.scss`, update the `.toast` block. Replace lines 52-58:

```scss
  background: var(--neutral-bg-overlay);
  box-shadow: var(--shadow-high);
  border-left: 4px solid var(--toast-accent-color);
  min-width: 300px;
  max-width: 420px;

  --toast-accent-color: var(--info-border);
```

With:

```scss
  background: var(--toast-bg, var(--info-soft));
  box-shadow: var(--shadow-high);
  min-width: 300px;
  max-width: 420px;

  --toast-accent-color: var(--info-text);
```

Then update the type color classes (lines 62-65). Replace:

```scss
.success { --toast-accent-color: var(--success-border); }
.error { --toast-accent-color: var(--error-border); }
.warning { --toast-accent-color: var(--warning-border); }
.info { --toast-accent-color: var(--info-border); }
```

With:

```scss
.success { --toast-bg: var(--success-soft); --toast-accent-color: var(--success-text); }
.error { --toast-bg: var(--error-soft); --toast-accent-color: var(--error-text); }
.warning { --toast-bg: var(--warning-soft); --toast-accent-color: var(--warning-text); }
.info { --toast-bg: var(--info-soft); --toast-accent-color: var(--info-text); }
```

- [ ] **Step 2: Verify build**

Run: `cd packages/natum-ui && pnpm build`
Expected: Build succeeds.

- [ ] **Step 3: Run existing Toast tests**

Run: `cd packages/natum-ui && pnpm vitest run src/Toast/`
Expected: All tests PASS (toast tests check behavior, not visual styles).

- [ ] **Step 4: Commit**

```bash
git add packages/natum-ui/src/Toast/Toast.module.scss
git commit -m "feat(Toast): replace left accent border with semantic background fill

Toast now uses --*-soft tokens for full background tinting instead of
a left border. Icon/text colors use --*-text tokens."
```

---

### Task 5: Migrate stories and consumer usages

**Files:**
- Modify: `packages/natum-ui/src/Button/Button.stories.tsx`
- Modify: `packages/natum-ui/src/IconButton/IconButton.stories.tsx`
- Modify: `packages/natum-ui/src/Modal/Modal.stories.tsx:72`

- [ ] **Step 1: Update Button stories**

In `packages/natum-ui/src/Button/Button.stories.tsx`:

Line 10 — update argTypes options:
```tsx
      options: ["filled", "soft", "text"],
```

Line 20 — update variants array:
```tsx
const variants = ["filled", "soft", "text"] as const;
```

Line 75 — update full width outlined to soft:
```tsx
          <Button fullWidth variant="soft">
            Full Width Soft
          </Button>
```

- [ ] **Step 2: Update IconButton stories**

In `packages/natum-ui/src/IconButton/IconButton.stories.tsx`:

Line 15 — update argTypes options:
```tsx
      options: ["filled", "light", "soft", "text"],
```

Lines 55-57 — rename the Outlined story to Soft:
```tsx
export const Soft: Story = {
  args: { variant: "soft", icon: IconHeart, "aria-label": "Favorite" },
};
```

- [ ] **Step 3: Update Modal stories**

In `packages/natum-ui/src/Modal/Modal.stories.tsx`, line 72:
```tsx
            <Button variant="soft" onClick={() => setOpen(size)}>
```

- [ ] **Step 4: Verify Storybook builds**

Run: `cd packages/natum-ui && pnpm build`
Expected: Build succeeds with no type errors.

- [ ] **Step 5: Commit**

```bash
git add packages/natum-ui/src/Button/Button.stories.tsx packages/natum-ui/src/IconButton/IconButton.stories.tsx packages/natum-ui/src/Modal/Modal.stories.tsx
git commit -m "fix(storybook): migrate outlined variant references to soft

Update Button, IconButton, and Modal stories to use variant=\"soft\"
instead of the removed variant=\"outlined\"."
```

---

### Task 6: Update design philosophy doc

**Files:**
- Modify: `packages/natum-ui/DESIGN_PHILOSOPHY.md`

- [ ] **Step 1: Add "Surface-First Hierarchy" section**

In `packages/natum-ui/DESIGN_PHILOSOPHY.md`, after the "Disabled State Convention" section (after line 101, before the "Z-Index Scale" section), add:

```markdown
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
```

- [ ] **Step 2: Update Component API Conventions variant example**

In the same file, in the "Props Interface Pattern" table (line 137), change the variant description:

From:
```
| `variant` | String union | Visual style (e.g., `filled`, `outlined`, `text`) |
```

To:
```
| `variant` | String union | Visual style (e.g., `filled`, `soft`, `text`) |
```

- [ ] **Step 3: Commit**

```bash
git add packages/natum-ui/DESIGN_PHILOSOPHY.md
git commit -m "docs(design-philosophy): add Surface-First Hierarchy section

Codifies the borderless-first direction: prefer surfaces over borders,
with guidance on when borders are appropriate. Updates variant example
from outlined to soft."
```

---

### Task 7: Update design tokens README

**Files:**
- Modify: `packages/natum-ui/src/design-tokens/README.md`

- [ ] **Step 1: Add soft tokens to the per-semantic tokens table**

In `packages/natum-ui/src/design-tokens/README.md`, add two rows to the per-semantic tokens table (after the `--{semantic}-border` row, line 82):

```markdown
| `--{semantic}-soft` | Soft/tinted backgrounds | Soft buttons, toast backgrounds |
| `--{semantic}-soft-hover` | Hover state for soft backgrounds | Soft button hover |
```

- [ ] **Step 2: Replace the outlined button example with soft**

Replace the `// Outlined button` code example (lines 92-95):

```scss
// Soft button (surface-first — tinted fill, no border)
.soft {
  background-color: var(--primary-soft);
  color: var(--primary-text);

  &:hover {
    background-color: var(--primary-soft-hover);
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add packages/natum-ui/src/design-tokens/README.md
git commit -m "docs(design-tokens): document --*-soft and --*-soft-hover tokens

Add soft token rows to the per-semantic table and replace the outlined
button example with a soft variant example."
```

---

### Task 8: Final verification

- [ ] **Step 1: Run full test suite**

Run: `cd packages/natum-ui && pnpm vitest run`
Expected: All tests pass.

- [ ] **Step 2: Run build**

Run: `cd packages/natum-ui && pnpm build`
Expected: Build succeeds.

- [ ] **Step 3: Run lint**

Run: `cd packages/natum-ui && pnpm lint`
Expected: No lint errors.

- [ ] **Step 4: Verify no remaining `outlined` references in Button/IconButton**

Run: `grep -r "outlined" packages/natum-ui/src/Button/ packages/natum-ui/src/IconButton/`
Expected: No matches.

- [ ] **Step 5: Visual check via Storybook**

Run: `cd packages/natum-ui && pnpm storybook`
Manually verify:
- Button: `soft` variant shows tinted background, no border, in both themes
- IconButton: `soft` variant shows tinted background per color, no border
- Toast: all types show full background fill instead of left accent border
