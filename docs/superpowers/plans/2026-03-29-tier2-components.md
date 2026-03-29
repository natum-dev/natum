# Tier 2 Components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the 5 remaining Tier 2 components (Checkbox, Skeleton, Figure, Tooltip, Breadcrumb) and the shared `useAnchorPosition` hook to complete the natum-ui foundation before Phase 2 (Beta).

**Architecture:** Each component follows the established natum-ui pattern: named export with `forwardRef`, SCSS modules consuming design tokens, TDD with vitest + testing-library, Storybook stories with real-world scenarios. Components are stateful where needed (`"use client"` directive). The shared `useAnchorPosition` hook provides CSS-based positioning for Tooltip and future `SelectionPopover`.

**Tech Stack:** React 18, TypeScript, SCSS Modules, Vitest, Testing Library, Storybook, classnames

**Spec:** `docs/superpowers/specs/2026-03-29-tier2-components-design.md`

---

## File Structure

### New Files

```
packages/natum-ui/src/
├── Checkbox/
│   ├── Checkbox.tsx
│   ├── Checkbox.module.scss
│   ├── Checkbox.test.tsx
│   ├── Checkbox.stories.tsx
│   └── index.ts
├── Skeleton/
│   ├── Skeleton.tsx
│   ├── Skeleton.module.scss
│   ├── Skeleton.test.tsx
│   ├── Skeleton.stories.tsx
│   └── index.ts
├── Figure/
│   ├── Figure.tsx
│   ├── Figure.module.scss
│   ├── Figure.test.tsx
│   ├── Figure.stories.tsx
│   └── index.ts
├── Tooltip/
│   ├── Tooltip.tsx
│   ├── Tooltip.module.scss
│   ├── Tooltip.test.tsx
│   ├── Tooltip.stories.tsx
│   └── index.ts
├── Breadcrumb/
│   ├── Breadcrumb.tsx
│   ├── BreadcrumbItem.tsx
│   ├── Breadcrumb.module.scss
│   ├── Breadcrumb.test.tsx
│   ├── Breadcrumb.stories.tsx
│   └── index.ts
├── hooks/
│   └── use-anchor-position.ts    (new)
└── illustrations/
    ├── EmptyState.tsx             (new)
    └── index.ts                   (new)
```

### Modified Files

```
packages/natum-ui/src/index.ts          — add exports for new components
packages/natum-ui/src/hooks/index.ts    — add useAnchorPosition export
```

---

## Task 1: Checkbox — Tests

**Files:**
- Create: `packages/natum-ui/src/Checkbox/Checkbox.test.tsx`

- [ ] **Step 1: Create Checkbox test file**

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { createRef } from "react";
import { Checkbox } from "./Checkbox";

describe("Checkbox", () => {
  // --- Renders without crashing ---
  it("renders without crashing", () => {
    render(<Checkbox aria-label="Test" />);
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
  });

  // --- Default state ---
  it("renders unchecked by default", () => {
    render(<Checkbox aria-label="Test" />);
    expect(screen.getByRole("checkbox")).not.toBeChecked();
  });

  // --- Controlled mode ---
  it("reflects controlled checked state", () => {
    const { rerender } = render(
      <Checkbox checked={false} onChange={() => {}} aria-label="Test" />
    );
    expect(screen.getByRole("checkbox")).not.toBeChecked();

    rerender(
      <Checkbox checked={true} onChange={() => {}} aria-label="Test" />
    );
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("calls onChange when clicked in controlled mode", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <Checkbox checked={false} onChange={handleChange} aria-label="Test" />
    );

    await user.click(screen.getByRole("checkbox"));
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  // --- Uncontrolled mode ---
  it("toggles in uncontrolled mode", async () => {
    const user = userEvent.setup();
    render(<Checkbox defaultChecked={false} aria-label="Test" />);
    const checkbox = screen.getByRole("checkbox");

    expect(checkbox).not.toBeChecked();
    await user.click(checkbox);
    expect(checkbox).toBeChecked();
    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it("starts checked with defaultChecked", () => {
    render(<Checkbox defaultChecked={true} aria-label="Test" />);
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  // --- Indeterminate ---
  it("sets indeterminate visual state on the input", () => {
    render(<Checkbox indeterminate aria-label="Test" />);
    const input = screen.getByRole("checkbox") as HTMLInputElement;
    expect(input.indeterminate).toBe(true);
  });

  it("shows indeterminate icon instead of checkmark when indeterminate", () => {
    const { container } = render(<Checkbox indeterminate aria-label="Test" />);
    expect(container.querySelector("[data-icon='indeterminate']")).toBeInTheDocument();
    expect(container.querySelector("[data-icon='check']")).not.toBeInTheDocument();
  });

  // --- Label ---
  it("renders label text when label prop is provided", () => {
    render(<Checkbox label="Remember me" />);
    expect(screen.getByText("Remember me")).toBeInTheDocument();
  });

  it("associates label with checkbox input", () => {
    render(<Checkbox label="Remember me" />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveAccessibleName("Remember me");
  });

  it("toggles when label is clicked", async () => {
    const user = userEvent.setup();
    render(<Checkbox label="Remember me" />);
    await user.click(screen.getByText("Remember me"));
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("renders ReactNode label", () => {
    render(<Checkbox label={<span data-testid="rich-label">Rich</span>} />);
    expect(screen.getByTestId("rich-label")).toBeInTheDocument();
  });

  // --- Sizes ---
  it.each(["sm", "md", "lg"] as const)(
    "applies %s size class",
    (size) => {
      const { container } = render(
        <Checkbox size={size} aria-label="Test" />
      );
      expect(container.firstChild).toHaveClass(size);
    }
  );

  it("defaults to md size", () => {
    const { container } = render(<Checkbox aria-label="Test" />);
    expect(container.firstChild).toHaveClass("md");
  });

  // --- Color ---
  it("applies primary color class by default", () => {
    const { container } = render(<Checkbox aria-label="Test" />);
    expect(container.firstChild).toHaveClass("primary");
  });

  it("applies custom color class", () => {
    const { container } = render(
      <Checkbox color="error" aria-label="Test" />
    );
    expect(container.firstChild).toHaveClass("error");
  });

  // --- Disabled ---
  it("disables the checkbox input when disabled", () => {
    render(<Checkbox disabled aria-label="Test" />);
    expect(screen.getByRole("checkbox")).toBeDisabled();
  });

  it("applies disabled class to container", () => {
    const { container } = render(
      <Checkbox disabled aria-label="Test" />
    );
    expect(container.firstChild).toHaveClass("disabled");
  });

  it("does not call onChange when disabled", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <Checkbox disabled onChange={handleChange} aria-label="Test" />
    );
    await user.click(screen.getByRole("checkbox"));
    expect(handleChange).not.toHaveBeenCalled();
  });

  // --- Keyboard ---
  it("toggles via Space key", async () => {
    const user = userEvent.setup();
    render(<Checkbox aria-label="Test" />);
    const checkbox = screen.getByRole("checkbox");

    checkbox.focus();
    await user.keyboard(" ");
    expect(checkbox).toBeChecked();
  });

  // --- forwardRef ---
  it("forwards ref to the input element", () => {
    const ref = createRef<HTMLInputElement>();
    render(<Checkbox ref={ref} aria-label="Test" />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current?.type).toBe("checkbox");
  });

  // --- className ---
  it("merges custom className", () => {
    const { container } = render(
      <Checkbox className="custom" aria-label="Test" />
    );
    expect(container.firstChild).toHaveClass("custom");
  });

  // --- HTML attributes ---
  it("spreads additional HTML attributes", () => {
    render(<Checkbox aria-label="Test" data-testid="my-checkbox" />);
    expect(screen.getByTestId("my-checkbox")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/natum-ui && pnpm vitest run src/Checkbox/Checkbox.test.tsx`
Expected: FAIL — module `./Checkbox` not found

- [ ] **Step 3: Commit test skeleton**

```bash
cd /home/jonathan/natum
git add packages/natum-ui/src/Checkbox/Checkbox.test.tsx
git commit -m "test(Checkbox): add test skeleton"
```

---

## Task 2: Checkbox — Implementation

**Files:**
- Create: `packages/natum-ui/src/Checkbox/Checkbox.tsx`
- Create: `packages/natum-ui/src/Checkbox/Checkbox.module.scss`
- Create: `packages/natum-ui/src/Checkbox/index.ts`

- [ ] **Step 1: Create Checkbox component**

```tsx
"use client";

import {
  type ComponentPropsWithoutRef,
  type ReactNode,
  forwardRef,
  useEffect,
  useId,
  useRef,
} from "react";
import { useMergedRefs } from "../hooks/use-merge-refs";
import styles from "./Checkbox.module.scss";
import cx from "classnames";

type SemanticColor =
  | "primary"
  | "secondary"
  | "error"
  | "success"
  | "warning"
  | "info"
  | "neutral";

type CheckboxBaseProps = {
  checked?: boolean;
  defaultChecked?: boolean;
  indeterminate?: boolean;
  label?: ReactNode;
  size?: "sm" | "md" | "lg";
  color?: SemanticColor;
  disabled?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
};

export type CheckboxProps = CheckboxBaseProps &
  Omit<ComponentPropsWithoutRef<"input">, keyof CheckboxBaseProps | "type">;

const CheckIcon = () => (
  <svg
    data-icon="check"
    className={styles.icon}
    viewBox="0 0 14 14"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M3 7l3 3 5-5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IndeterminateIcon = () => (
  <svg
    data-icon="indeterminate"
    className={styles.icon}
    viewBox="0 0 14 14"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M3 7h8"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      checked,
      defaultChecked = false,
      indeterminate = false,
      label,
      size = "md",
      color = "primary",
      disabled = false,
      onChange,
      className,
      id: idProp,
      ...rest
    },
    ref
  ) => {
    const autoId = useId();
    const inputId = idProp ?? autoId;

    const inputRef = useRef<HTMLInputElement>(null);
    const mergedRef = useMergedRefs(ref, inputRef);

    // Sync indeterminate property (not an HTML attribute)
    useEffect(() => {
      if (inputRef.current) {
        inputRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);

    const isControlled = checked !== undefined;
    const inputProps = isControlled
      ? { checked, onChange }
      : { defaultChecked, onChange };

    return (
      <div
        className={cx(
          styles.container,
          styles[size],
          styles[color],
          {
            [styles.disabled]: disabled,
            [styles.checked]: isControlled ? checked : undefined,
            [styles.indeterminate]: indeterminate,
          },
          className
        )}
      >
        <span className={styles.box}>
          <input
            ref={mergedRef}
            type="checkbox"
            id={inputId}
            disabled={disabled}
            className={styles.input}
            {...inputProps}
            {...rest}
          />
          <span className={styles.control} aria-hidden="true">
            {indeterminate ? <IndeterminateIcon /> : <CheckIcon />}
          </span>
        </span>
        {label != null && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
          </label>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export { Checkbox };
```

- [ ] **Step 2: Create SCSS module**

```scss
// Checkbox.module.scss
@use "../design-tokens" as *;

.container {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2, 8px);
  cursor: pointer;
  user-select: none;
}

// --- Box wrapper (enforces 44px hit area) ---
.box {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  min-height: 44px;
  flex-shrink: 0;
}

// --- Hidden native input ---
.input {
  position: absolute;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  opacity: 0;
  cursor: inherit;
  z-index: 1;
}

// --- Visual control ---
.control {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 2px solid get-color(grey, 400);
  border-radius: var(--radius-sm, 4px);
  background-color: transparent;
  color: transparent;
  transition:
    background-color var(--duration-fast) var(--easing-default),
    border-color var(--duration-fast) var(--easing-default),
    color var(--duration-fast) var(--easing-default);
}

// --- Sizes ---
.sm .control {
  width: 16px;
  height: 16px;
}

.md .control {
  width: 20px;
  height: 20px;
}

.lg .control {
  width: 24px;
  height: 24px;
}

// --- Icon ---
.icon {
  width: 70%;
  height: 70%;
}

// --- Hover (unchecked) ---
.container:hover .control {
  border-color: var(--primary-bg);
}

// --- Checked / Indeterminate state ---
.input:checked + .control,
.input:indeterminate + .control {
  background-color: var(--primary-bg);
  border-color: var(--primary-bg);
  color: var(--primary-contrast);
}

// --- Color variants (checked/indeterminate) ---
@each $color in (secondary, error, success, warning, info, neutral) {
  .#{$color} .input:checked + .control,
  .#{$color} .input:indeterminate + .control {
    background-color: var(--#{$color}-bg);
    border-color: var(--#{$color}-bg);
    color: var(--#{$color}-contrast);
  }

  .#{$color}:hover .control {
    border-color: var(--#{$color}-bg);
  }
}

// --- Focus ---
.input:focus-visible + .control {
  outline: var(--focus-ring-width) solid var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
}

// --- Disabled ---
.disabled {
  cursor: not-allowed;
  pointer-events: none;

  .control {
    border-color: var(--disabled-border);
    background-color: var(--disabled-bg);
  }

  .input:checked + .control,
  .input:indeterminate + .control {
    background-color: var(--disabled-bg);
    border-color: var(--disabled-border);
    color: var(--disabled-text);
  }

  .label {
    color: var(--disabled-text);
  }
}

// --- Label ---
.label {
  color: var(--neutral-text);
  font-size: 0.875rem;
  line-height: 1.5;
}

// --- Reduced motion ---
@media (prefers-reduced-motion: reduce) {
  .control {
    transition: none;
  }
}
```

- [ ] **Step 3: Create barrel export**

```ts
// index.ts
export { Checkbox } from "./Checkbox";
export type { CheckboxProps } from "./Checkbox";
```

- [ ] **Step 4: Run tests**

Run: `cd packages/natum-ui && pnpm vitest run src/Checkbox/Checkbox.test.tsx`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
cd /home/jonathan/natum
git add packages/natum-ui/src/Checkbox/
git commit -m "feat(Checkbox): implement component with TDD"
```

---

## Task 3: Checkbox — Stories

**Files:**
- Create: `packages/natum-ui/src/Checkbox/Checkbox.stories.tsx`

- [ ] **Step 1: Create Checkbox stories**

```tsx
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Checkbox } from "./Checkbox";

const meta: Meta<typeof Checkbox> = {
  title: "Components/Checkbox",
  component: Checkbox,
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
    color: {
      control: "select",
      options: [
        "primary",
        "secondary",
        "error",
        "success",
        "warning",
        "info",
        "neutral",
      ],
    },
    disabled: { control: "boolean" },
    indeterminate: { control: "boolean" },
    label: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

// --- 1. Default ---
export const Default: Story = {
  args: {
    label: "Accept terms and conditions",
  },
};

// --- 2. All Sizes ---
export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Checkbox size="sm" label="Small checkbox" />
      <Checkbox size="md" label="Medium checkbox (default)" />
      <Checkbox size="lg" label="Large checkbox" />
    </div>
  ),
};

// --- 3. Colors ---
export const Colors: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {(
        [
          "primary",
          "secondary",
          "error",
          "success",
          "warning",
          "info",
          "neutral",
        ] as const
      ).map((color) => (
        <Checkbox
          key={color}
          color={color}
          defaultChecked
          label={`${color.charAt(0).toUpperCase() + color.slice(1)} color`}
        />
      ))}
    </div>
  ),
};

// --- 4. Indeterminate ---
export const Indeterminate: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Checkbox indeterminate label="Select all files" />
      <Checkbox indeterminate size="sm" label="Small indeterminate" />
      <Checkbox indeterminate size="lg" label="Large indeterminate" />
    </div>
  ),
};

// --- 5. Disabled ---
export const Disabled: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Checkbox disabled label="Disabled unchecked" />
      <Checkbox disabled defaultChecked label="Disabled checked" />
      <Checkbox disabled indeterminate label="Disabled indeterminate" />
    </div>
  ),
};

// --- 6. Without Label (icon-only) ---
export const WithoutLabel: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 16 }}>
      <Checkbox aria-label="Select row 1" />
      <Checkbox aria-label="Select row 2" defaultChecked />
      <Checkbox aria-label="Select all" indeterminate />
    </div>
  ),
};

// --- 7. Rich Label ---
export const RichLabel: Story = {
  render: () => (
    <Checkbox
      label={
        <>
          I agree to the{" "}
          <a
            href="#"
            onClick={(e) => e.stopPropagation()}
            style={{ color: "var(--neutral-text-link)" }}
          >
            terms of service
          </a>
        </>
      }
    />
  ),
};

// --- 8. Controlled ---
export const Controlled: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Checkbox
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          label={`Checked: ${checked}`}
        />
        <button
          onClick={() => setChecked((v) => !v)}
          style={{
            padding: "4px 12px",
            borderRadius: 6,
            border: "1px solid var(--border-color-subtle)",
            background: "var(--neutral-bg-elevated)",
            cursor: "pointer",
            alignSelf: "flex-start",
          }}
        >
          Toggle externally
        </button>
      </div>
    );
  },
};

// --- 9. Real-World: Multi-Select File List ---
export const RealWorldFileList: Story = {
  name: "Real-World: File Selection",
  render: () => {
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const files = ["report.pdf", "photo.jpg", "notes.md", "data.csv"];
    const allSelected = selected.size === files.length;
    const someSelected = selected.size > 0 && !allSelected;

    const toggleAll = () => {
      setSelected(allSelected ? new Set() : new Set(files));
    };

    const toggleFile = (file: string) => {
      setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(file)) next.delete(file);
        else next.add(file);
        return next;
      });
    };

    return (
      <div
        style={{
          border: "1px solid var(--border-color-subtle)",
          borderRadius: 8,
          overflow: "hidden",
          maxWidth: 360,
        }}
      >
        <div
          style={{
            padding: "8px 12px",
            borderBottom: "1px solid var(--border-color-subtle)",
            background: "var(--neutral-bg-inset)",
          }}
        >
          <Checkbox
            checked={allSelected}
            indeterminate={someSelected}
            onChange={toggleAll}
            label={`${selected.size} of ${files.length} selected`}
            size="sm"
          />
        </div>
        {files.map((file) => (
          <div
            key={file}
            style={{
              padding: "8px 12px",
              borderBottom: "1px solid var(--border-color-subtle)",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Checkbox
              checked={selected.has(file)}
              onChange={() => toggleFile(file)}
              label={file}
              size="sm"
            />
          </div>
        ))}
      </div>
    );
  },
};

// --- 10. Dark Mode ---
export const DarkMode: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Checkbox label="Unchecked in dark" />
      <Checkbox defaultChecked label="Checked in dark" />
      <Checkbox indeterminate label="Indeterminate in dark" />
      <Checkbox disabled label="Disabled in dark" />
      <Checkbox disabled defaultChecked label="Disabled checked in dark" />
    </div>
  ),
  globals: { theme: "dark" },
};

// --- 11. RTL ---
export const RTL: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Checkbox label="اختر الكل" defaultChecked />
      <Checkbox label="تذكرني" />
      <Checkbox label="أوافق على الشروط" disabled />
    </div>
  ),
  globals: { direction: "rtl" },
};
```

- [ ] **Step 2: Run Storybook to verify**

Run: `cd packages/natum-ui && pnpm storybook`
Verify: Open http://localhost:6006, navigate to Components/Checkbox, check all stories render correctly.

- [ ] **Step 3: Commit**

```bash
cd /home/jonathan/natum
git add packages/natum-ui/src/Checkbox/Checkbox.stories.tsx
git commit -m "docs(Checkbox): add Storybook stories"
```

---

## Task 4: Skeleton — Tests

**Files:**
- Create: `packages/natum-ui/src/Skeleton/Skeleton.test.tsx`

- [ ] **Step 1: Create Skeleton test file**

```tsx
import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { createRef } from "react";
import { Skeleton } from "./Skeleton";

describe("Skeleton", () => {
  // --- Renders without crashing ---
  it("renders without crashing", () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });

  // --- Default props ---
  it("renders as text variant by default", () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toHaveClass("text");
  });

  it("defaults to 100% width", () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toHaveStyle({ width: "100%" });
  });

  // --- Variants ---
  it.each(["text", "rectangular", "circular"] as const)(
    "applies %s variant class",
    (variant) => {
      const { container } = render(<Skeleton variant={variant} />);
      expect(container.firstChild).toHaveClass(variant);
    }
  );

  it("applies border-radius 50% for circular variant", () => {
    const { container } = render(
      <Skeleton variant="circular" width={40} height={40} />
    );
    expect(container.firstChild).toHaveClass("circular");
  });

  // --- Custom dimensions ---
  it("applies numeric width as px", () => {
    const { container } = render(<Skeleton width={200} />);
    expect(container.firstChild).toHaveStyle({ width: "200px" });
  });

  it("applies string width directly", () => {
    const { container } = render(<Skeleton width="50%" />);
    expect(container.firstChild).toHaveStyle({ width: "50%" });
  });

  it("applies numeric height as px", () => {
    const { container } = render(<Skeleton height={24} />);
    expect(container.firstChild).toHaveStyle({ height: "24px" });
  });

  it("applies string height directly", () => {
    const { container } = render(<Skeleton height="2rem" />);
    expect(container.firstChild).toHaveStyle({ height: "2rem" });
  });

  // --- Custom borderRadius ---
  it("applies custom borderRadius as number", () => {
    const { container } = render(<Skeleton borderRadius={12} />);
    expect(container.firstChild).toHaveStyle({ borderRadius: "12px" });
  });

  it("applies custom borderRadius as string", () => {
    const { container } = render(<Skeleton borderRadius="50%" />);
    expect(container.firstChild).toHaveStyle({ borderRadius: "50%" });
  });

  // --- Accessibility ---
  it("has aria-hidden true", () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
  });

  // --- forwardRef ---
  it("forwards ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Skeleton ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  // --- className ---
  it("merges custom className", () => {
    const { container } = render(<Skeleton className="custom" />);
    expect(container.firstChild).toHaveClass("custom");
    expect(container.firstChild).toHaveClass("skeleton");
  });

  // --- HTML attributes ---
  it("spreads additional HTML attributes", () => {
    const { container } = render(<Skeleton data-testid="my-skeleton" />);
    expect(container.querySelector("[data-testid='my-skeleton']")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/natum-ui && pnpm vitest run src/Skeleton/Skeleton.test.tsx`
Expected: FAIL — module `./Skeleton` not found

- [ ] **Step 3: Commit test skeleton**

```bash
cd /home/jonathan/natum
git add packages/natum-ui/src/Skeleton/Skeleton.test.tsx
git commit -m "test(Skeleton): add test skeleton"
```

---

## Task 5: Skeleton — Implementation

**Files:**
- Create: `packages/natum-ui/src/Skeleton/Skeleton.tsx`
- Create: `packages/natum-ui/src/Skeleton/Skeleton.module.scss`
- Create: `packages/natum-ui/src/Skeleton/index.ts`

- [ ] **Step 1: Create Skeleton component**

```tsx
import { type ComponentPropsWithoutRef, forwardRef } from "react";
import styles from "./Skeleton.module.scss";
import cx from "classnames";

type SkeletonBaseProps = {
  variant?: "text" | "rectangular" | "circular";
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
};

export type SkeletonProps = SkeletonBaseProps &
  Omit<ComponentPropsWithoutRef<"div">, keyof SkeletonBaseProps>;

const toCss = (value: string | number | undefined): string | undefined => {
  if (value === undefined) return undefined;
  return typeof value === "number" ? `${value}px` : value;
};

const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      variant = "text",
      width = "100%",
      height,
      borderRadius,
      className,
      style,
      ...rest
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cx(styles.skeleton, styles[variant], className)}
        aria-hidden="true"
        style={{
          width: toCss(width),
          height: toCss(height),
          borderRadius: toCss(borderRadius),
          ...style,
        }}
        {...rest}
      />
    );
  }
);

Skeleton.displayName = "Skeleton";

export { Skeleton };
```

- [ ] **Step 2: Create SCSS module**

```scss
// Skeleton.module.scss
@use "../design-tokens" as *;

.skeleton {
  display: block;
  background-color: var(--disabled-bg);
  animation: shimmer 1.5s ease-in-out infinite;
}

// --- Variants ---
.text {
  height: 1em;
  border-radius: var(--radius-sm, 4px);
}

.rectangular {
  border-radius: var(--radius-md, 8px);
}

.circular {
  border-radius: 50%;
}

// --- Shimmer animation ---
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.skeleton {
  background-image: linear-gradient(
    90deg,
    var(--disabled-bg) 0%,
    var(--neutral-bg-elevated) 50%,
    var(--disabled-bg) 100%
  );
  background-size: 200% 100%;
}

// --- Reduced motion: pulse instead of shimmer ---
@media (prefers-reduced-motion: reduce) {
  .skeleton {
    background-image: none;
    animation: pulse var(--duration-normal) ease-in-out infinite alternate;
  }

  @keyframes pulse {
    from {
      opacity: 1;
    }
    to {
      opacity: 0.5;
    }
  }
}
```

- [ ] **Step 3: Create barrel export**

```ts
// index.ts
export { Skeleton } from "./Skeleton";
export type { SkeletonProps } from "./Skeleton";
```

- [ ] **Step 4: Run tests**

Run: `cd packages/natum-ui && pnpm vitest run src/Skeleton/Skeleton.test.tsx`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
cd /home/jonathan/natum
git add packages/natum-ui/src/Skeleton/
git commit -m "feat(Skeleton): implement component with TDD"
```

---

## Task 6: Skeleton — Stories

**Files:**
- Create: `packages/natum-ui/src/Skeleton/Skeleton.stories.tsx`

- [ ] **Step 1: Create Skeleton stories**

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Skeleton } from "./Skeleton";

const meta: Meta<typeof Skeleton> = {
  title: "Components/Skeleton",
  component: Skeleton,
  argTypes: {
    variant: { control: "select", options: ["text", "rectangular", "circular"] },
    width: { control: "text" },
    height: { control: "text" },
    borderRadius: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

// --- 1. Default ---
export const Default: Story = {
  args: {},
};

// --- 2. Variants ---
export const Variants: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 400 }}>
      <div>
        <p style={{ marginBottom: 8, color: "var(--neutral-text-secondary)", fontSize: 14 }}>Text</p>
        <Skeleton variant="text" />
        <div style={{ height: 4 }} />
        <Skeleton variant="text" width="75%" />
        <div style={{ height: 4 }} />
        <Skeleton variant="text" width="50%" />
      </div>
      <div>
        <p style={{ marginBottom: 8, color: "var(--neutral-text-secondary)", fontSize: 14 }}>Rectangular</p>
        <Skeleton variant="rectangular" width={200} height={120} />
      </div>
      <div>
        <p style={{ marginBottom: 8, color: "var(--neutral-text-secondary)", fontSize: 14 }}>Circular</p>
        <Skeleton variant="circular" width={48} height={48} />
      </div>
    </div>
  ),
};

// --- 3. Custom Dimensions ---
export const CustomDimensions: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
      <Skeleton width={100} height={100} variant="rectangular" />
      <Skeleton width="200px" height="50px" variant="rectangular" borderRadius={12} />
      <Skeleton width={64} height={64} variant="circular" />
    </div>
  ),
};

// --- 4. Real-World: Card Loading ---
export const RealWorldCardLoading: Story = {
  name: "Real-World: Card Loading",
  render: () => (
    <div
      style={{
        padding: 16,
        border: "1px solid var(--border-color-subtle)",
        borderRadius: 12,
        maxWidth: 320,
      }}
    >
      <Skeleton variant="rectangular" height={180} />
      <div style={{ marginTop: 12 }}>
        <Skeleton variant="text" width="80%" />
        <div style={{ height: 6 }} />
        <Skeleton variant="text" width="60%" />
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <Skeleton variant="circular" width={32} height={32} />
        <div style={{ flex: 1 }}>
          <Skeleton variant="text" width="50%" />
          <div style={{ height: 4 }} />
          <Skeleton variant="text" width="30%" />
        </div>
      </div>
    </div>
  ),
};

// --- 5. Real-World: File List Loading ---
export const RealWorldFileList: Story = {
  name: "Real-World: File List Loading",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 400 }}>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Skeleton variant="rectangular" width={40} height={40} borderRadius={8} />
          <div style={{ flex: 1 }}>
            <Skeleton variant="text" width={`${60 + i * 5}%`} />
            <div style={{ height: 4 }} />
            <Skeleton variant="text" width="40%" />
          </div>
        </div>
      ))}
    </div>
  ),
};

// --- 6. Dark Mode ---
export const DarkMode: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 300 }}>
      <Skeleton variant="text" />
      <Skeleton variant="text" width="70%" />
      <Skeleton variant="rectangular" height={100} />
      <Skeleton variant="circular" width={48} height={48} />
    </div>
  ),
  globals: { theme: "dark" },
};
```

- [ ] **Step 2: Verify in Storybook**

Run: `cd packages/natum-ui && pnpm storybook`
Verify: Open http://localhost:6006, check Components/Skeleton stories.

- [ ] **Step 3: Commit**

```bash
cd /home/jonathan/natum
git add packages/natum-ui/src/Skeleton/Skeleton.stories.tsx
git commit -m "docs(Skeleton): add Storybook stories"
```

---

## Task 7: Figure — Tests

**Files:**
- Create: `packages/natum-ui/src/Figure/Figure.test.tsx`

- [ ] **Step 1: Create Figure test file**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { createRef } from "react";
import { Figure } from "./Figure";

describe("Figure", () => {
  // --- Renders without crashing ---
  it("renders without crashing", () => {
    const { container } = render(<Figure title="Hello" />);
    expect(container.firstChild).toBeInTheDocument();
  });

  // --- Layout modes ---
  it("defaults to vertical layout", () => {
    const { container } = render(<Figure title="Test" />);
    expect(container.firstChild).toHaveClass("vertical");
  });

  it("applies horizontal layout class", () => {
    const { container } = render(<Figure layout="horizontal" title="Test" />);
    expect(container.firstChild).toHaveClass("horizontal");
  });

  // --- Sections render ---
  it("renders illustration when provided", () => {
    render(
      <Figure
        illustration={<svg data-testid="illus" />}
        title="Test"
      />
    );
    expect(screen.getByTestId("illus")).toBeInTheDocument();
  });

  it("renders title as ReactNode", () => {
    render(<Figure title={<span data-testid="title">Hello</span>} />);
    expect(screen.getByTestId("title")).toBeInTheDocument();
  });

  it("renders title as string", () => {
    render(<Figure title="Hello world" />);
    expect(screen.getByText("Hello world")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(<Figure title="T" description="Some description" />);
    expect(screen.getByText("Some description")).toBeInTheDocument();
  });

  it("renders description as ReactNode", () => {
    render(
      <Figure
        title="T"
        description={<span data-testid="desc">Rich desc</span>}
      />
    );
    expect(screen.getByTestId("desc")).toBeInTheDocument();
  });

  it("renders action slot", () => {
    render(
      <Figure
        title="T"
        action={<button data-testid="cta">Click</button>}
      />
    );
    expect(screen.getByTestId("cta")).toBeInTheDocument();
  });

  // --- Data attributes ---
  it("adds data-figure-section to illustration wrapper", () => {
    const { container } = render(
      <Figure illustration={<svg />} title="T" />
    );
    expect(
      container.querySelector('[data-figure-section="illustration"]')
    ).toBeInTheDocument();
  });

  it("adds data-figure-section to body wrapper", () => {
    const { container } = render(<Figure title="T" />);
    expect(
      container.querySelector('[data-figure-section="body"]')
    ).toBeInTheDocument();
  });

  it("adds data-figure-section to action wrapper", () => {
    const { container } = render(
      <Figure title="T" action={<button>Go</button>} />
    );
    expect(
      container.querySelector('[data-figure-section="action"]')
    ).toBeInTheDocument();
  });

  // --- Omitted sections ---
  it("does not render illustration wrapper when not provided", () => {
    const { container } = render(<Figure title="T" />);
    expect(
      container.querySelector('[data-figure-section="illustration"]')
    ).not.toBeInTheDocument();
  });

  it("does not render action wrapper when not provided", () => {
    const { container } = render(<Figure title="T" />);
    expect(
      container.querySelector('[data-figure-section="action"]')
    ).not.toBeInTheDocument();
  });

  // --- forwardRef ---
  it("forwards ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Figure ref={ref} title="T" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  // --- className ---
  it("merges custom className", () => {
    const { container } = render(
      <Figure title="T" className="custom" />
    );
    expect(container.firstChild).toHaveClass("custom");
    expect(container.firstChild).toHaveClass("figure");
  });

  // --- HTML attributes ---
  it("spreads additional HTML attributes", () => {
    const { container } = render(
      <Figure title="T" data-testid="my-figure" />
    );
    expect(
      container.querySelector("[data-testid='my-figure']")
    ).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/natum-ui && pnpm vitest run src/Figure/Figure.test.tsx`
Expected: FAIL — module `./Figure` not found

- [ ] **Step 3: Commit**

```bash
cd /home/jonathan/natum
git add packages/natum-ui/src/Figure/Figure.test.tsx
git commit -m "test(Figure): add test skeleton"
```

---

## Task 8: Figure — Implementation

**Files:**
- Create: `packages/natum-ui/src/Figure/Figure.tsx`
- Create: `packages/natum-ui/src/Figure/Figure.module.scss`
- Create: `packages/natum-ui/src/Figure/index.ts`

- [ ] **Step 1: Create Figure component**

```tsx
import { type ComponentPropsWithoutRef, type ReactNode, forwardRef } from "react";
import styles from "./Figure.module.scss";
import cx from "classnames";

type FigureBaseProps = {
  layout?: "horizontal" | "vertical";
  illustration?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export type FigureProps = FigureBaseProps &
  Omit<ComponentPropsWithoutRef<"div">, keyof FigureBaseProps>;

const Figure = forwardRef<HTMLDivElement, FigureProps>(
  (
    {
      layout = "vertical",
      illustration,
      title,
      description,
      action,
      className,
      ...rest
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cx(styles.figure, styles[layout], className)}
        {...rest}
      >
        {illustration != null && (
          <div data-figure-section="illustration" className={styles.illustration}>
            {illustration}
          </div>
        )}
        <div data-figure-section="body" className={styles.body}>
          {title != null && <div className={styles.title}>{title}</div>}
          {description != null && (
            <div className={styles.description}>{description}</div>
          )}
        </div>
        {action != null && (
          <div data-figure-section="action" className={styles.action}>
            {action}
          </div>
        )}
      </div>
    );
  }
);

Figure.displayName = "Figure";

export { Figure };
```

- [ ] **Step 2: Create SCSS module**

```scss
// Figure.module.scss
@use "../design-tokens" as *;

.figure {
  display: flex;
  gap: var(--space-4, 16px);
}

// --- Vertical layout (centered) ---
.vertical {
  flex-direction: column;
  align-items: center;
  text-align: center;
}

// --- Horizontal layout (left-aligned, RTL-aware) ---
.horizontal {
  flex-direction: row;
  align-items: center;
  text-align: start;
}

// --- Sections ---
.illustration {
  flex-shrink: 0;
}

.body {
  display: flex;
  flex-direction: column;
  gap: var(--space-1, 4px);
  min-width: 0;
}

.horizontal .body {
  flex: 1;
}

.title {
  font-weight: 600;
  font-size: 1.125rem;
  color: var(--neutral-text);
}

.description {
  font-size: 0.875rem;
  color: var(--neutral-text-secondary);
}

.action {
  display: flex;
  gap: var(--space-2, 8px);
  flex-shrink: 0;
}

.vertical .action {
  justify-content: center;
}
```

- [ ] **Step 3: Create barrel export**

```ts
// index.ts
export { Figure } from "./Figure";
export type { FigureProps } from "./Figure";
```

- [ ] **Step 4: Run tests**

Run: `cd packages/natum-ui && pnpm vitest run src/Figure/Figure.test.tsx`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
cd /home/jonathan/natum
git add packages/natum-ui/src/Figure/
git commit -m "feat(Figure): implement component with TDD"
```

---

## Task 9: Figure — Stories & EmptyState Illustration

**Files:**
- Create: `packages/natum-ui/src/illustrations/EmptyState.tsx`
- Create: `packages/natum-ui/src/illustrations/index.ts`
- Create: `packages/natum-ui/src/Figure/Figure.stories.tsx`

- [ ] **Step 1: Create EmptyState illustration**

```tsx
import { type SVGProps, forwardRef } from "react";

type EmptyStateProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

const EmptyState = forwardRef<SVGSVGElement, EmptyStateProps>(
  ({ size = 120, ...rest }, ref) => (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...rest}
    >
      {/* Folder body */}
      <rect
        x="16"
        y="40"
        width="88"
        height="56"
        rx="6"
        fill="var(--neutral-bg-inset)"
        stroke="var(--border-color-subtle)"
        strokeWidth="2"
      />
      {/* Folder tab */}
      <path
        d="M16 40V34a6 6 0 0 1 6-6h20l8 12h54a6 6 0 0 1 6 6v0H16z"
        fill="var(--neutral-bg-inset)"
        stroke="var(--border-color-subtle)"
        strokeWidth="2"
      />
      {/* Dashed empty indicator */}
      <rect
        x="36"
        y="56"
        width="48"
        height="24"
        rx="4"
        stroke="var(--disabled-border)"
        strokeWidth="2"
        strokeDasharray="6 4"
        fill="none"
      />
      {/* Plus icon */}
      <path
        d="M60 62v12M54 68h12"
        stroke="var(--disabled-text)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
);

EmptyState.displayName = "EmptyState";

export { EmptyState };
export type { EmptyStateProps };
```

- [ ] **Step 2: Create illustrations barrel export**

```ts
// illustrations/index.ts
export { EmptyState } from "./EmptyState";
export type { EmptyStateProps } from "./EmptyState";
```

- [ ] **Step 3: Create Figure stories**

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Figure } from "./Figure";
import { Button } from "../Button";
import { EmptyState } from "../illustrations";

const meta: Meta<typeof Figure> = {
  title: "Components/Figure",
  component: Figure,
  argTypes: {
    layout: { control: "select", options: ["vertical", "horizontal"] },
  },
};

export default meta;
type Story = StoryObj<typeof Figure>;

// --- 1. Default (Vertical) ---
export const Default: Story = {
  args: {
    illustration: <EmptyState />,
    title: "No files yet",
    description: "Upload your first file to get started with Vault.",
    action: <Button size="sm">Upload file</Button>,
  },
};

// --- 2. Horizontal Layout ---
export const Horizontal: Story = {
  args: {
    layout: "horizontal",
    illustration: <EmptyState size={80} />,
    title: "No files yet",
    description: "Upload your first file to get started with Vault.",
    action: <Button size="sm">Upload file</Button>,
  },
};

// --- 3. Without Illustration ---
export const WithoutIllustration: Story = {
  args: {
    title: "Search returned no results",
    description: "Try a different search term or check your spelling.",
  },
};

// --- 4. Without Action ---
export const WithoutAction: Story = {
  args: {
    illustration: <EmptyState />,
    title: "Folder is empty",
    description: "Drag files here or use the upload button to add files.",
  },
};

// --- 5. Multiple Actions ---
export const MultipleActions: Story = {
  args: {
    illustration: <EmptyState />,
    title: "No files yet",
    description: "Upload your first file to get started.",
    action: (
      <>
        <Button size="sm">Upload</Button>
        <Button size="sm" variant="text">
          Learn more
        </Button>
      </>
    ),
  },
};

// --- 6. Rich Content ---
export const RichContent: Story = {
  args: {
    illustration: <EmptyState />,
    title: (
      <>
        Welcome to <strong>Vault</strong>
      </>
    ),
    description: (
      <>
        Your private, encrypted file storage.{" "}
        <a href="#" style={{ color: "var(--neutral-text-link)" }}>
          Learn about encryption
        </a>
      </>
    ),
    action: <Button size="sm">Get started</Button>,
  },
};

// --- 7. Minimal (title only) ---
export const Minimal: Story = {
  args: {
    title: "Nothing here",
  },
};

// --- 8. Real-World: Empty Folder ---
export const RealWorldEmptyFolder: Story = {
  name: "Real-World: Empty Folder",
  render: () => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 300,
        border: "1px solid var(--border-color-subtle)",
        borderRadius: 12,
      }}
    >
      <Figure
        illustration={<EmptyState />}
        title="This folder is empty"
        description="Drag and drop files here, or click upload to browse."
        action={<Button size="sm">Upload files</Button>}
      />
    </div>
  ),
};

// --- 9. Real-World: Horizontal Notification ---
export const RealWorldHorizontalNotification: Story = {
  name: "Real-World: Horizontal Banner",
  render: () => (
    <div
      style={{
        padding: 16,
        border: "1px solid var(--border-color-subtle)",
        borderRadius: 12,
        maxWidth: 500,
      }}
    >
      <Figure
        layout="horizontal"
        illustration={<EmptyState size={64} />}
        title="Storage almost full"
        description="You've used 95% of your storage. Upgrade to get more space."
        action={<Button size="sm">Upgrade</Button>}
      />
    </div>
  ),
};

// --- 10. Dark Mode ---
export const DarkMode: Story = {
  args: {
    illustration: <EmptyState />,
    title: "No files yet",
    description: "Upload your first file to get started.",
    action: <Button size="sm">Upload</Button>,
  },
  globals: { theme: "dark" },
};

// --- 11. RTL ---
export const RTL: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <Figure
        illustration={<EmptyState />}
        title="لا توجد ملفات بعد"
        description="ارفع ملفك الأول للبدء."
        action={<Button size="sm">رفع</Button>}
      />
      <Figure
        layout="horizontal"
        illustration={<EmptyState size={80} />}
        title="لا توجد ملفات بعد"
        description="ارفع ملفك الأول للبدء."
        action={<Button size="sm">رفع</Button>}
      />
    </div>
  ),
  globals: { direction: "rtl" },
};
```

- [ ] **Step 2: Verify in Storybook**

Run: `cd packages/natum-ui && pnpm storybook`
Verify: Open http://localhost:6006, check Components/Figure stories and the EmptyState illustration renders in both themes.

- [ ] **Step 3: Commit**

```bash
cd /home/jonathan/natum
git add packages/natum-ui/src/illustrations/ packages/natum-ui/src/Figure/Figure.stories.tsx
git commit -m "feat(Figure): add stories and EmptyState illustration"
```

---

## Task 10: useAnchorPosition Hook — Tests

**Files:**
- Create: `packages/natum-ui/src/hooks/use-anchor-position.test.ts`

- [ ] **Step 1: Create hook test file**

```ts
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useRef } from "react";
import { useAnchorPosition } from "./use-anchor-position";

// Helper to create a mock element with getBoundingClientRect
const mockRect = (rect: Partial<DOMRect>): DOMRect => ({
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  width: 0,
  height: 0,
  x: 0,
  y: 0,
  toJSON: () => {},
  ...rect,
});

describe("useAnchorPosition", () => {
  const originalInnerWidth = window.innerWidth;
  const originalInnerHeight = window.innerHeight;

  beforeEach(() => {
    Object.defineProperty(window, "innerWidth", { value: 1024, writable: true });
    Object.defineProperty(window, "innerHeight", { value: 768, writable: true });
  });

  afterEach(() => {
    Object.defineProperty(window, "innerWidth", { value: originalInnerWidth, writable: true });
    Object.defineProperty(window, "innerHeight", { value: originalInnerHeight, writable: true });
  });

  it("returns initial position with null values when anchor is not available", () => {
    const { result } = renderHook(() =>
      useAnchorPosition({
        anchorRef: { current: null },
        floatingRef: { current: null },
        placement: "top",
        isOpen: false,
      })
    );

    expect(result.current.styles).toEqual({ position: "fixed", top: 0, left: 0 });
    expect(result.current.actualPlacement).toBe("top");
  });

  it("calculates top placement position", () => {
    const anchor = document.createElement("div");
    const floating = document.createElement("div");
    vi.spyOn(anchor, "getBoundingClientRect").mockReturnValue(
      mockRect({ top: 200, left: 100, bottom: 240, right: 200, width: 100, height: 40 })
    );
    vi.spyOn(floating, "getBoundingClientRect").mockReturnValue(
      mockRect({ width: 80, height: 30 })
    );

    const { result } = renderHook(() =>
      useAnchorPosition({
        anchorRef: { current: anchor },
        floatingRef: { current: floating },
        placement: "top",
        isOpen: true,
        offset: 8,
      })
    );

    // Top placement: floating bottom edge = anchor top - offset
    // top = 200 - 30 - 8 = 162
    // left = 100 + (100/2) - (80/2) = 110
    expect(result.current.styles.top).toBe(162);
    expect(result.current.styles.left).toBe(110);
    expect(result.current.actualPlacement).toBe("top");
  });

  it("calculates bottom placement position", () => {
    const anchor = document.createElement("div");
    const floating = document.createElement("div");
    vi.spyOn(anchor, "getBoundingClientRect").mockReturnValue(
      mockRect({ top: 200, left: 100, bottom: 240, right: 200, width: 100, height: 40 })
    );
    vi.spyOn(floating, "getBoundingClientRect").mockReturnValue(
      mockRect({ width: 80, height: 30 })
    );

    const { result } = renderHook(() =>
      useAnchorPosition({
        anchorRef: { current: anchor },
        floatingRef: { current: floating },
        placement: "bottom",
        isOpen: true,
        offset: 8,
      })
    );

    // Bottom: top = anchor bottom + offset = 240 + 8 = 248
    expect(result.current.styles.top).toBe(248);
    expect(result.current.styles.left).toBe(110);
    expect(result.current.actualPlacement).toBe("bottom");
  });

  it("calculates left placement position", () => {
    const anchor = document.createElement("div");
    const floating = document.createElement("div");
    vi.spyOn(anchor, "getBoundingClientRect").mockReturnValue(
      mockRect({ top: 200, left: 300, bottom: 240, right: 400, width: 100, height: 40 })
    );
    vi.spyOn(floating, "getBoundingClientRect").mockReturnValue(
      mockRect({ width: 80, height: 30 })
    );

    const { result } = renderHook(() =>
      useAnchorPosition({
        anchorRef: { current: anchor },
        floatingRef: { current: floating },
        placement: "left",
        isOpen: true,
        offset: 8,
      })
    );

    // Left: left = anchor left - floating width - offset = 300 - 80 - 8 = 212
    // top = 200 + (40/2) - (30/2) = 205
    expect(result.current.styles.left).toBe(212);
    expect(result.current.styles.top).toBe(205);
    expect(result.current.actualPlacement).toBe("left");
  });

  it("calculates right placement position", () => {
    const anchor = document.createElement("div");
    const floating = document.createElement("div");
    vi.spyOn(anchor, "getBoundingClientRect").mockReturnValue(
      mockRect({ top: 200, left: 100, bottom: 240, right: 200, width: 100, height: 40 })
    );
    vi.spyOn(floating, "getBoundingClientRect").mockReturnValue(
      mockRect({ width: 80, height: 30 })
    );

    const { result } = renderHook(() =>
      useAnchorPosition({
        anchorRef: { current: anchor },
        floatingRef: { current: floating },
        placement: "right",
        isOpen: true,
        offset: 8,
      })
    );

    // Right: left = anchor right + offset = 200 + 8 = 208
    expect(result.current.styles.left).toBe(208);
    expect(result.current.styles.top).toBe(205);
    expect(result.current.actualPlacement).toBe("right");
  });

  it("flips from top to bottom when near top edge", () => {
    const anchor = document.createElement("div");
    const floating = document.createElement("div");
    vi.spyOn(anchor, "getBoundingClientRect").mockReturnValue(
      mockRect({ top: 20, left: 100, bottom: 60, right: 200, width: 100, height: 40 })
    );
    vi.spyOn(floating, "getBoundingClientRect").mockReturnValue(
      mockRect({ width: 80, height: 50 })
    );

    const { result } = renderHook(() =>
      useAnchorPosition({
        anchorRef: { current: anchor },
        floatingRef: { current: floating },
        placement: "top",
        isOpen: true,
        offset: 8,
      })
    );

    // Not enough space above (20 < 50 + 8), should flip to bottom
    expect(result.current.actualPlacement).toBe("bottom");
    expect(result.current.styles.top).toBe(68); // 60 + 8
  });

  it("flips from bottom to top when near bottom edge", () => {
    const anchor = document.createElement("div");
    const floating = document.createElement("div");
    vi.spyOn(anchor, "getBoundingClientRect").mockReturnValue(
      mockRect({ top: 700, left: 100, bottom: 740, right: 200, width: 100, height: 40 })
    );
    vi.spyOn(floating, "getBoundingClientRect").mockReturnValue(
      mockRect({ width: 80, height: 50 })
    );

    const { result } = renderHook(() =>
      useAnchorPosition({
        anchorRef: { current: anchor },
        floatingRef: { current: floating },
        placement: "bottom",
        isOpen: true,
        offset: 8,
      })
    );

    // Not enough space below (768 - 740 = 28 < 50 + 8), flip to top
    expect(result.current.actualPlacement).toBe("top");
    expect(result.current.styles.top).toBe(642); // 700 - 50 - 8
  });

  it("accepts DOMRect as anchor (for selection ranges)", () => {
    const floating = document.createElement("div");
    vi.spyOn(floating, "getBoundingClientRect").mockReturnValue(
      mockRect({ width: 80, height: 30 })
    );

    const anchorRect = mockRect({
      top: 200,
      left: 100,
      bottom: 220,
      right: 300,
      width: 200,
      height: 20,
    });

    const { result } = renderHook(() =>
      useAnchorPosition({
        anchorRect,
        floatingRef: { current: floating },
        placement: "top",
        isOpen: true,
        offset: 8,
      })
    );

    // top = 200 - 30 - 8 = 162
    // left = 100 + (200/2) - (80/2) = 160
    expect(result.current.styles.top).toBe(162);
    expect(result.current.styles.left).toBe(160);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/natum-ui && pnpm vitest run src/hooks/use-anchor-position.test.ts`
Expected: FAIL — module `./use-anchor-position` not found

- [ ] **Step 3: Commit**

```bash
cd /home/jonathan/natum
git add packages/natum-ui/src/hooks/use-anchor-position.test.ts
git commit -m "test(useAnchorPosition): add test skeleton"
```

---

## Task 11: useAnchorPosition Hook — Implementation

**Files:**
- Create: `packages/natum-ui/src/hooks/use-anchor-position.ts`
- Modify: `packages/natum-ui/src/hooks/index.ts`

- [ ] **Step 1: Create the hook**

```ts
import { useCallback, useEffect, useState } from "react";

type Placement = "top" | "bottom" | "left" | "right";

type UseAnchorPositionBaseProps = {
  floatingRef: React.RefObject<HTMLElement | null>;
  placement?: Placement;
  offset?: number;
  isOpen: boolean;
};

type WithAnchorRef = UseAnchorPositionBaseProps & {
  anchorRef: React.RefObject<HTMLElement | null>;
  anchorRect?: never;
};

type WithAnchorRect = UseAnchorPositionBaseProps & {
  anchorRef?: never;
  anchorRect: DOMRect;
};

export type UseAnchorPositionProps = WithAnchorRef | WithAnchorRect;

export type UseAnchorPositionReturn = {
  styles: { position: "fixed"; top: number; left: number };
  actualPlacement: Placement;
};

function getAnchorRect(props: UseAnchorPositionProps): DOMRect | null {
  if (props.anchorRect) return props.anchorRect;
  if (props.anchorRef?.current) return props.anchorRef.current.getBoundingClientRect();
  return null;
}

function calculate(
  anchorRect: DOMRect,
  floatingRect: DOMRect,
  placement: Placement,
  offset: number
): { top: number; left: number; actualPlacement: Placement } {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let top = 0;
  let left = 0;
  let actual = placement;

  // Calculate for preferred placement
  const positions = {
    top: {
      top: anchorRect.top - floatingRect.height - offset,
      left: anchorRect.left + anchorRect.width / 2 - floatingRect.width / 2,
    },
    bottom: {
      top: anchorRect.bottom + offset,
      left: anchorRect.left + anchorRect.width / 2 - floatingRect.width / 2,
    },
    left: {
      top: anchorRect.top + anchorRect.height / 2 - floatingRect.height / 2,
      left: anchorRect.left - floatingRect.width - offset,
    },
    right: {
      top: anchorRect.top + anchorRect.height / 2 - floatingRect.height / 2,
      left: anchorRect.right + offset,
    },
  };

  const flipMap: Record<Placement, Placement> = {
    top: "bottom",
    bottom: "top",
    left: "right",
    right: "left",
  };

  const preferred = positions[placement];

  // Check if preferred placement fits
  const fits = {
    top: preferred.top >= 0,
    bottom: preferred.top + floatingRect.height <= vh,
    left: preferred.left >= 0,
    right: preferred.left + floatingRect.width <= vw,
  };

  const placementFits =
    (placement === "top" && fits.top) ||
    (placement === "bottom" && fits.bottom) ||
    (placement === "left" && fits.left) ||
    (placement === "right" && fits.right);

  if (placementFits) {
    top = preferred.top;
    left = preferred.left;
    actual = placement;
  } else {
    // Flip
    const flipped = flipMap[placement];
    const flippedPos = positions[flipped];
    top = flippedPos.top;
    left = flippedPos.left;
    actual = flipped;
  }

  // Clamp horizontal to viewport
  left = Math.max(0, Math.min(left, vw - floatingRect.width));
  // Clamp vertical to viewport
  top = Math.max(0, Math.min(top, vh - floatingRect.height));

  return { top, left, actualPlacement: actual };
}

export function useAnchorPosition(
  props: UseAnchorPositionProps
): UseAnchorPositionReturn {
  const { floatingRef, placement = "top", offset = 8, isOpen } = props;

  const [position, setPosition] = useState<{
    top: number;
    left: number;
    actualPlacement: Placement;
  }>({ top: 0, left: 0, actualPlacement: placement });

  const update = useCallback(() => {
    const anchorRect = getAnchorRect(props);
    const floatingEl = floatingRef.current;
    if (!anchorRect || !floatingEl) return;

    const floatingRect = floatingEl.getBoundingClientRect();
    const result = calculate(anchorRect, floatingRect, placement, offset);
    setPosition(result);
  }, [floatingRef, placement, offset, props.anchorRef?.current, props.anchorRect]);

  useEffect(() => {
    if (!isOpen) return;
    update();

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [isOpen, update]);

  return {
    styles: { position: "fixed" as const, top: position.top, left: position.left },
    actualPlacement: position.actualPlacement,
  };
}
```

- [ ] **Step 2: Add export to hooks/index.ts**

Add to `packages/natum-ui/src/hooks/index.ts`:

```ts
export { useAnchorPosition } from "./use-anchor-position";
```

- [ ] **Step 3: Run tests**

Run: `cd packages/natum-ui && pnpm vitest run src/hooks/use-anchor-position.test.ts`
Expected: All tests PASS

- [ ] **Step 4: Commit**

```bash
cd /home/jonathan/natum
git add packages/natum-ui/src/hooks/use-anchor-position.ts packages/natum-ui/src/hooks/index.ts
git commit -m "feat(useAnchorPosition): implement shared positioning hook"
```

---

## Task 12: Tooltip — Tests

**Files:**
- Create: `packages/natum-ui/src/Tooltip/Tooltip.test.tsx`

- [ ] **Step 1: Create Tooltip test file**

```tsx
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Tooltip } from "./Tooltip";

describe("Tooltip", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // --- Renders trigger ---
  it("renders the trigger element", () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>
    );
    expect(screen.getByText("Hover me")).toBeInTheDocument();
  });

  it("does not show tooltip by default", () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>
    );
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  // --- Hover behavior ---
  it("shows tooltip on mouse enter after delay", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <Tooltip content="Tooltip text" delay={200}>
        <button>Hover me</button>
      </Tooltip>
    );

    await user.hover(screen.getByText("Hover me"));
    act(() => { vi.advanceTimersByTime(200); });

    expect(screen.getByRole("tooltip")).toBeInTheDocument();
    expect(screen.getByRole("tooltip")).toHaveTextContent("Tooltip text");
  });

  it("does not show tooltip before delay completes", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <Tooltip content="Tooltip text" delay={200}>
        <button>Hover me</button>
      </Tooltip>
    );

    await user.hover(screen.getByText("Hover me"));
    act(() => { vi.advanceTimersByTime(100); });

    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("hides tooltip on mouse leave", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <Tooltip content="Tooltip text" delay={0}>
        <button>Hover me</button>
      </Tooltip>
    );

    await user.hover(screen.getByText("Hover me"));
    act(() => { vi.advanceTimersByTime(0); });
    expect(screen.getByRole("tooltip")).toBeInTheDocument();

    await user.unhover(screen.getByText("Hover me"));
    act(() => { vi.advanceTimersByTime(150); }); // allow exit animation

    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  // --- Focus behavior ---
  it("shows tooltip on focus", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <Tooltip content="Tooltip text" delay={0}>
        <button>Focus me</button>
      </Tooltip>
    );

    await user.tab();
    act(() => { vi.advanceTimersByTime(0); });

    expect(screen.getByRole("tooltip")).toBeInTheDocument();
  });

  it("hides tooltip on blur", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <>
        <Tooltip content="Tooltip text" delay={0}>
          <button>Focus me</button>
        </Tooltip>
        <button>Other</button>
      </>
    );

    await user.tab(); // focus trigger
    act(() => { vi.advanceTimersByTime(0); });
    expect(screen.getByRole("tooltip")).toBeInTheDocument();

    await user.tab(); // blur trigger
    act(() => { vi.advanceTimersByTime(150); });

    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  // --- Escape key ---
  it("hides tooltip on Escape", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <Tooltip content="Tooltip text" delay={0}>
        <button>Hover me</button>
      </Tooltip>
    );

    await user.hover(screen.getByText("Hover me"));
    act(() => { vi.advanceTimersByTime(0); });
    expect(screen.getByRole("tooltip")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    act(() => { vi.advanceTimersByTime(150); });

    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  // --- Accessibility ---
  it("has role tooltip on the tooltip element", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <Tooltip content="Tooltip text" delay={0}>
        <button>Hover me</button>
      </Tooltip>
    );

    await user.hover(screen.getByText("Hover me"));
    act(() => { vi.advanceTimersByTime(0); });

    expect(screen.getByRole("tooltip")).toBeInTheDocument();
  });

  it("sets aria-describedby on trigger pointing to tooltip id", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <Tooltip content="Tooltip text" delay={0}>
        <button>Hover me</button>
      </Tooltip>
    );

    await user.hover(screen.getByText("Hover me"));
    act(() => { vi.advanceTimersByTime(0); });

    const trigger = screen.getByText("Hover me");
    const tooltip = screen.getByRole("tooltip");
    expect(trigger).toHaveAttribute("aria-describedby", tooltip.id);
  });

  // --- Placement ---
  it.each(["top", "bottom", "left", "right"] as const)(
    "applies %s placement data attribute",
    async (placement) => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(
        <Tooltip content="Tip" placement={placement} delay={0}>
          <button>Hover</button>
        </Tooltip>
      );

      await user.hover(screen.getByText("Hover"));
      act(() => { vi.advanceTimersByTime(0); });

      expect(screen.getByRole("tooltip")).toHaveAttribute("data-placement");
    }
  );

  // --- Content ---
  it("renders ReactNode content", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <Tooltip content={<strong data-testid="bold">Bold tip</strong>} delay={0}>
        <button>Hover me</button>
      </Tooltip>
    );

    await user.hover(screen.getByText("Hover me"));
    act(() => { vi.advanceTimersByTime(0); });

    expect(screen.getByTestId("bold")).toBeInTheDocument();
  });

  // --- className ---
  it("applies custom className to tooltip container", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <Tooltip content="Tip" className="custom-tooltip" delay={0}>
        <button>Hover me</button>
      </Tooltip>
    );

    await user.hover(screen.getByText("Hover me"));
    act(() => { vi.advanceTimersByTime(0); });

    expect(screen.getByRole("tooltip")).toHaveClass("custom-tooltip");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/natum-ui && pnpm vitest run src/Tooltip/Tooltip.test.tsx`
Expected: FAIL — module `./Tooltip` not found

- [ ] **Step 3: Commit**

```bash
cd /home/jonathan/natum
git add packages/natum-ui/src/Tooltip/Tooltip.test.tsx
git commit -m "test(Tooltip): add test skeleton"
```

---

## Task 13: Tooltip — Implementation

**Files:**
- Create: `packages/natum-ui/src/Tooltip/Tooltip.tsx`
- Create: `packages/natum-ui/src/Tooltip/Tooltip.module.scss`
- Create: `packages/natum-ui/src/Tooltip/index.ts`

- [ ] **Step 1: Create Tooltip component**

```tsx
"use client";

import {
  type ReactElement,
  type ReactNode,
  cloneElement,
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useAnchorPosition } from "../hooks/use-anchor-position";
import { useMergedRefs } from "../hooks/use-merge-refs";
import styles from "./Tooltip.module.scss";
import cx from "classnames";

type Placement = "top" | "bottom" | "left" | "right";

export type TooltipProps = {
  content: ReactNode;
  placement?: Placement;
  delay?: number;
  children: ReactElement;
  className?: string;
};

const EXIT_DURATION = 125;

const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  ({ content, placement = "top", delay = 200, children, className }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isExiting, setIsExiting] = useState(false);
    const [mounted, setMounted] = useState(false);

    const tooltipId = useId();
    const delayTimerRef = useRef<ReturnType<typeof setTimeout>>();
    const exitTimerRef = useRef<ReturnType<typeof setTimeout>>();

    const anchorRef = useRef<HTMLElement>(null);
    const floatingRef = useRef<HTMLDivElement>(null);
    const mergedFloatingRef = useMergedRefs(ref, floatingRef);

    const shouldRender = isOpen || isExiting;

    const { styles: positionStyles, actualPlacement } = useAnchorPosition({
      anchorRef,
      floatingRef,
      placement,
      offset: 8,
      isOpen: shouldRender,
    });

    // SSR safety
    useEffect(() => {
      setMounted(true);
    }, []);

    const show = useCallback(() => {
      clearTimeout(exitTimerRef.current);
      setIsExiting(false);
      delayTimerRef.current = setTimeout(() => {
        setIsOpen(true);
      }, delay);
    }, [delay]);

    const hide = useCallback(() => {
      clearTimeout(delayTimerRef.current);
      if (!isOpen) return;
      setIsExiting(true);
      exitTimerRef.current = setTimeout(() => {
        setIsOpen(false);
        setIsExiting(false);
      }, EXIT_DURATION);
    }, [isOpen]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Escape" && isOpen) {
          hide();
        }
      },
      [isOpen, hide]
    );

    useEffect(() => {
      return () => {
        clearTimeout(delayTimerRef.current);
        clearTimeout(exitTimerRef.current);
      };
    }, []);

    // Clone child to attach event handlers and ref
    const trigger = cloneElement(children, {
      ref: anchorRef,
      onMouseEnter: (e: React.MouseEvent) => {
        children.props.onMouseEnter?.(e);
        show();
      },
      onMouseLeave: (e: React.MouseEvent) => {
        children.props.onMouseLeave?.(e);
        hide();
      },
      onFocus: (e: React.FocusEvent) => {
        children.props.onFocus?.(e);
        show();
      },
      onBlur: (e: React.FocusEvent) => {
        children.props.onBlur?.(e);
        hide();
      },
      onKeyDown: (e: React.KeyboardEvent) => {
        children.props.onKeyDown?.(e);
        handleKeyDown(e);
      },
      "aria-describedby": shouldRender ? tooltipId : undefined,
    });

    const tooltip =
      mounted && shouldRender
        ? createPortal(
            <div
              ref={mergedFloatingRef}
              id={tooltipId}
              role="tooltip"
              data-placement={actualPlacement}
              className={cx(
                styles.tooltip,
                {
                  [styles.entering]: isOpen && !isExiting,
                  [styles.exiting]: isExiting,
                },
                className
              )}
              style={positionStyles}
            >
              {content}
            </div>,
            document.body
          )
        : null;

    return (
      <>
        {trigger}
        {tooltip}
      </>
    );
  }
);

Tooltip.displayName = "Tooltip";

export { Tooltip };
```

- [ ] **Step 2: Create SCSS module**

```scss
// Tooltip.module.scss
@use "../design-tokens" as *;

.tooltip {
  z-index: var(--z-tooltip, 1500);
  max-width: 280px;
  padding: var(--space-2, 8px) var(--space-3, 12px);
  border-radius: var(--radius-md, 8px);
  background-color: var(--neutral-text);
  color: var(--neutral-text-inverse);
  font-size: 0.8125rem;
  line-height: 1.4;
  pointer-events: auto;
  word-wrap: break-word;

  a {
    color: inherit;
    text-decoration: underline;
  }
}

// --- Animation ---
.entering {
  animation: tooltip_fade_in var(--duration-fast) var(--easing-enter) forwards;
}

.exiting {
  animation: tooltip_fade_out var(--duration-fast) var(--easing-exit) forwards;
}

@keyframes tooltip_fade_in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes tooltip_fade_out {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .entering,
  .exiting {
    animation-duration: 100ms;
  }
}
```

- [ ] **Step 3: Create barrel export**

```ts
// index.ts
export { Tooltip } from "./Tooltip";
export type { TooltipProps } from "./Tooltip";
```

- [ ] **Step 4: Run tests**

Run: `cd packages/natum-ui && pnpm vitest run src/Tooltip/Tooltip.test.tsx`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
cd /home/jonathan/natum
git add packages/natum-ui/src/Tooltip/
git commit -m "feat(Tooltip): implement component with TDD"
```

---

## Task 14: Tooltip — Stories

**Files:**
- Create: `packages/natum-ui/src/Tooltip/Tooltip.stories.tsx`

- [ ] **Step 1: Create Tooltip stories**

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Tooltip } from "./Tooltip";
import { Button } from "../Button";
import { IconButton } from "../IconButton";

const meta: Meta<typeof Tooltip> = {
  title: "Components/Tooltip",
  component: Tooltip,
  argTypes: {
    placement: {
      control: "select",
      options: ["top", "bottom", "left", "right"],
    },
    delay: { control: "number" },
  },
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

// --- 1. Default ---
export const Default: Story = {
  args: {
    content: "This is a tooltip",
    children: <Button>Hover me</Button>,
  },
};

// --- 2. Placements ---
export const Placements: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        gap: 24,
        justifyContent: "center",
        padding: "80px 0",
      }}
    >
      <Tooltip content="Top tooltip" placement="top">
        <Button variant="outlined" size="sm">
          Top
        </Button>
      </Tooltip>
      <Tooltip content="Bottom tooltip" placement="bottom">
        <Button variant="outlined" size="sm">
          Bottom
        </Button>
      </Tooltip>
      <Tooltip content="Left tooltip" placement="left">
        <Button variant="outlined" size="sm">
          Left
        </Button>
      </Tooltip>
      <Tooltip content="Right tooltip" placement="right">
        <Button variant="outlined" size="sm">
          Right
        </Button>
      </Tooltip>
    </div>
  ),
};

// --- 3. Rich Content ---
export const RichContent: Story = {
  render: () => (
    <div style={{ padding: "60px 0", display: "flex", justifyContent: "center" }}>
      <Tooltip
        content={
          <span>
            <strong>Pro tip:</strong> You can also press{" "}
            <kbd style={{ padding: "1px 4px", borderRadius: 3, background: "rgba(255,255,255,0.15)" }}>
              Ctrl+U
            </kbd>{" "}
            to upload files.
          </span>
        }
      >
        <Button>Upload</Button>
      </Tooltip>
    </div>
  ),
};

// --- 4. With Link ---
export const WithLink: Story = {
  render: () => (
    <div style={{ padding: "60px 0", display: "flex", justifyContent: "center" }}>
      <Tooltip
        content={
          <span>
            File too large.{" "}
            <a href="#" onClick={(e) => e.preventDefault()}>
              Upgrade plan
            </a>
          </span>
        }
      >
        <Button>Upload</Button>
      </Tooltip>
    </div>
  ),
};

// --- 5. Zero Delay ---
export const ZeroDelay: Story = {
  args: {
    content: "Instant tooltip",
    delay: 0,
    children: <Button variant="outlined">No delay</Button>,
  },
};

// --- 6. Real-World: Icon Button Labels ---
export const RealWorldIconButtons: Story = {
  name: "Real-World: Icon Button Labels",
  render: () => (
    <div style={{ display: "flex", gap: 8, padding: "40px 0" }}>
      <Tooltip content="Download file">
        <IconButton aria-label="Download file" size="sm">
          ↓
        </IconButton>
      </Tooltip>
      <Tooltip content="Delete file">
        <IconButton aria-label="Delete file" size="sm" color="error">
          ✕
        </IconButton>
      </Tooltip>
      <Tooltip content="Share file">
        <IconButton aria-label="Share file" size="sm">
          ⤴
        </IconButton>
      </Tooltip>
    </div>
  ),
};

// --- 7. Dark Mode ---
export const DarkMode: Story = {
  args: {
    content: "Dark mode tooltip",
    children: <Button>Hover me</Button>,
  },
  globals: { theme: "dark" },
};

// --- 8. RTL ---
export const RTL: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 24, justifyContent: "center", padding: "80px 0" }}>
      <Tooltip content="تلميح أعلى" placement="top">
        <Button size="sm">أعلى</Button>
      </Tooltip>
      <Tooltip content="تلميح يسار" placement="left">
        <Button size="sm">يسار</Button>
      </Tooltip>
      <Tooltip content="تلميح يمين" placement="right">
        <Button size="sm">يمين</Button>
      </Tooltip>
    </div>
  ),
  globals: { direction: "rtl" },
};
```

- [ ] **Step 2: Verify in Storybook**

Run: `cd packages/natum-ui && pnpm storybook`
Verify: Open http://localhost:6006, check Components/Tooltip stories.

- [ ] **Step 3: Commit**

```bash
cd /home/jonathan/natum
git add packages/natum-ui/src/Tooltip/Tooltip.stories.tsx
git commit -m "docs(Tooltip): add Storybook stories"
```

---

## Task 15: Breadcrumb — Tests

**Files:**
- Create: `packages/natum-ui/src/Breadcrumb/Breadcrumb.test.tsx`

- [ ] **Step 1: Create Breadcrumb test file**

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { createRef } from "react";
import { Breadcrumb, BreadcrumbItem } from "./Breadcrumb";

describe("Breadcrumb", () => {
  // --- Renders without crashing ---
  it("renders without crashing", () => {
    render(
      <Breadcrumb>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem>Current</BreadcrumbItem>
      </Breadcrumb>
    );
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  // --- Semantic HTML ---
  it("renders nav with aria-label", () => {
    render(
      <Breadcrumb>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
      </Breadcrumb>
    );
    expect(screen.getByRole("navigation")).toHaveAttribute(
      "aria-label",
      "Breadcrumb"
    );
  });

  it("renders an ordered list", () => {
    render(
      <Breadcrumb>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem>Current</BreadcrumbItem>
      </Breadcrumb>
    );
    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  // --- Links ---
  it("renders links for items with href", () => {
    render(
      <Breadcrumb>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/docs">Docs</BreadcrumbItem>
        <BreadcrumbItem>Current</BreadcrumbItem>
      </Breadcrumb>
    );
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute(
      "href",
      "/"
    );
    expect(screen.getByRole("link", { name: "Docs" })).toHaveAttribute(
      "href",
      "/docs"
    );
  });

  it("renders last item as text without link", () => {
    render(
      <Breadcrumb>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem>Current</BreadcrumbItem>
      </Breadcrumb>
    );
    expect(screen.queryByRole("link", { name: "Current" })).not.toBeInTheDocument();
    expect(screen.getByText("Current")).toBeInTheDocument();
  });

  it("sets aria-current on last item", () => {
    render(
      <Breadcrumb>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem>Current</BreadcrumbItem>
      </Breadcrumb>
    );
    expect(screen.getByText("Current")).toHaveAttribute(
      "aria-current",
      "page"
    );
  });

  // --- onClick ---
  it("calls onClick on item click", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <Breadcrumb>
        <BreadcrumbItem href="/" onClick={handleClick}>
          Home
        </BreadcrumbItem>
        <BreadcrumbItem>Current</BreadcrumbItem>
      </Breadcrumb>
    );
    await user.click(screen.getByRole("link", { name: "Home" }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  // --- Separator ---
  it("renders default chevron separator", () => {
    const { container } = render(
      <Breadcrumb>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem>Current</BreadcrumbItem>
      </Breadcrumb>
    );
    const separators = container.querySelectorAll("[aria-hidden='true']");
    expect(separators.length).toBeGreaterThanOrEqual(1);
  });

  it("renders custom separator", () => {
    render(
      <Breadcrumb separator="/">
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem>Current</BreadcrumbItem>
      </Breadcrumb>
    );
    expect(screen.getByText("/")).toBeInTheDocument();
  });

  it("hides separator from screen readers", () => {
    const { container } = render(
      <Breadcrumb separator="/">
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem>Current</BreadcrumbItem>
      </Breadcrumb>
    );
    const separator = container.querySelector("[aria-hidden='true']");
    expect(separator).toBeInTheDocument();
  });

  // --- Overflow / Truncation ---
  it("shows all items when count is within maxVisible", () => {
    render(
      <Breadcrumb maxVisible={4}>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/a">A</BreadcrumbItem>
        <BreadcrumbItem>B</BreadcrumbItem>
      </Breadcrumb>
    );
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
  });

  it("collapses middle items when count exceeds maxVisible", () => {
    render(
      <Breadcrumb maxVisible={4}>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/a">A</BreadcrumbItem>
        <BreadcrumbItem href="/b">B</BreadcrumbItem>
        <BreadcrumbItem href="/c">C</BreadcrumbItem>
        <BreadcrumbItem href="/d">D</BreadcrumbItem>
        <BreadcrumbItem>E</BreadcrumbItem>
      </Breadcrumb>
    );
    // First (Home) + ellipsis + last 2 (D, E) visible
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("D")).toBeInTheDocument();
    expect(screen.getByText("E")).toBeInTheDocument();
    // Middle items hidden
    expect(screen.queryByText("A")).not.toBeInTheDocument();
    expect(screen.queryByText("B")).not.toBeInTheDocument();
    expect(screen.queryByText("C")).not.toBeInTheDocument();
  });

  it("renders ellipsis button with correct aria-label", () => {
    render(
      <Breadcrumb maxVisible={4}>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/a">A</BreadcrumbItem>
        <BreadcrumbItem href="/b">B</BreadcrumbItem>
        <BreadcrumbItem href="/c">C</BreadcrumbItem>
        <BreadcrumbItem>D</BreadcrumbItem>
      </Breadcrumb>
    );
    expect(
      screen.getByLabelText("Show hidden breadcrumbs")
    ).toBeInTheDocument();
  });

  it("opens dropdown with hidden items when ellipsis is clicked", async () => {
    const user = userEvent.setup();
    render(
      <Breadcrumb maxVisible={4}>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/a">A</BreadcrumbItem>
        <BreadcrumbItem href="/b">B</BreadcrumbItem>
        <BreadcrumbItem href="/c">C</BreadcrumbItem>
        <BreadcrumbItem href="/d">D</BreadcrumbItem>
        <BreadcrumbItem>E</BreadcrumbItem>
      </Breadcrumb>
    );

    await user.click(screen.getByLabelText("Show hidden breadcrumbs"));

    // Hidden items (A, B, C) appear in dropdown
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
    expect(screen.getByText("C")).toBeInTheDocument();
  });

  it("closes dropdown on Escape", async () => {
    const user = userEvent.setup();
    render(
      <Breadcrumb maxVisible={4}>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/a">A</BreadcrumbItem>
        <BreadcrumbItem href="/b">B</BreadcrumbItem>
        <BreadcrumbItem href="/c">C</BreadcrumbItem>
        <BreadcrumbItem>D</BreadcrumbItem>
      </Breadcrumb>
    );

    await user.click(screen.getByLabelText("Show hidden breadcrumbs"));
    expect(screen.getByText("A")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByText("A")).not.toBeInTheDocument();
  });

  // --- forwardRef ---
  it("forwards ref to nav element", () => {
    const ref = createRef<HTMLElement>();
    render(
      <Breadcrumb ref={ref}>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
      </Breadcrumb>
    );
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current?.tagName).toBe("NAV");
  });

  // --- className ---
  it("merges custom className", () => {
    const { container } = render(
      <Breadcrumb className="custom">
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
      </Breadcrumb>
    );
    expect(container.firstChild).toHaveClass("custom");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/natum-ui && pnpm vitest run src/Breadcrumb/Breadcrumb.test.tsx`
Expected: FAIL — module `./Breadcrumb` not found

- [ ] **Step 3: Commit**

```bash
cd /home/jonathan/natum
git add packages/natum-ui/src/Breadcrumb/Breadcrumb.test.tsx
git commit -m "test(Breadcrumb): add test skeleton"
```

---

## Task 16: Breadcrumb — Implementation

**Files:**
- Create: `packages/natum-ui/src/Breadcrumb/Breadcrumb.tsx`
- Create: `packages/natum-ui/src/Breadcrumb/BreadcrumbItem.tsx`
- Create: `packages/natum-ui/src/Breadcrumb/Breadcrumb.module.scss`
- Create: `packages/natum-ui/src/Breadcrumb/index.ts`

- [ ] **Step 1: Create BreadcrumbItem component**

```tsx
// BreadcrumbItem.tsx
import { type ComponentPropsWithoutRef, type ReactNode } from "react";

type BreadcrumbItemBaseProps = {
  href?: string;
  children?: ReactNode;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
};

export type BreadcrumbItemProps = BreadcrumbItemBaseProps &
  Omit<ComponentPropsWithoutRef<"li">, keyof BreadcrumbItemBaseProps>;

export function BreadcrumbItem(_props: BreadcrumbItemProps) {
  // Rendering is handled by the parent Breadcrumb component.
  // This component is used only for type-safe children.
  return null;
}

BreadcrumbItem.displayName = "BreadcrumbItem";
```

- [ ] **Step 2: Create Breadcrumb component**

```tsx
// Breadcrumb.tsx
"use client";

import {
  type ComponentPropsWithoutRef,
  type ReactElement,
  type ReactNode,
  Children,
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { BreadcrumbItemProps } from "./BreadcrumbItem";
import styles from "./Breadcrumb.module.scss";
import cx from "classnames";

type BreadcrumbBaseProps = {
  separator?: ReactNode;
  maxVisible?: number;
  children: ReactElement<BreadcrumbItemProps> | ReactElement<BreadcrumbItemProps>[];
  className?: string;
};

export type BreadcrumbProps = BreadcrumbBaseProps &
  Omit<ComponentPropsWithoutRef<"nav">, keyof BreadcrumbBaseProps>;

const DefaultSeparator = () => (
  <span className={styles.separator} aria-hidden="true">
    ›
  </span>
);

const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(
  ({ separator, maxVisible = 4, children, className, ...rest }, ref) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const ellipsisRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLUListElement>(null);

    const items = Children.toArray(children) as ReactElement<BreadcrumbItemProps>[];
    const shouldCollapse = items.length > maxVisible;

    // When collapsed: first + ellipsis + last (maxVisible - 2) items
    const visibleTailCount = Math.max(maxVisible - 2, 1);
    const visibleItems = shouldCollapse
      ? [items[0], ...items.slice(items.length - visibleTailCount)]
      : items;
    const hiddenItems = shouldCollapse
      ? items.slice(1, items.length - visibleTailCount)
      : [];

    const closeDropdown = useCallback(() => {
      setDropdownOpen(false);
      ellipsisRef.current?.focus();
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
      if (!dropdownOpen) return;
      const handleClick = (e: MouseEvent) => {
        if (
          !dropdownRef.current?.contains(e.target as Node) &&
          !ellipsisRef.current?.contains(e.target as Node)
        ) {
          setDropdownOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }, [dropdownOpen]);

    // Keyboard nav in dropdown
    const handleDropdownKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Escape") {
          e.preventDefault();
          closeDropdown();
          return;
        }
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          const items = dropdownRef.current?.querySelectorAll<HTMLElement>("a, button");
          if (!items?.length) return;
          const current = document.activeElement;
          const idx = Array.from(items).indexOf(current as HTMLElement);
          const next =
            e.key === "ArrowDown"
              ? items[(idx + 1) % items.length]
              : items[(idx - 1 + items.length) % items.length];
          next?.focus();
        }
      },
      [closeDropdown]
    );

    const renderSeparator = () =>
      separator ? (
        <span className={styles.separator} aria-hidden="true">
          {separator}
        </span>
      ) : (
        <DefaultSeparator />
      );

    const renderItem = (
      item: ReactElement<BreadcrumbItemProps>,
      isLast: boolean
    ) => {
      const { href, children: label, onClick } = item.props;

      if (isLast) {
        return (
          <li className={styles.item}>
            <span className={styles.current} aria-current="page">
              {label}
            </span>
          </li>
        );
      }

      return (
        <li className={styles.item}>
          <a href={href} className={styles.link} onClick={onClick}>
            {label}
          </a>
          {renderSeparator()}
        </li>
      );
    };

    const renderEllipsis = () => (
      <li className={styles.item}>
        <button
          ref={ellipsisRef}
          type="button"
          className={styles.ellipsis_button}
          aria-label="Show hidden breadcrumbs"
          aria-expanded={dropdownOpen}
          onClick={() => setDropdownOpen((v) => !v)}
        >
          …
        </button>
        {dropdownOpen && (
          <ul
            ref={dropdownRef}
            className={styles.dropdown}
            role="menu"
            onKeyDown={handleDropdownKeyDown}
          >
            {hiddenItems.map((item, i) => (
              <li key={i} role="menuitem">
                <a
                  href={item.props.href}
                  className={styles.dropdown_link}
                  onClick={(e) => {
                    item.props.onClick?.(e);
                    setDropdownOpen(false);
                  }}
                >
                  {item.props.children}
                </a>
              </li>
            ))}
          </ul>
        )}
        {renderSeparator()}
      </li>
    );

    return (
      <nav
        ref={ref}
        aria-label="Breadcrumb"
        className={cx(styles.breadcrumb, className)}
        {...rest}
      >
        <ol className={styles.list}>
          {shouldCollapse ? (
            <>
              {renderItem(visibleItems[0], false)}
              {renderEllipsis()}
              {visibleItems.slice(1).map((item, i) => {
                const isLast = i === visibleItems.length - 2;
                return <li key={i} className={styles.item}>{renderItem(item, isLast).props.children}</li>;
              })}
            </>
          ) : (
            items.map((item, i) => {
              const isLast = i === items.length - 1;
              return (
                <li key={i} className={styles.item}>
                  {renderItem(item, isLast).props.children}
                </li>
              );
            })
          )}
        </ol>
      </nav>
    );
  }
);

Breadcrumb.displayName = "Breadcrumb";

export { Breadcrumb };
export { BreadcrumbItem } from "./BreadcrumbItem";
export type { BreadcrumbProps };
export type { BreadcrumbItemProps } from "./BreadcrumbItem";
```

**Note:** The initial implementation above may need adjustment during TDD to pass all tests. The renderItem helper nesting `<li>` inside `<li>` will need flattening. Below is the corrected structure — use this version:

```tsx
// Breadcrumb.tsx (corrected)
"use client";

import {
  type ComponentPropsWithoutRef,
  type ReactElement,
  type ReactNode,
  Children,
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { BreadcrumbItemProps } from "./BreadcrumbItem";
import styles from "./Breadcrumb.module.scss";
import cx from "classnames";

type BreadcrumbBaseProps = {
  separator?: ReactNode;
  maxVisible?: number;
  children: ReactElement<BreadcrumbItemProps> | ReactElement<BreadcrumbItemProps>[];
  className?: string;
};

export type BreadcrumbProps = BreadcrumbBaseProps &
  Omit<ComponentPropsWithoutRef<"nav">, keyof BreadcrumbBaseProps>;

const DefaultSeparator = () => (
  <span className={styles.separator} aria-hidden="true">
    ›
  </span>
);

const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(
  ({ separator, maxVisible = 4, children, className, ...rest }, ref) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const ellipsisRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLUListElement>(null);

    const items = Children.toArray(children) as ReactElement<BreadcrumbItemProps>[];
    const shouldCollapse = items.length > maxVisible;

    const visibleTailCount = Math.max(maxVisible - 2, 1);
    const visibleItems = shouldCollapse
      ? [items[0], ...items.slice(items.length - visibleTailCount)]
      : items;
    const hiddenItems = shouldCollapse
      ? items.slice(1, items.length - visibleTailCount)
      : [];

    const closeDropdown = useCallback(() => {
      setDropdownOpen(false);
      ellipsisRef.current?.focus();
    }, []);

    useEffect(() => {
      if (!dropdownOpen) return;
      const handleClick = (e: MouseEvent) => {
        if (
          !dropdownRef.current?.contains(e.target as Node) &&
          !ellipsisRef.current?.contains(e.target as Node)
        ) {
          setDropdownOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }, [dropdownOpen]);

    const handleDropdownKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Escape") {
          e.preventDefault();
          closeDropdown();
          return;
        }
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          const focusable = dropdownRef.current?.querySelectorAll<HTMLElement>("a, button");
          if (!focusable?.length) return;
          const current = document.activeElement;
          const idx = Array.from(focusable).indexOf(current as HTMLElement);
          const next =
            e.key === "ArrowDown"
              ? focusable[(idx + 1) % focusable.length]
              : focusable[(idx - 1 + focusable.length) % focusable.length];
          next?.focus();
        }
      },
      [closeDropdown]
    );

    const renderSeparator = (key: string) =>
      separator ? (
        <span key={key} className={styles.separator} aria-hidden="true">
          {separator}
        </span>
      ) : (
        <DefaultSeparator key={key} />
      );

    const renderSegment = (
      item: ReactElement<BreadcrumbItemProps>,
      index: number,
      isLast: boolean
    ) => {
      const { href, children: label, onClick } = item.props;

      return (
        <li key={index} className={styles.item}>
          {isLast ? (
            <span className={styles.current} aria-current="page">
              {label}
            </span>
          ) : (
            <>
              <a href={href} className={styles.link} onClick={onClick}>
                {label}
              </a>
              {renderSeparator(`sep-${index}`)}
            </>
          )}
        </li>
      );
    };

    const allVisibleItems = shouldCollapse ? visibleItems : items;

    return (
      <nav
        ref={ref}
        aria-label="Breadcrumb"
        className={cx(styles.breadcrumb, className)}
        {...rest}
      >
        <ol className={styles.list}>
          {shouldCollapse && (
            <>
              {renderSegment(visibleItems[0], 0, false)}
              <li className={styles.item}>
                <button
                  ref={ellipsisRef}
                  type="button"
                  className={styles.ellipsis_button}
                  aria-label="Show hidden breadcrumbs"
                  aria-expanded={dropdownOpen}
                  onClick={() => setDropdownOpen((v) => !v)}
                >
                  …
                </button>
                {dropdownOpen && (
                  <ul
                    ref={dropdownRef}
                    className={styles.dropdown}
                    role="menu"
                    onKeyDown={handleDropdownKeyDown}
                  >
                    {hiddenItems.map((item, i) => (
                      <li key={i} role="menuitem">
                        <a
                          href={item.props.href}
                          className={styles.dropdown_link}
                          onClick={(e) => {
                            item.props.onClick?.(e);
                            setDropdownOpen(false);
                          }}
                        >
                          {item.props.children}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
                {renderSeparator("sep-ellipsis")}
              </li>
              {visibleItems.slice(1).map((item, i) => {
                const isLast = i === visibleItems.length - 2;
                return renderSegment(item, i + 1000, isLast);
              })}
            </>
          )}
          {!shouldCollapse &&
            allVisibleItems.map((item, i) =>
              renderSegment(item, i, i === allVisibleItems.length - 1)
            )}
        </ol>
      </nav>
    );
  }
);

Breadcrumb.displayName = "Breadcrumb";

export { Breadcrumb };
export { BreadcrumbItem } from "./BreadcrumbItem";
export type { BreadcrumbProps };
export type { BreadcrumbItemProps } from "./BreadcrumbItem";
```

- [ ] **Step 3: Create SCSS module**

```scss
// Breadcrumb.module.scss
@use "../design-tokens" as *;

.breadcrumb {
  font-size: 0.875rem;
}

.list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: var(--space-1, 4px);
}

.item {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1, 4px);
  position: relative;
}

.link {
  color: var(--neutral-text-link);
  text-decoration: none;
  padding: var(--space-1, 4px);
  border-radius: var(--radius-sm, 4px);
  transition: background-color var(--duration-fast) var(--easing-default);

  &:hover {
    background-color: var(--neutral-bg-inset);
  }

  &:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
  }
}

.current {
  color: var(--neutral-text);
  font-weight: 500;
  padding: var(--space-1, 4px);
}

.separator {
  color: var(--neutral-text-secondary);
  user-select: none;
  flex-shrink: 0;
}

// --- Ellipsis button ---
.ellipsis_button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-1, 4px) var(--space-2, 8px);
  border: none;
  border-radius: var(--radius-sm, 4px);
  background: none;
  color: var(--neutral-text-secondary);
  cursor: pointer;
  font-size: inherit;
  line-height: 1;
  letter-spacing: 2px;

  &:hover {
    background-color: var(--neutral-bg-inset);
    color: var(--neutral-text);
  }

  &:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
  }
}

// --- Dropdown ---
.dropdown {
  position: absolute;
  top: 100%;
  inset-inline-start: 0;
  z-index: var(--z-dropdown, 1000);
  min-width: 160px;
  margin-top: var(--space-1, 4px);
  padding: var(--space-1, 4px);
  list-style: none;
  background-color: var(--neutral-bg-elevated);
  border: 1px solid var(--border-color-subtle);
  border-radius: var(--radius-md, 8px);
  box-shadow: var(--shadow-medium);

  animation: dropdown_enter var(--duration-fast) var(--easing-enter);
}

.dropdown_link {
  display: block;
  padding: var(--space-2, 8px) var(--space-3, 12px);
  color: var(--neutral-text);
  text-decoration: none;
  border-radius: var(--radius-sm, 4px);

  &:hover {
    background-color: var(--neutral-bg-inset);
  }

  &:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: -2px;
  }
}

@keyframes dropdown_enter {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .link {
    transition: none;
  }

  .dropdown {
    animation: none;
  }
}
```

- [ ] **Step 4: Create barrel export**

```ts
// index.ts
export { Breadcrumb, BreadcrumbItem } from "./Breadcrumb";
export type { BreadcrumbProps, BreadcrumbItemProps } from "./Breadcrumb";
```

- [ ] **Step 5: Run tests**

Run: `cd packages/natum-ui && pnpm vitest run src/Breadcrumb/Breadcrumb.test.tsx`
Expected: All tests PASS

- [ ] **Step 6: Commit**

```bash
cd /home/jonathan/natum
git add packages/natum-ui/src/Breadcrumb/
git commit -m "feat(Breadcrumb): implement component with TDD"
```

---

## Task 17: Breadcrumb — Stories

**Files:**
- Create: `packages/natum-ui/src/Breadcrumb/Breadcrumb.stories.tsx`

- [ ] **Step 1: Create Breadcrumb stories**

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Breadcrumb, BreadcrumbItem } from "./Breadcrumb";

const meta: Meta<typeof Breadcrumb> = {
  title: "Components/Breadcrumb",
  component: Breadcrumb,
  argTypes: {
    maxVisible: { control: "number" },
  },
};

export default meta;
type Story = StoryObj<typeof Breadcrumb>;

// --- 1. Default ---
export const Default: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem href="/documents">Documents</BreadcrumbItem>
      <BreadcrumbItem>Reports</BreadcrumbItem>
    </Breadcrumb>
  ),
};

// --- 2. Single Item ---
export const SingleItem: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbItem>Home</BreadcrumbItem>
    </Breadcrumb>
  ),
};

// --- 3. Custom Separator ---
export const CustomSeparator: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Breadcrumb separator="/">
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/docs">Documents</BreadcrumbItem>
        <BreadcrumbItem>Reports</BreadcrumbItem>
      </Breadcrumb>
      <Breadcrumb separator="→">
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/docs">Documents</BreadcrumbItem>
        <BreadcrumbItem>Reports</BreadcrumbItem>
      </Breadcrumb>
    </div>
  ),
};

// --- 4. Overflow with Dropdown ---
export const Overflow: Story = {
  render: () => (
    <Breadcrumb maxVisible={4}>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem href="/projects">Projects</BreadcrumbItem>
      <BreadcrumbItem href="/projects/vault">Vault</BreadcrumbItem>
      <BreadcrumbItem href="/projects/vault/docs">Documents</BreadcrumbItem>
      <BreadcrumbItem href="/projects/vault/docs/reports">Reports</BreadcrumbItem>
      <BreadcrumbItem>Q1 Summary</BreadcrumbItem>
    </Breadcrumb>
  ),
};

// --- 5. Deep Nesting ---
export const DeepNesting: Story = {
  render: () => (
    <Breadcrumb maxVisible={4}>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem href="/a">Level 1</BreadcrumbItem>
      <BreadcrumbItem href="/b">Level 2</BreadcrumbItem>
      <BreadcrumbItem href="/c">Level 3</BreadcrumbItem>
      <BreadcrumbItem href="/d">Level 4</BreadcrumbItem>
      <BreadcrumbItem href="/e">Level 5</BreadcrumbItem>
      <BreadcrumbItem href="/f">Level 6</BreadcrumbItem>
      <BreadcrumbItem href="/g">Level 7</BreadcrumbItem>
      <BreadcrumbItem>Current Page</BreadcrumbItem>
    </Breadcrumb>
  ),
};

// --- 6. With onClick (SPA Navigation) ---
export const WithOnClick: Story = {
  name: "SPA Navigation (onClick)",
  render: () => (
    <Breadcrumb>
      <BreadcrumbItem
        href="/"
        onClick={(e) => {
          e.preventDefault();
          alert("Navigate to Home");
        }}
      >
        Home
      </BreadcrumbItem>
      <BreadcrumbItem
        href="/docs"
        onClick={(e) => {
          e.preventDefault();
          alert("Navigate to Documents");
        }}
      >
        Documents
      </BreadcrumbItem>
      <BreadcrumbItem>Current</BreadcrumbItem>
    </Breadcrumb>
  ),
};

// --- 7. Real-World: Vault File Browser ---
export const RealWorldFileBrowser: Story = {
  name: "Real-World: File Browser",
  render: () => (
    <div
      style={{
        padding: 16,
        borderBottom: "1px solid var(--border-color-subtle)",
      }}
    >
      <Breadcrumb>
        <BreadcrumbItem href="/">My Files</BreadcrumbItem>
        <BreadcrumbItem href="/work">Work</BreadcrumbItem>
        <BreadcrumbItem href="/work/projects">Projects</BreadcrumbItem>
        <BreadcrumbItem>Vault Design Spec</BreadcrumbItem>
      </Breadcrumb>
    </div>
  ),
};

// --- 8. Dark Mode ---
export const DarkMode: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem href="/docs">Documents</BreadcrumbItem>
      <BreadcrumbItem>Reports</BreadcrumbItem>
    </Breadcrumb>
  ),
  globals: { theme: "dark" },
};

// --- 9. RTL ---
export const RTL: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbItem href="/">الرئيسية</BreadcrumbItem>
      <BreadcrumbItem href="/docs">المستندات</BreadcrumbItem>
      <BreadcrumbItem>التقارير</BreadcrumbItem>
    </Breadcrumb>
  ),
  globals: { direction: "rtl" },
};
```

- [ ] **Step 2: Verify in Storybook**

Run: `cd packages/natum-ui && pnpm storybook`
Verify: Open http://localhost:6006, check Components/Breadcrumb stories — especially the overflow dropdown.

- [ ] **Step 3: Commit**

```bash
cd /home/jonathan/natum
git add packages/natum-ui/src/Breadcrumb/Breadcrumb.stories.tsx
git commit -m "docs(Breadcrumb): add Storybook stories"
```

---

## Task 18: Register All Components in Barrel Export

**Files:**
- Modify: `packages/natum-ui/src/index.ts`

- [ ] **Step 1: Add new exports to main index**

Add these lines to `packages/natum-ui/src/index.ts`:

```ts
export * from "./Checkbox";
export * from "./Skeleton";
export * from "./Figure";
export * from "./Tooltip";
export * from "./Breadcrumb";
export * from "./illustrations";
```

- [ ] **Step 2: Verify build**

Run: `cd packages/natum-ui && pnpm build`
Expected: Build completes without errors. All new components appear in `dist/`.

- [ ] **Step 3: Run full test suite**

Run: `cd packages/natum-ui && pnpm vitest run`
Expected: All tests PASS across all components.

- [ ] **Step 4: Commit**

```bash
cd /home/jonathan/natum
git add packages/natum-ui/src/index.ts
git commit -m "feat: register Tier 2 components in barrel export"
```
