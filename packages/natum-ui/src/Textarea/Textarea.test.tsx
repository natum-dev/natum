import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { createRef } from "react";
import userEvent from "@testing-library/user-event";
import { Textarea } from "./Textarea";

// --- JSDOM helpers ---
// JSDOM returns scrollHeight=0 and lineHeight="" from getComputedStyle.
// Stub both when a test needs autoResize to compute a real height.
type Stub = { restore: () => void };

function stubScrollHeight(valuesByValueLength: (length: number) => number): Stub {
  const descriptor = Object.getOwnPropertyDescriptor(
    HTMLTextAreaElement.prototype,
    "scrollHeight"
  );
  Object.defineProperty(HTMLTextAreaElement.prototype, "scrollHeight", {
    configurable: true,
    get() {
      return valuesByValueLength((this as HTMLTextAreaElement).value.length);
    },
  });
  return {
    restore: () => {
      if (descriptor) {
        Object.defineProperty(
          HTMLTextAreaElement.prototype,
          "scrollHeight",
          descriptor
        );
      } else {
        // @ts-expect-error - delete on prototype
        delete HTMLTextAreaElement.prototype.scrollHeight;
      }
    },
  };
}

function stubLineHeight(px: number): Stub {
  const original = window.getComputedStyle;
  window.getComputedStyle = ((el: Element) => {
    const real = original(el);
    return new Proxy(real, {
      get(target, prop) {
        if (prop === "lineHeight") return `${px}px`;
        // @ts-expect-error index access
        return target[prop];
      },
    });
  }) as typeof window.getComputedStyle;
  return {
    restore: () => {
      window.getComputedStyle = original;
    },
  };
}

describe("Textarea", () => {
  const stubs: Stub[] = [];
  afterEach(() => {
    while (stubs.length) stubs.pop()!.restore();
  });

  // --- Renders ---
  it("renders a textarea with base wrapper + default variant + default size classes", () => {
    render(<Textarea data-testid="ta" />);
    const ta = screen.getByTestId("ta");
    expect(ta.tagName).toBe("TEXTAREA");
    const wrapper = ta.closest(".wrapper");
    expect(wrapper).not.toBeNull();
    const container = ta.closest(".input_container");
    expect(container).toHaveClass("outlined", "md");
  });

  // --- Variant ---
  it.each(["outlined", "filled"] as const)(
    "applies %s variant class to the input_container",
    (variant) => {
      render(<Textarea data-testid="ta" variant={variant} />);
      expect(screen.getByTestId("ta").closest(".input_container")).toHaveClass(
        variant
      );
    }
  );

  // --- Size ---
  it.each(["sm", "md", "lg"] as const)(
    "applies %s size class to the input_container",
    (size) => {
      render(<Textarea data-testid="ta" size={size} />);
      expect(screen.getByTestId("ta").closest(".input_container")).toHaveClass(
        size
      );
    }
  );

  // --- Label + a11y wiring ---
  it("renders a label and associates it via htmlFor", () => {
    render(<Textarea label="Notes" id="notes" data-testid="ta" />);
    const label = screen.getByText("Notes");
    expect(label).toHaveAttribute("for", "notes");
    expect(screen.getByTestId("ta")).toHaveAttribute("id", "notes");
  });

  it("renders helperText below", () => {
    render(<Textarea helperText="Max 200 chars" />);
    expect(screen.getByText("Max 200 chars")).toBeInTheDocument();
  });

  it("renders errorMessage with role=alert, sets aria-invalid, and replaces helperText", () => {
    render(
      <Textarea
        data-testid="ta"
        helperText="helper"
        errorMessage="required"
      />
    );
    expect(screen.queryByText("helper")).not.toBeInTheDocument();
    const msg = screen.getByText("required");
    expect(msg).toHaveAttribute("role", "alert");
    expect(screen.getByTestId("ta")).toHaveAttribute("aria-invalid", "true");
  });

  it("sets aria-describedby when a helper or error message is present", () => {
    render(
      <Textarea data-testid="ta" id="ta-1" helperText="helpful" />
    );
    const ta = screen.getByTestId("ta");
    expect(ta).toHaveAttribute("aria-describedby", "ta-1-message");
  });

  it("required sets aria-required + renders asterisk", () => {
    render(<Textarea data-testid="ta" label="Notes" required />);
    expect(screen.getByTestId("ta")).toHaveAttribute("aria-required", "true");
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  // --- readOnly / disabled ---
  it("readOnly applies readonly_state class + HTML attribute", () => {
    render(<Textarea data-testid="ta" readOnly />);
    const ta = screen.getByTestId("ta");
    expect(ta).toHaveAttribute("readonly");
    expect(ta.closest(".wrapper")).toHaveClass("readonly_state");
  });

  it("disabled applies disabled_state class + HTML attribute", () => {
    render(<Textarea data-testid="ta" disabled />);
    const ta = screen.getByTestId("ta");
    expect(ta).toBeDisabled();
    expect(ta.closest(".wrapper")).toHaveClass("disabled_state");
  });

  // --- rows ---
  it("forwards rows prop to the textarea", () => {
    render(<Textarea data-testid="ta" rows={5} />);
    expect(screen.getByTestId("ta")).toHaveAttribute("rows", "5");
  });

  it("defaults rows to 3", () => {
    render(<Textarea data-testid="ta" />);
    expect(screen.getByTestId("ta")).toHaveAttribute("rows", "3");
  });

  // --- resize ---
  it.each(["none", "vertical", "both"] as const)(
    "applies resize_%s class when resize=%s",
    (resize) => {
      render(<Textarea data-testid="ta" resize={resize} />);
      expect(screen.getByTestId("ta")).toHaveClass(`resize_${resize}`);
    }
  );

  it("defaults resize to vertical", () => {
    render(<Textarea data-testid="ta" />);
    expect(screen.getByTestId("ta")).toHaveClass("resize_vertical");
  });

  it("forces resize_none when autoResize is true (even if resize prop says vertical)", () => {
    render(<Textarea data-testid="ta" autoResize resize="vertical" />);
    const ta = screen.getByTestId("ta");
    expect(ta).toHaveClass("resize_none");
    expect(ta).not.toHaveClass("resize_vertical");
  });

  // --- autoResize growth + cap ---
  it("autoResize grows the textarea height based on scrollHeight", () => {
    stubs.push(stubLineHeight(20));
    stubs.push(stubScrollHeight((len) => 40 + len * 2));
    render(<Textarea data-testid="ta" autoResize defaultValue="abc" />);
    const ta = screen.getByTestId("ta") as HTMLTextAreaElement;
    expect(ta.style.height).toBe("46px"); // 40 + 3*2
  });

  it("autoResize caps height at maxRows × lineHeight and sets overflow-y=auto", () => {
    stubs.push(stubLineHeight(20));
    stubs.push(stubScrollHeight(() => 500));
    render(
      <Textarea
        data-testid="ta"
        autoResize
        maxRows={4}
        defaultValue="long text"
      />
    );
    const ta = screen.getByTestId("ta") as HTMLTextAreaElement;
    expect(ta.style.height).toBe("80px"); // 4 * 20
    expect(ta.style.overflowY).toBe("auto");
  });

  // --- Controlled / uncontrolled ---
  it("controlled: value + onChange", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <Textarea data-testid="ta" value="start" onChange={handleChange} />
    );
    await user.type(screen.getByTestId("ta"), "x");
    expect(handleChange).toHaveBeenCalled();
  });

  it("uncontrolled: defaultValue", () => {
    render(<Textarea data-testid="ta" defaultValue="initial" />);
    expect((screen.getByTestId("ta") as HTMLTextAreaElement).value).toBe(
      "initial"
    );
  });

  // --- className + ref + rest ---
  it("forwards ref to the textarea", () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(<Textarea ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });

  it("merges className onto the wrapper", () => {
    render(<Textarea data-testid="ta" className="my-wrap" />);
    expect(screen.getByTestId("ta").closest(".wrapper")).toHaveClass(
      "wrapper",
      "my-wrap"
    );
  });

  it("merges textareaClassName onto the <textarea>", () => {
    render(
      <Textarea data-testid="ta" textareaClassName="my-ta" />
    );
    expect(screen.getByTestId("ta")).toHaveClass("textarea", "my-ta");
  });

  it("spreads HTML attributes onto the textarea", () => {
    render(
      <Textarea data-testid="ta" placeholder="type here" name="notes" />
    );
    const ta = screen.getByTestId("ta");
    expect(ta).toHaveAttribute("placeholder", "type here");
    expect(ta).toHaveAttribute("name", "notes");
  });
});
