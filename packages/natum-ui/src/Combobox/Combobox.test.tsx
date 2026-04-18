import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React, { createRef } from "react";
import { Combobox } from "./Combobox";
import { ComboboxItem } from "./ComboboxItem";
import { ComboboxGroup } from "./ComboboxGroup";

// jsdom polyfill: offsetWidth returns 0 in jsdom. Force 200 so width-matching
// doesn't collapse the listbox. Same pattern as Select.test.tsx.
beforeEach(() => {
  Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
    configurable: true,
    get() {
      return 200;
    },
  });
});
afterEach(() => {
  vi.clearAllMocks();
});

function renderBasic(
  props: Partial<React.ComponentProps<typeof Combobox>> = {}
) {
  return render(
    <Combobox label="Fruit" placeholder="Pick one" {...props}>
      <ComboboxItem value="apple">Apple</ComboboxItem>
      <ComboboxItem value="banana">Banana</ComboboxItem>
      <ComboboxItem value="cherry">Cherry</ComboboxItem>
    </Combobox>
  );
}

describe("Combobox — trigger render", () => {
  it("renders a <label> linked to the input via htmlFor", () => {
    renderBasic();
    const input = screen.getByRole("combobox");
    const label = screen.getByText("Fruit");
    expect(label.tagName).toBe("LABEL");
    expect(label).toHaveAttribute("for", input.id);
  });

  it("shows the placeholder when no value is selected", () => {
    renderBasic();
    const input = screen.getByRole("combobox") as HTMLInputElement;
    expect(input.placeholder).toBe("Pick one");
  });

  it("single: input shows selected label when unfocused", () => {
    renderBasic({ defaultValue: "banana" });
    const input = screen.getByRole("combobox") as HTMLInputElement;
    expect(input.value).toBe("Banana");
  });

  it("required renders asterisk + sets aria-required", () => {
    renderBasic({ required: true });
    expect(screen.getByText("*")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toHaveAttribute("aria-required", "true");
  });

  it("errorMessage → role=alert + aria-invalid on input", () => {
    renderBasic({ errorMessage: "Pick something" });
    expect(screen.getByRole("combobox")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("Pick something")).toHaveAttribute("role", "alert");
  });

  it("helperText renders in the message slot when no error", () => {
    renderBasic({ helperText: "Pick wisely" });
    expect(screen.getByText("Pick wisely")).toBeInTheDocument();
  });

  it("leftSection renders", () => {
    renderBasic({ leftSection: <span data-testid="icon" /> });
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("aria-autocomplete='list' is present", () => {
    renderBasic();
    expect(screen.getByRole("combobox")).toHaveAttribute(
      "aria-autocomplete",
      "list"
    );
  });
});

describe("Combobox — basic interactions", () => {
  it("click on container focuses input and opens the listbox", async () => {
    const user = userEvent.setup();
    const { container } = renderBasic();
    const input = screen.getByRole("combobox");
    const wrapper = container.querySelector(".input_container")!;
    await user.click(wrapper);
    expect(input).toHaveAttribute("aria-expanded", "true");
    expect(document.activeElement).toBe(input);
  });

  it("click on the input opens the listbox", async () => {
    const user = userEvent.setup();
    renderBasic();
    const input = screen.getByRole("combobox");
    await user.click(input);
    expect(input).toHaveAttribute("aria-expanded", "true");
  });

  it("disabled → input not focusable, container has disabled class", async () => {
    const user = userEvent.setup();
    renderBasic({ disabled: true });
    const input = screen.getByRole("combobox") as HTMLInputElement;
    expect(input).toBeDisabled();
    await user.click(input);
    expect(input).toHaveAttribute("aria-expanded", "false");
  });

  it("readOnly → input focusable, typing blocked, listbox does NOT open", async () => {
    const user = userEvent.setup();
    renderBasic({ readOnly: true });
    const input = screen.getByRole("combobox") as HTMLInputElement;
    expect(input).toHaveAttribute("readonly");
    await user.click(input);
    expect(input).toHaveAttribute("aria-expanded", "false");
  });

  it("opens with role=listbox; aria-multiselectable only on multi", async () => {
    const user = userEvent.setup();
    renderBasic();
    await user.click(screen.getByRole("combobox"));
    const listbox = await screen.findByRole("listbox");
    expect(listbox).not.toHaveAttribute("aria-multiselectable");
  });

  it("listbox is portaled to document.body", async () => {
    const user = userEvent.setup();
    const { container } = renderBasic();
    await user.click(screen.getByRole("combobox"));
    const listbox = await screen.findByRole("listbox");
    expect(container.contains(listbox)).toBe(false);
    expect(document.body.contains(listbox)).toBe(true);
  });

  it("Escape closes the listbox", async () => {
    const user = userEvent.setup();
    renderBasic();
    const input = screen.getByRole("combobox");
    await user.click(input);
    expect(input).toHaveAttribute("aria-expanded", "true");
    await user.keyboard("{Escape}");
    expect(input).toHaveAttribute("aria-expanded", "false");
  });

  it("ref forwards to the <input>", () => {
    const ref = createRef<HTMLInputElement>();
    renderBasic({ ref });
    expect(ref.current?.tagName).toBe("INPUT");
    expect(ref.current).toHaveAttribute("role", "combobox");
  });
});

describe("Combobox — filtering", () => {
  it("typing filters items via default substring match", async () => {
    const user = userEvent.setup();
    renderBasic();
    const input = screen.getByRole("combobox");
    await user.click(input);
    await user.type(input, "an");
    const listbox = screen.getByRole("listbox");
    expect(listbox).toHaveTextContent("Banana");
    expect(listbox).not.toHaveTextContent("Apple");
    expect(listbox).not.toHaveTextContent("Cherry");
  });

  it("filter is case-insensitive", async () => {
    const user = userEvent.setup();
    renderBasic();
    const input = screen.getByRole("combobox");
    await user.click(input);
    await user.type(input, "AP");
    const listbox = screen.getByRole("listbox");
    expect(listbox).toHaveTextContent("Apple");
  });

  it("empty groups hide when all items are filtered out", async () => {
    const user = userEvent.setup();
    render(
      <Combobox label="Pick">
        <ComboboxGroup label="Fruit">
          <ComboboxItem value="apple">Apple</ComboboxItem>
          <ComboboxItem value="banana">Banana</ComboboxItem>
        </ComboboxGroup>
        <ComboboxGroup label="Vegetable">
          <ComboboxItem value="carrot">Carrot</ComboboxItem>
        </ComboboxGroup>
      </Combobox>
    );
    const input = screen.getByRole("combobox");
    await user.click(input);
    await user.type(input, "car");
    expect(screen.queryByText("Fruit")).not.toBeInTheDocument();
    expect(screen.getByText("Vegetable")).toBeInTheDocument();
  });

  it("activeIndex resets to first visible on keystroke", async () => {
    const user = userEvent.setup();
    renderBasic();
    const input = screen.getByRole("combobox") as HTMLInputElement;
    await user.click(input);
    // Move past default first item.
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{ArrowDown}");
    // Now filter — list narrows. activeIndex should reset to 0.
    await user.type(input, "a");
    const listbox = screen.getByRole("listbox");
    const appleOpt = within(listbox).getByText("Apple").closest("[role=option]")!;
    expect(input.getAttribute("aria-activedescendant")).toBe(appleOpt.id);
  });

  it("clearing search restores all items", async () => {
    const user = userEvent.setup();
    renderBasic();
    const input = screen.getByRole("combobox") as HTMLInputElement;
    await user.click(input);
    await user.type(input, "an");
    expect(screen.getByRole("listbox")).not.toHaveTextContent("Cherry");
    await user.clear(input);
    const listbox = screen.getByRole("listbox");
    expect(listbox).toHaveTextContent("Apple");
    expect(listbox).toHaveTextContent("Banana");
    expect(listbox).toHaveTextContent("Cherry");
  });

  it("custom filter prop receives (query, item) and is respected", async () => {
    const user = userEvent.setup();
    const customFilter = vi.fn(
      (q: string, item: { textValue: string }) => item.textValue.startsWith(q)
    );
    render(
      <Combobox label="F" filter={customFilter}>
        <ComboboxItem value="apple">Apple</ComboboxItem>
        <ComboboxItem value="banana">Banana</ComboboxItem>
        <ComboboxItem value="apricot">Apricot</ComboboxItem>
      </Combobox>
    );
    const input = screen.getByRole("combobox");
    await user.click(input);
    await user.type(input, "ap");
    expect(customFilter).toHaveBeenCalled();
    const listbox = screen.getByRole("listbox");
    expect(listbox).toHaveTextContent("Apple");
    expect(listbox).toHaveTextContent("Apricot");
    expect(listbox).not.toHaveTextContent("Banana");
  });

  it("loading=true bypasses the filter (all items shown — but listbox renders Loading row)", async () => {
    const user = userEvent.setup();
    render(
      <Combobox label="F" loading searchValue="zzzzz" onSearchChange={() => {}}>
        <ComboboxItem value="a">Apple</ComboboxItem>
      </Combobox>
    );
    const input = screen.getByRole("combobox");
    await user.click(input);
    // Loading row wins per Listbox state precedence (Task 2).
    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });
});

describe("Combobox — selection", () => {
  it("single controlled: selecting emits onChange(value), input updates to label", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const Wrapper = () => {
      const [v, setV] = React.useState<string | undefined>(undefined);
      return (
        <Combobox label="F" value={v} onChange={(next) => { onChange(next); setV(next); }}>
          <ComboboxItem value="a">Apple</ComboboxItem>
          <ComboboxItem value="b">Banana</ComboboxItem>
        </Combobox>
      );
    };
    render(<Wrapper />);
    const input = screen.getByRole("combobox") as HTMLInputElement;
    await user.click(input);
    await user.click(screen.getByText("Banana"));
    expect(onChange).toHaveBeenCalledWith("b");
    input.blur();
    expect(input.value).toBe("Banana");
  });

  it("single pick clears searchValue", async () => {
    const user = userEvent.setup();
    renderBasic();
    const input = screen.getByRole("combobox") as HTMLInputElement;
    await user.click(input);
    await user.type(input, "ba");
    expect(input.value).toBe("ba");
    await user.click(screen.getByText("Banana"));
    expect(input.value).toBe("Banana");
  });

  it("multi controlled: toggling adds to onChange payload", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const Wrapper = () => {
      const [v, setV] = React.useState<string[]>([]);
      return (
        <Combobox label="F" multiple value={v} onChange={(next) => { onChange(next); setV(next); }}>
          <ComboboxItem value="a">Apple</ComboboxItem>
          <ComboboxItem value="b">Banana</ComboboxItem>
        </Combobox>
      );
    };
    render(<Wrapper />);
    const input = screen.getByRole("combobox");
    await user.click(input);
    await user.click(screen.getByText("Apple"));
    expect(onChange).toHaveBeenLastCalledWith(["a"]);
    await user.click(screen.getByText("Banana"));
    expect(onChange).toHaveBeenLastCalledWith(["a", "b"]);
  });

  it("multi pick keeps listbox open", async () => {
    const user = userEvent.setup();
    render(
      <Combobox label="F" multiple>
        <ComboboxItem value="a">Apple</ComboboxItem>
        <ComboboxItem value="b">Banana</ComboboxItem>
      </Combobox>
    );
    const input = screen.getByRole("combobox");
    await user.click(input);
    await user.click(screen.getByText("Apple"));
    expect(input).toHaveAttribute("aria-expanded", "true");
  });

  it("multi: chips render for each selected value", () => {
    render(
      <Combobox label="F" multiple defaultValue={["a", "b"]}>
        <ComboboxItem value="a">Apple</ComboboxItem>
        <ComboboxItem value="b">Banana</ComboboxItem>
      </Combobox>
    );
    expect(screen.getByText("Apple")).toBeInTheDocument();
    expect(screen.getByText("Banana")).toBeInTheDocument();
    expect(screen.getByLabelText("Remove Apple")).toBeInTheDocument();
    expect(screen.getByLabelText("Remove Banana")).toBeInTheDocument();
  });

  it("multi chip × click removes that value", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const Wrapper = () => {
      const [v, setV] = React.useState<string[]>(["a", "b"]);
      return (
        <Combobox label="F" multiple value={v} onChange={(next) => { onChange(next); setV(next); }}>
          <ComboboxItem value="a">Apple</ComboboxItem>
          <ComboboxItem value="b">Banana</ComboboxItem>
        </Combobox>
      );
    };
    render(<Wrapper />);
    await user.click(screen.getByLabelText("Remove Apple"));
    expect(onChange).toHaveBeenCalledWith(["b"]);
  });

  it("multi Backspace on empty input removes last chip", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const Wrapper = () => {
      const [v, setV] = React.useState<string[]>(["a", "b"]);
      return (
        <Combobox label="F" multiple value={v} onChange={(next) => { onChange(next); setV(next); }}>
          <ComboboxItem value="a">Apple</ComboboxItem>
          <ComboboxItem value="b">Banana</ComboboxItem>
        </Combobox>
      );
    };
    render(<Wrapper />);
    const input = screen.getByRole("combobox") as HTMLInputElement;
    input.focus();
    await user.keyboard("{Backspace}");
    expect(onChange).toHaveBeenCalledWith(["a"]);
  });

  it("multi Backspace with text in input does NOT remove chips", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Combobox label="F" multiple defaultValue={["a"]} onChange={onChange}>
        <ComboboxItem value="a">Apple</ComboboxItem>
      </Combobox>
    );
    const input = screen.getByRole("combobox") as HTMLInputElement;
    await user.click(input);
    await user.type(input, "x");
    await user.keyboard("{Backspace}");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("Enter on active item selects (single) + closes", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Combobox label="F" onChange={onChange}>
        <ComboboxItem value="a">A</ComboboxItem>
        <ComboboxItem value="b">B</ComboboxItem>
      </Combobox>
    );
    const input = screen.getByRole("combobox");
    await user.click(input);
    await user.keyboard("{ArrowDown}{Enter}");
    expect(onChange).toHaveBeenCalledWith("b");
    expect(input).toHaveAttribute("aria-expanded", "false");
  });

  it("Space does NOT select (Space is a legal input character)", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Combobox label="F" onChange={onChange}>
        <ComboboxItem value="a">A</ComboboxItem>
      </Combobox>
    );
    const input = screen.getByRole("combobox") as HTMLInputElement;
    await user.click(input);
    await user.keyboard(" ");
    expect(onChange).not.toHaveBeenCalled();
    expect(input.value).toContain(" ");
  });

  it("disabled item is not selectable by click or keyboard", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Combobox label="F" onChange={onChange}>
        <ComboboxItem value="a" disabled>A</ComboboxItem>
        <ComboboxItem value="b">B</ComboboxItem>
      </Combobox>
    );
    const input = screen.getByRole("combobox");
    await user.click(input);
    await user.click(screen.getByText("A"));
    expect(onChange).not.toHaveBeenCalled();
  });
});
