import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { createRef, useState } from "react";
import { RadioGroup } from "./RadioGroup";
import { Radio } from "../Radio";

describe("RadioGroup", () => {
  it("renders a <fieldset> containing child radios", () => {
    render(
      <RadioGroup data-testid="group" name="g" aria-label="group">
        <Radio value="a" label="A" />
        <Radio value="b" label="B" />
      </RadioGroup>
    );
    const group = screen.getByTestId("group");
    expect(group.tagName).toBe("FIELDSET");
    expect(screen.getAllByRole("radio")).toHaveLength(2);
  });

  it("renders a <legend> when label prop is provided", () => {
    render(
      <RadioGroup name="g" label="Pick one">
        <Radio value="a" label="A" />
      </RadioGroup>
    );
    const legend = screen.getByText("Pick one");
    expect(legend.tagName).toBe("LEGEND");
  });

  it("does NOT render a legend when label is absent", () => {
    render(
      <RadioGroup name="g" aria-label="group">
        <Radio value="a" label="A" />
      </RadioGroup>
    );
    expect(document.querySelector("legend")).toBeNull();
  });

  it("auto-generates a name via useId when name prop is omitted; shared across radios", () => {
    render(
      <RadioGroup aria-label="group">
        <Radio value="a" label="A" />
        <Radio value="b" label="B" />
      </RadioGroup>
    );
    const [a, b] = screen.getAllByRole("radio") as HTMLInputElement[];
    expect(a.name).toBeTruthy();
    expect(a.name).toBe(b.name);
  });

  it("controlled: value prop — only the matching Radio is checked", () => {
    render(
      <RadioGroup name="g" value="b" onChange={() => {}}>
        <Radio value="a" label="A" />
        <Radio value="b" label="B" />
        <Radio value="c" label="C" />
      </RadioGroup>
    );
    const [a, b, c] = screen.getAllByRole("radio") as HTMLInputElement[];
    expect(a).not.toBeChecked();
    expect(b).toBeChecked();
    expect(c).not.toBeChecked();
  });

  it("controlled: onChange(value, event) fires with the newly selected value", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const ControlledWrapper = () => {
      const [v, setV] = useState("a");
      return (
        <RadioGroup
          name="g"
          value={v}
          onChange={(next, e) => {
            onChange(next, e);
            setV(next);
          }}
        >
          <Radio value="a" label="A" />
          <Radio value="b" label="B" />
        </RadioGroup>
      );
    };
    render(<ControlledWrapper />);
    await user.click(screen.getByLabelText("B"));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0]).toBe("b");
    expect(onChange.mock.calls[0][1]).toMatchObject({
      target: expect.any(HTMLInputElement),
    });
  });

  it("uncontrolled: defaultValue sets initial checked Radio", () => {
    render(
      <RadioGroup name="g" defaultValue="b">
        <Radio value="a" label="A" />
        <Radio value="b" label="B" />
      </RadioGroup>
    );
    expect(screen.getByLabelText("B")).toBeChecked();
    expect(screen.getByLabelText("A")).not.toBeChecked();
  });

  it("uncontrolled: selection updates internal state", async () => {
    const user = userEvent.setup();
    render(
      <RadioGroup name="g" defaultValue="a">
        <Radio value="a" label="A" />
        <Radio value="b" label="B" />
      </RadioGroup>
    );
    expect(screen.getByLabelText("A")).toBeChecked();
    await user.click(screen.getByLabelText("B"));
    expect(screen.getByLabelText("B")).toBeChecked();
    expect(screen.getByLabelText("A")).not.toBeChecked();
  });

  it.each(["vertical", "horizontal"] as const)(
    "applies %s orientation class on the fieldset",
    (orientation) => {
      render(
        <RadioGroup
          data-testid="group"
          name="g"
          orientation={orientation}
          aria-label="group"
        >
          <Radio value="a" label="A" />
        </RadioGroup>
      );
      expect(screen.getByTestId("group")).toHaveClass(orientation);
    }
  );

  it.each([0, 1, 2, 3, 4, 6, 8, 12, 16] as const)(
    "applies gap_%i class when gap=%i",
    (gap) => {
      render(
        <RadioGroup
          data-testid="group"
          name="g"
          gap={gap}
          aria-label="group"
        >
          <Radio value="a" label="A" />
        </RadioGroup>
      );
      expect(screen.getByTestId("group")).toHaveClass(`gap_${gap}`);
    }
  );

  it("renders helperText in the message slot", () => {
    render(
      <RadioGroup name="g" aria-label="group" helperText="Pick wisely">
        <Radio value="a" label="A" />
      </RadioGroup>
    );
    expect(screen.getByText("Pick wisely")).toBeInTheDocument();
  });

  it("errorMessage replaces helperText and gets role=alert", () => {
    render(
      <RadioGroup
        name="g"
        aria-label="group"
        helperText="Pick wisely"
        errorMessage="Please select one"
      >
        <Radio value="a" label="A" />
      </RadioGroup>
    );
    expect(screen.queryByText("Pick wisely")).not.toBeInTheDocument();
    const msg = screen.getByText("Please select one");
    expect(msg).toHaveAttribute("role", "alert");
  });

  it("errorMessage sets aria-invalid on the fieldset", () => {
    render(
      <RadioGroup
        data-testid="group"
        name="g"
        aria-label="group"
        errorMessage="required"
      >
        <Radio value="a" label="A" />
      </RadioGroup>
    );
    expect(screen.getByTestId("group")).toHaveAttribute(
      "aria-invalid",
      "true"
    );
  });

  it("required renders asterisk in legend + sets aria-required; does NOT set required on any input", () => {
    render(
      <RadioGroup
        data-testid="group"
        name="g"
        label="Plan"
        required
      >
        <Radio value="a" label="A" />
        <Radio value="b" label="B" />
      </RadioGroup>
    );
    expect(screen.getByText("*")).toBeInTheDocument();
    expect(screen.getByTestId("group")).toHaveAttribute(
      "aria-required",
      "true"
    );
    (screen.getAllByRole("radio") as HTMLInputElement[]).forEach((input) => {
      expect(input).not.toBeRequired();
    });
  });

  it("disabled sets disabled on the fieldset, which natively disables children", () => {
    render(
      <RadioGroup name="g" aria-label="group" disabled>
        <Radio value="a" label="A" />
        <Radio value="b" label="B" />
      </RadioGroup>
    );
    screen.getAllByRole("radio").forEach((input) => {
      expect(input).toBeDisabled();
    });
  });

  it("individual Radio disabled=false does NOT override a disabled group (OR semantics)", () => {
    render(
      <RadioGroup name="g" aria-label="group" disabled>
        <Radio value="a" label="A" disabled={false} />
      </RadioGroup>
    );
    expect(screen.getByLabelText("A")).toBeDisabled();
  });

  it("individual Radio size/color overrides context visual defaults", () => {
    render(
      <RadioGroup name="g" aria-label="group" size="sm" color="error">
        <Radio value="a" label="A" />
        <Radio value="b" label="B" size="lg" color="success" />
      </RadioGroup>
    );
    const aContainer = screen.getByLabelText("A").closest(".container")!;
    expect(aContainer).toHaveClass("sm", "error");
    const bContainer = screen.getByLabelText("B").closest(".container")!;
    expect(bContainer).toHaveClass("lg", "success");
  });

  it("forwards ref to the fieldset", () => {
    const ref = createRef<HTMLFieldSetElement>();
    render(
      <RadioGroup ref={ref} name="g" aria-label="group">
        <Radio value="a" label="A" />
      </RadioGroup>
    );
    expect(ref.current).toBeInstanceOf(HTMLFieldSetElement);
  });

  it("merges custom className onto the fieldset", () => {
    render(
      <RadioGroup
        data-testid="group"
        name="g"
        aria-label="group"
        className="custom"
      >
        <Radio value="a" label="A" />
      </RadioGroup>
    );
    expect(screen.getByTestId("group")).toHaveClass("group", "custom");
  });

  it("spreads additional HTML attributes onto the fieldset", () => {
    render(
      <RadioGroup
        data-testid="group"
        name="g"
        aria-label="group"
        id="my-group"
      >
        <Radio value="a" label="A" />
      </RadioGroup>
    );
    expect(screen.getByTestId("group")).toHaveAttribute("id", "my-group");
  });
});
