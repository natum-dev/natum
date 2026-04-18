import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { createRef } from "react";
import { Radio } from "./Radio";
import {
  RadioGroupContext,
  type RadioGroupContextValue,
} from "../RadioGroup/context";

function withContext(ctx: Partial<RadioGroupContextValue>) {
  const fullCtx: RadioGroupContextValue = {
    name: "test-group",
    value: undefined,
    onChange: undefined,
    size: "md",
    color: "primary",
    disabled: false,
    ...ctx,
  };
  return ({ children }: { children: React.ReactNode }) => (
    <RadioGroupContext.Provider value={fullCtx}>
      {children}
    </RadioGroupContext.Provider>
  );
}

describe("Radio", () => {
  it("renders as an input[type=radio]", () => {
    render(<Radio name="n" value="a" aria-label="a" />);
    const input = screen.getByRole("radio") as HTMLInputElement;
    expect(input.type).toBe("radio");
    expect(input).toHaveAttribute("value", "a");
  });

  it("applies base container class + default size (md) + default color (primary)", () => {
    const { container } = render(
      <Radio name="n" value="a" aria-label="a" />
    );
    expect(container.firstChild).toHaveClass("container", "md", "primary");
  });

  it("renders a label when label prop given; associates to input via htmlFor", () => {
    render(<Radio name="n" value="a" label="Option A" />);
    const input = screen.getByRole("radio") as HTMLInputElement;
    const label = screen.getByText("Option A");
    expect(label.tagName).toBe("LABEL");
    expect(label).toHaveAttribute("for", input.id);
  });

  it("omits the <label> element when no label prop is given (aria-label still works)", () => {
    render(<Radio name="n" value="a" aria-label="a11y only" />);
    const input = screen.getByRole("radio");
    expect(input).toHaveAccessibleName("a11y only");
    expect(document.querySelector("label")).toBeNull();
  });

  it.each(["sm", "md", "lg"] as const)(
    "applies %s size class on the container",
    (size) => {
      const { container } = render(
        <Radio name="n" value="a" size={size} aria-label="a" />
      );
      expect(container.firstChild).toHaveClass(size);
    }
  );

  it.each([
    "primary",
    "secondary",
    "error",
    "success",
    "warning",
    "info",
    "neutral",
  ] as const)("applies %s color class on the container", (color) => {
    const { container } = render(
      <Radio name="n" value="a" color={color} aria-label="a" />
    );
    expect(container.firstChild).toHaveClass(color);
  });

  it("disabled sets disabled attr on input + disabled class on container", () => {
    const { container } = render(
      <Radio name="n" value="a" disabled aria-label="a" />
    );
    expect(screen.getByRole("radio")).toBeDisabled();
    expect(container.firstChild).toHaveClass("disabled");
  });

  it("controlled: checked prop reflects on input", () => {
    const { rerender } = render(
      <Radio name="n" value="a" checked={false} onChange={() => {}} aria-label="a" />
    );
    expect(screen.getByRole("radio")).not.toBeChecked();
    rerender(
      <Radio name="n" value="a" checked={true} onChange={() => {}} aria-label="a" />
    );
    expect(screen.getByRole("radio")).toBeChecked();
  });

  it("uncontrolled: defaultChecked sets initial checked state", () => {
    render(<Radio name="n" value="a" defaultChecked aria-label="a" />);
    expect(screen.getByRole("radio")).toBeChecked();
  });

  it("fires onChange on click (standalone)", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <Radio
        name="n"
        value="a"
        checked={false}
        onChange={handleChange}
        aria-label="a"
      />
    );
    await user.click(screen.getByRole("radio"));
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it("group mode: reads name + value from context (checked when context.value === props.value)", () => {
    const Wrapper = withContext({ name: "ctx-group", value: "a" });
    render(
      <Wrapper>
        <Radio value="a" aria-label="a" />
        <Radio value="b" aria-label="b" />
      </Wrapper>
    );
    const [aRadio, bRadio] = screen.getAllByRole("radio") as HTMLInputElement[];
    expect(aRadio.name).toBe("ctx-group");
    expect(bRadio.name).toBe("ctx-group");
    expect(aRadio).toBeChecked();
    expect(bRadio).not.toBeChecked();
  });

  it("group mode: clicking a Radio invokes context.onChange(value, event)", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const Wrapper = withContext({ name: "ctx-group", value: "a", onChange });
    render(
      <Wrapper>
        <Radio value="a" aria-label="a" />
        <Radio value="b" aria-label="b" />
      </Wrapper>
    );
    const bRadio = screen.getAllByRole("radio")[1];
    await user.click(bRadio);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0]).toBe("b");
    expect(onChange.mock.calls[0][1]).toMatchObject({ target: expect.any(HTMLInputElement) });
  });

  it("individual size/color override context defaults", () => {
    const Wrapper = withContext({ size: "sm", color: "error" });
    const { container } = render(
      <Wrapper>
        <Radio value="a" size="lg" color="success" aria-label="a" />
      </Wrapper>
    );
    expect(container.querySelector(".container")).toHaveClass("lg", "success");
    expect(container.querySelector(".container")).not.toHaveClass("sm", "error");
  });

  it("individual disabled=true wins over context disabled=false", () => {
    const Wrapper = withContext({ disabled: false });
    render(
      <Wrapper>
        <Radio value="a" disabled aria-label="a" />
      </Wrapper>
    );
    expect(screen.getByRole("radio")).toBeDisabled();
  });

  it("individual disabled=false does NOT override context disabled=true (OR semantics)", () => {
    const Wrapper = withContext({ disabled: true });
    render(
      <Wrapper>
        <Radio value="a" disabled={false} aria-label="a" />
      </Wrapper>
    );
    expect(screen.getByRole("radio")).toBeDisabled();
  });

  it("explicit name on Radio takes precedence over context (escape hatch)", () => {
    const Wrapper = withContext({ name: "ctx-group" });
    render(
      <Wrapper>
        <Radio name="custom" value="a" aria-label="a" />
      </Wrapper>
    );
    expect(screen.getByRole("radio")).toHaveAttribute("name", "custom");
  });

  it("forwards ref to the input", () => {
    const ref = createRef<HTMLInputElement>();
    render(<Radio ref={ref} name="n" value="a" aria-label="a" />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current?.type).toBe("radio");
  });

  it("merges custom className onto the container", () => {
    const { container } = render(
      <Radio name="n" value="a" className="custom" aria-label="a" />
    );
    expect(container.firstChild).toHaveClass("container", "custom");
  });

  it("spreads additional HTML attributes onto the input", () => {
    render(
      <Radio
        name="n"
        value="a"
        aria-label="a"
        data-testid="my-radio"
        tabIndex={-1}
      />
    );
    const input = screen.getByTestId("my-radio");
    expect(input).toHaveAttribute("tabIndex", "-1");
  });
});
