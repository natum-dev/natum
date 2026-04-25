import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  it("renders children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  it("applies default classes", () => {
    render(<Button>btn</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toHaveClass("button", "filled", "md", "primary");
  });

  it("applies variant class", () => {
    render(<Button variant="soft">btn</Button>);
    expect(screen.getByRole("button")).toHaveClass("soft");
  });

  it("applies text variant class", () => {
    render(<Button variant="text">btn</Button>);
    expect(screen.getByRole("button")).toHaveClass("text");
  });

  it("applies fullWidth class", () => {
    render(<Button fullWidth>btn</Button>);
    expect(screen.getByRole("button")).toHaveClass("full_width");
  });

  it("is disabled when disabled prop is set", () => {
    render(<Button disabled>btn</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    expect(btn).toHaveClass("disabled");
  });

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>btn</Button>);
    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("does not call onClick when disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button disabled onClick={onClick}>btn</Button>);
    await user.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("applies custom className", () => {
    render(<Button className="custom">btn</Button>);
    expect(screen.getByRole("button")).toHaveClass("custom");
  });

  it("forwards native button props", () => {
    render(<Button type="submit" aria-label="Submit form">btn</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("type", "submit");
    expect(btn).toHaveAttribute("aria-label", "Submit form");
  });

  it("applies disabled styling to soft variant", () => {
    render(<Button variant="soft" disabled>btn</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toHaveClass("disabled", "soft");
    expect(btn).toBeDisabled();
  });

  it("renders correctly with dir='rtl'", () => {
    const { container } = render(
      <div dir="rtl">
        <Button>Click</Button>
      </div>
    );
    expect(container.firstChild).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Click" })).toBeInTheDocument();
  });

  // --- forwardRef ----------------------------------------------------------
  it("forwards ref to the underlying button element", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Button ref={ref}>btn</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  // --- Sizes ---------------------------------------------------------------
  describe("size", () => {
    it.each(["sm", "md", "lg"] as const)("applies %s size class", (size) => {
      render(<Button size={size}>btn</Button>);
      const btn = screen.getByRole("button");
      expect(btn).toHaveClass(size);
      expect(btn).toHaveAttribute("data-size", size);
    });
  });

  // --- Colors --------------------------------------------------------------
  describe("color", () => {
    it.each([
      "primary",
      "secondary",
      "error",
      "success",
      "warning",
      "info",
      "neutral",
    ] as const)("applies %s color class", (color) => {
      render(<Button color={color}>btn</Button>);
      const btn = screen.getByRole("button");
      expect(btn).toHaveClass(color);
      expect(btn).toHaveAttribute("data-color", color);
    });

    it("does not apply color class when disabled", () => {
      render(
        <Button color="error" disabled>
          btn
        </Button>
      );
      const btn = screen.getByRole("button");
      expect(btn).not.toHaveClass("error");
      expect(btn).toHaveClass("disabled");
    });
  });

  // --- Variant x color smoke test -----------------------------------------
  describe("variant x color combinations", () => {
    const variants = ["filled", "soft", "text"] as const;
    const colors = [
      "primary",
      "secondary",
      "error",
      "success",
      "warning",
      "info",
      "neutral",
    ] as const;

    for (const variant of variants) {
      for (const color of colors) {
        it(`renders ${variant} ${color}`, () => {
          render(
            <Button variant={variant} color={color}>
              btn
            </Button>
          );
          const btn = screen.getByRole("button");
          expect(btn).toHaveClass(variant, color);
        });
      }
    }
  });

  // --- Loading -------------------------------------------------------------
  describe("loading", () => {
    it("sets aria-busy when loading", () => {
      render(<Button loading>Save</Button>);
      const btn = screen.getByRole("button");
      expect(btn).toHaveAttribute("aria-busy", "true");
    });

    it("does NOT set the native `disabled` attribute when loading", () => {
      // Per the contract: stay focusable so screen readers announce a busy
      // interactive element, not a disabled one.
      render(<Button loading>Save</Button>);
      const btn = screen.getByRole("button");
      expect(btn).not.toBeDisabled();
    });

    it("renders the spinner when loading", () => {
      const { container } = render(<Button loading>Save</Button>);
      // Spinner renders an svg from @natum/icons; assert its presence.
      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });

    it("suppresses onClick while loading", async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(
        <Button loading onClick={onClick}>
          Save
        </Button>
      );
      await user.click(screen.getByRole("button"));
      expect(onClick).not.toHaveBeenCalled();
    });

    it("loading visually overrides leftSection", () => {
      const { container } = render(
        <Button
          loading
          leftSection={<span data-testid="left">L</span>}
        >
          Save
        </Button>
      );
      expect(screen.queryByTestId("left")).not.toBeInTheDocument();
      // Spinner svg still rendered.
      expect(container.querySelector("svg")).toBeInTheDocument();
    });

    it("applies loading class and data attribute", () => {
      render(<Button loading>Save</Button>);
      const btn = screen.getByRole("button");
      expect(btn).toHaveClass("loading");
      expect(btn).toHaveAttribute("data-loading", "true");
    });
  });

  // --- Slots ---------------------------------------------------------------
  describe("leftSection / rightSection", () => {
    it("renders leftSection before children", () => {
      render(
        <Button leftSection={<span data-testid="left">L</span>}>label</Button>
      );
      const btn = screen.getByRole("button");
      const left = screen.getByTestId("left");
      const label = btn.textContent;
      expect(left).toBeInTheDocument();
      // textContent is "Llabel" — left appears first.
      expect(label?.indexOf("L")).toBeLessThan(label?.indexOf("label") ?? 0);
    });

    it("renders rightSection after children", () => {
      render(
        <Button rightSection={<span data-testid="right">R</span>}>label</Button>
      );
      const btn = screen.getByRole("button");
      const text = btn.textContent ?? "";
      expect(text.indexOf("label")).toBeLessThan(text.indexOf("R"));
    });

    it("renders both sections in order", () => {
      render(
        <Button
          leftSection={<span>L</span>}
          rightSection={<span>R</span>}
        >
          label
        </Button>
      );
      const btn = screen.getByRole("button");
      expect(btn.textContent).toBe("LlabelR");
    });
  });
});
