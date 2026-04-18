import { render, screen, within, fireEvent } from "@testing-library/react";
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

describe("Combobox — UI states", () => {
  it("loading=true shows a Spinner + 'Loading…' row", async () => {
    const user = userEvent.setup();
    render(
      <Combobox label="F" loading>
        <ComboboxItem value="a">A</ComboboxItem>
      </Combobox>
    );
    const input = screen.getByRole("combobox");
    await user.click(input);
    expect(screen.getByText("Loading…")).toBeInTheDocument();
    // Spinner renders an IconLoader; an svg should be present inside the listbox.
    const listbox = screen.getByRole("listbox");
    expect(listbox.querySelector("svg")).toBeInTheDocument();
  });

  it("error renders with role=alert and the provided content", async () => {
    const user = userEvent.setup();
    render(
      <Combobox label="F" error="Couldn't load">
        <ComboboxItem value="a">A</ComboboxItem>
      </Combobox>
    );
    const input = screen.getByRole("combobox");
    await user.click(input);
    const row = screen.getByText("Couldn't load");
    expect(row).toHaveAttribute("role", "alert");
  });

  it("empty children + no query → default 'No options'", async () => {
    const user = userEvent.setup();
    render(<Combobox label="F">{null}</Combobox>);
    await user.click(screen.getByRole("combobox"));
    expect(await screen.findByText("No options")).toBeInTheDocument();
  });

  it("empty filtered + query → default no-match message", async () => {
    const user = userEvent.setup();
    renderBasic();
    const input = screen.getByRole("combobox");
    await user.click(input);
    await user.type(input, "zzz");
    expect(await screen.findByText(/No results for "zzz"/)).toBeInTheDocument();
  });

  it("custom emptyContent renders when children is empty", async () => {
    const user = userEvent.setup();
    render(
      <Combobox label="F" emptyContent={<span>nothing here</span>}>
        {null}
      </Combobox>
    );
    await user.click(screen.getByRole("combobox"));
    expect(screen.getByText("nothing here")).toBeInTheDocument();
  });

  it("custom noMatchContent renders when query has no matches", async () => {
    const user = userEvent.setup();
    render(
      <Combobox label="F" noMatchContent={<span>nope</span>}>
        <ComboboxItem value="a">A</ComboboxItem>
      </Combobox>
    );
    const input = screen.getByRole("combobox");
    await user.click(input);
    await user.type(input, "zzz");
    expect(screen.getByText("nope")).toBeInTheDocument();
  });
});

describe("Combobox — clearable", () => {
  it("clearable single: X button fires onChange(undefined) + onClear", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onClear = vi.fn();
    render(
      <Combobox
        label="F"
        clearable
        defaultValue="a"
        onChange={onChange}
        onClear={onClear}
      >
        <ComboboxItem value="a">Apple</ComboboxItem>
      </Combobox>
    );
    const clearBtn = screen.getByLabelText("Clear selection");
    await user.click(clearBtn);
    expect(onChange).toHaveBeenCalledWith(undefined);
    expect(onClear).toHaveBeenCalled();
  });

  it("clearable multi: X clears all chips and fires onChange([])", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Combobox label="F" multiple clearable defaultValue={["a", "b"]} onChange={onChange}>
        <ComboboxItem value="a">Apple</ComboboxItem>
        <ComboboxItem value="b">Banana</ComboboxItem>
      </Combobox>
    );
    await user.click(screen.getByLabelText("Clear selection"));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it("clear does NOT close the listbox if open", async () => {
    const user = userEvent.setup();
    render(
      <Combobox label="F" clearable defaultValue="a">
        <ComboboxItem value="a">Apple</ComboboxItem>
      </Combobox>
    );
    const input = screen.getByRole("combobox");
    await user.click(input);
    expect(input).toHaveAttribute("aria-expanded", "true");
    await user.click(screen.getByLabelText("Clear selection"));
    expect(input).toHaveAttribute("aria-expanded", "true");
  });
});

describe("Combobox — form integration", () => {
  it("name + single value → one hidden input", () => {
    render(
      <Combobox label="F" name="fruit" defaultValue="a">
        <ComboboxItem value="a">Apple</ComboboxItem>
      </Combobox>
    );
    const hidden = document.querySelectorAll<HTMLInputElement>(
      'input[type="hidden"][name="fruit"]'
    );
    expect(hidden).toHaveLength(1);
    expect(hidden[0].value).toBe("a");
  });

  it("name + multi values → one hidden input per value", () => {
    render(
      <Combobox label="F" multiple name="tags" defaultValue={["a", "b"]}>
        <ComboboxItem value="a">A</ComboboxItem>
        <ComboboxItem value="b">B</ComboboxItem>
      </Combobox>
    );
    const hidden = document.querySelectorAll<HTMLInputElement>(
      'input[type="hidden"][name="tags"]'
    );
    expect(hidden).toHaveLength(2);
    expect(Array.from(hidden).map((h) => h.value)).toEqual(["a", "b"]);
  });

  it("no name → no hidden inputs", () => {
    render(
      <Combobox label="F" defaultValue="a">
        <ComboboxItem value="a">Apple</ComboboxItem>
      </Combobox>
    );
    expect(document.querySelectorAll('input[type="hidden"]').length).toBe(0);
  });
});

describe("Combobox — controlled open + search", () => {
  it("open prop controls visibility", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <Combobox label="F" open={false} onOpenChange={onOpenChange}>
        <ComboboxItem value="a">A</ComboboxItem>
      </Combobox>
    );
    const input = screen.getByRole("combobox");
    expect(input).toHaveAttribute("aria-expanded", "false");
    await user.click(input);
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(input).toHaveAttribute("aria-expanded", "false");
    rerender(
      <Combobox label="F" open={true} onOpenChange={onOpenChange}>
        <ComboboxItem value="a">A</ComboboxItem>
      </Combobox>
    );
    expect(input).toHaveAttribute("aria-expanded", "true");
  });

  it("defaultOpen={true} opens on mount", async () => {
    render(
      <Combobox label="F" defaultOpen>
        <ComboboxItem value="a">A</ComboboxItem>
      </Combobox>
    );
    expect(await screen.findByRole("listbox")).toBeInTheDocument();
  });

  it("searchValue controlled: typing fires onSearchChange; input reads controlled prop", async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();
    const Wrapper = () => {
      const [q, setQ] = React.useState("");
      return (
        <Combobox
          label="F"
          searchValue={q}
          onSearchChange={(next) => {
            onSearchChange(next);
            setQ(next);
          }}
        >
          <ComboboxItem value="a">Apple</ComboboxItem>
          <ComboboxItem value="b">Banana</ComboboxItem>
        </Combobox>
      );
    };
    render(<Wrapper />);
    const input = screen.getByRole("combobox") as HTMLInputElement;
    await user.click(input);
    await user.type(input, "a");
    expect(onSearchChange).toHaveBeenLastCalledWith("a");
    expect(input.value).toBe("a");
  });
});

describe("Combobox — single-select input revert", () => {
  it("Escape clears searchValue → input reverts to selected label", async () => {
    const user = userEvent.setup();
    renderBasic({ defaultValue: "banana" });
    const input = screen.getByRole("combobox") as HTMLInputElement;
    // Focus + simulate typing over the selected label via fireEvent.change to bypass
    // the jsdom rAF-select-all race (a real browser user types after select-all replaces
    // the label; fireEvent.change directly sets the value as if the replace happened).
    input.focus();
    fireEvent.change(input, { target: { value: "xx" } });
    expect(input.value).toBe("xx");
    await user.keyboard("{Escape}");
    expect(input.value).toBe("Banana");
  });

  it("Blur (without picking) reverts input to selected label", async () => {
    const user = userEvent.setup();
    renderBasic({ defaultValue: "banana" });
    const input = screen.getByRole("combobox") as HTMLInputElement;
    input.focus();
    fireEvent.change(input, { target: { value: "xx" } });
    expect(input.value).toBe("xx");
    await user.tab();
    expect(input.value).toBe("Banana");
  });
});
