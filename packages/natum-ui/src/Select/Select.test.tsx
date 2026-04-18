import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createRef, useState } from "react";
import { Select } from "./Select";
import { SelectItem } from "./SelectItem";
import { SelectGroup } from "./SelectGroup";

// jsdom polyfill: offsetWidth returns 0 in jsdom. Force 200 so width-matching
// doesn't collapse the listbox.
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

function renderBasic(props: Partial<React.ComponentProps<typeof Select>> = {}) {
  return render(
    <Select label="Fruit" placeholder="Pick one" {...props}>
      <SelectItem value="apple">Apple</SelectItem>
      <SelectItem value="banana">Banana</SelectItem>
      <SelectItem value="cherry">Cherry</SelectItem>
    </Select>
  );
}

describe("Select", () => {
  // --- Trigger render ---
  it("renders a <label> linked to the trigger via htmlFor", () => {
    renderBasic();
    const trigger = screen.getByRole("combobox");
    const label = screen.getByText("Fruit");
    expect(label.tagName).toBe("LABEL");
    expect(label).toHaveAttribute("for", trigger.id);
  });

  it("shows the placeholder when no value is selected", () => {
    renderBasic();
    expect(screen.getByText("Pick one")).toBeInTheDocument();
  });

  it("shows the selected label (single)", () => {
    renderBasic({ defaultValue: "banana" });
    expect(screen.getByRole("combobox")).toHaveTextContent("Banana");
  });

  it("multi: shows 'N selected' when > 0", () => {
    render(
      <Select label="Tags" multiple defaultValue={["apple", "banana"]}>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
      </Select>
    );
    expect(screen.getByRole("combobox")).toHaveTextContent("2 selected");
  });

  it("multi: renderValue override", () => {
    render(
      <Select
        label="Tags"
        multiple
        defaultValue={["apple"]}
        renderValue={(v) => `Picked: ${v.join("/")}`}
      >
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
      </Select>
    );
    expect(screen.getByRole("combobox")).toHaveTextContent("Picked: apple");
  });

  it("required renders asterisk + sets aria-required", () => {
    renderBasic({ required: true });
    expect(screen.getByText("*")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toHaveAttribute("aria-required", "true");
  });

  it("errorMessage → role=alert + aria-invalid", () => {
    renderBasic({ errorMessage: "Pick something" });
    expect(screen.getByRole("combobox")).toHaveAttribute("aria-invalid", "true");
    const msg = screen.getByText("Pick something");
    expect(msg).toHaveAttribute("role", "alert");
  });

  it("helperText renders in the message slot when no error", () => {
    renderBasic({ helperText: "Pick wisely" });
    expect(screen.getByText("Pick wisely")).toBeInTheDocument();
  });

  it("leftSection renders", () => {
    renderBasic({ leftSection: <span data-testid="icon" /> });
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  // --- Trigger interactions ---
  it("click toggles open/closed", async () => {
    const user = userEvent.setup();
    renderBasic();
    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("Space on trigger opens", async () => {
    const user = userEvent.setup();
    renderBasic();
    const trigger = screen.getByRole("combobox");
    trigger.focus();
    await user.keyboard("{ }");
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("Enter on trigger opens", async () => {
    const user = userEvent.setup();
    renderBasic();
    const trigger = screen.getByRole("combobox");
    trigger.focus();
    await user.keyboard("{Enter}");
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("ArrowDown on trigger opens and makes the first non-disabled item active", async () => {
    const user = userEvent.setup();
    render(
      <Select label="F">
        <SelectItem value="a" disabled>A</SelectItem>
        <SelectItem value="b">B</SelectItem>
      </Select>
    );
    const trigger = screen.getByRole("combobox");
    trigger.focus();
    await user.keyboard("{ArrowDown}");
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    const listbox = await screen.findByRole("listbox");
    const activeId = trigger.getAttribute("aria-activedescendant");
    const activeOption = listbox.querySelector(`#${CSS.escape(activeId ?? "")}`);
    expect(activeOption).toHaveTextContent("B");
  });

  it("disabled → trigger not focusable, click does nothing", async () => {
    const user = userEvent.setup();
    renderBasic({ disabled: true });
    const trigger = screen.getByRole("combobox");
    expect(trigger).toBeDisabled();
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("readOnly → trigger is focusable, click does NOT open", async () => {
    const user = userEvent.setup();
    renderBasic({ readOnly: true });
    const trigger = screen.getByRole("combobox");
    expect(trigger).not.toBeDisabled();
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  // --- Listbox ---
  it("opens with role=listbox; aria-multiselectable only on multi", async () => {
    const user = userEvent.setup();
    renderBasic();
    await user.click(screen.getByRole("combobox"));
    const listbox = await screen.findByRole("listbox");
    expect(listbox).not.toHaveAttribute("aria-multiselectable");
  });

  it("multi: listbox has aria-multiselectable=true", async () => {
    const user = userEvent.setup();
    render(
      <Select label="Tags" multiple>
        <SelectItem value="a">A</SelectItem>
        <SelectItem value="b">B</SelectItem>
      </Select>
    );
    await user.click(screen.getByRole("combobox"));
    const listbox = await screen.findByRole("listbox");
    expect(listbox).toHaveAttribute("aria-multiselectable", "true");
  });

  it("listbox is portaled to document.body", async () => {
    const user = userEvent.setup();
    const { container } = renderBasic();
    await user.click(screen.getByRole("combobox"));
    const listbox = await screen.findByRole("listbox");
    expect(container.contains(listbox)).toBe(false);
    expect(document.body.contains(listbox)).toBe(true);
  });

  it("empty children → 'No options'", async () => {
    const user = userEvent.setup();
    render(
      <Select label="F">
        {null}
      </Select>
    );
    await user.click(screen.getByRole("combobox"));
    expect(await screen.findByText("No options")).toBeInTheDocument();
  });

  // --- Keyboard (listbox open) ---
  it("ArrowDown/Up moves activeIndex via aria-activedescendant", async () => {
    const user = userEvent.setup();
    renderBasic();
    const trigger = screen.getByRole("combobox");
    await user.click(trigger);
    const first = trigger.getAttribute("aria-activedescendant");
    await user.keyboard("{ArrowDown}");
    const second = trigger.getAttribute("aria-activedescendant");
    expect(second).not.toBe(first);
    await user.keyboard("{ArrowUp}");
    const third = trigger.getAttribute("aria-activedescendant");
    expect(third).toBe(first);
  });

  it("Home/End jump", async () => {
    const user = userEvent.setup();
    renderBasic();
    const trigger = screen.getByRole("combobox");
    await user.click(trigger);
    await user.keyboard("{End}");
    const listbox = screen.getByRole("listbox");
    const last = within(listbox).getByText("Cherry").closest("[role=option]")!;
    expect(trigger.getAttribute("aria-activedescendant")).toBe(last.id);
    await user.keyboard("{Home}");
    const first = within(listbox).getByText("Apple").closest("[role=option]")!;
    expect(trigger.getAttribute("aria-activedescendant")).toBe(first.id);
  });

  it("single: Enter on active item selects + closes", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Select label="F" onChange={onChange}>
        <SelectItem value="a">A</SelectItem>
        <SelectItem value="b">B</SelectItem>
      </Select>
    );
    const trigger = screen.getByRole("combobox");
    await user.click(trigger);
    await user.keyboard("{ArrowDown}{Enter}");
    expect(onChange).toHaveBeenCalledWith("b");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("multi: Enter on active item toggles + stays open", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Select label="F" multiple onChange={onChange}>
        <SelectItem value="a">A</SelectItem>
        <SelectItem value="b">B</SelectItem>
      </Select>
    );
    const trigger = screen.getByRole("combobox");
    await user.click(trigger);
    await user.keyboard("{Enter}");
    expect(onChange).toHaveBeenCalledWith(["a"]);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("Space selects as well", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Select label="F" onChange={onChange}>
        <SelectItem value="a">A</SelectItem>
      </Select>
    );
    await user.click(screen.getByRole("combobox"));
    await user.keyboard("{ }");
    expect(onChange).toHaveBeenCalledWith("a");
  });

  it("Escape closes; focus stays on trigger", async () => {
    const user = userEvent.setup();
    renderBasic();
    const trigger = screen.getByRole("combobox");
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    await user.keyboard("{Escape}");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(document.activeElement).toBe(trigger);
  });

  it("Tab closes and advances focus", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Select label="F">
          <SelectItem value="a">A</SelectItem>
        </Select>
        <button>next</button>
      </>
    );
    const trigger = screen.getByRole("combobox");
    const next = screen.getByText("next");
    await user.click(trigger);
    await user.tab();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(document.activeElement).toBe(next);
  });

  it("click outside closes", async () => {
    const user = userEvent.setup();
    render(
      <>
        <div data-testid="outside">outside</div>
        <Select label="F">
          <SelectItem value="a">A</SelectItem>
        </Select>
      </>
    );
    const trigger = screen.getByRole("combobox");
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    await user.click(screen.getByTestId("outside"));
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("typeahead jumps to first item starting with the typed letter", async () => {
    const user = userEvent.setup();
    renderBasic();
    const trigger = screen.getByRole("combobox");
    await user.click(trigger);
    await user.keyboard("c");
    const listbox = screen.getByRole("listbox");
    const cherry = within(listbox)
      .getByText("Cherry")
      .closest("[role=option]")!;
    expect(trigger.getAttribute("aria-activedescendant")).toBe(cherry.id);
  });

  // --- Selection ---
  it("single controlled: selecting emits onChange(value)", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const Wrapper = () => {
      const [v, setV] = useState<string | undefined>(undefined);
      return (
        <Select label="F" value={v} onChange={(next) => { onChange(next); setV(next); }}>
          <SelectItem value="a">A</SelectItem>
          <SelectItem value="b">B</SelectItem>
        </Select>
      );
    };
    render(<Wrapper />);
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByText("B"));
    expect(onChange).toHaveBeenCalledWith("b");
  });

  it("multi controlled: toggling adds/removes from onChange payload", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const Wrapper = () => {
      const [v, setV] = useState<string[]>([]);
      return (
        <Select label="F" multiple value={v} onChange={(next) => { onChange(next); setV(next); }}>
          <SelectItem value="a">A</SelectItem>
          <SelectItem value="b">B</SelectItem>
        </Select>
      );
    };
    render(<Wrapper />);
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByText("A"));
    expect(onChange).toHaveBeenLastCalledWith(["a"]);
    await user.click(screen.getByText("B"));
    expect(onChange).toHaveBeenLastCalledWith(["a", "b"]);
    await user.click(screen.getByText("A"));
    expect(onChange).toHaveBeenLastCalledWith(["b"]);
  });

  it("clearable single: X fires onChange(undefined), onClear, and does NOT close listbox", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onClear = vi.fn();
    render(
      <Select
        label="F"
        clearable
        defaultValue="a"
        onChange={onChange}
        onClear={onClear}
      >
        <SelectItem value="a">A</SelectItem>
      </Select>
    );
    const trigger = screen.getByRole("combobox");
    await user.click(trigger);
    const clearBtn = screen.getByLabelText("Clear selection");
    await user.click(clearBtn);
    expect(onChange).toHaveBeenCalledWith(undefined);
    expect(onClear).toHaveBeenCalled();
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("clearable multi: X fires onChange([]) and stays open", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Select
        label="F"
        multiple
        clearable
        defaultValue={["a", "b"]}
        onChange={onChange}
      >
        <SelectItem value="a">A</SelectItem>
        <SelectItem value="b">B</SelectItem>
      </Select>
    );
    const trigger = screen.getByRole("combobox");
    await user.click(trigger);
    await user.click(screen.getByLabelText("Clear selection"));
    expect(onChange).toHaveBeenCalledWith([]);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("disabled item is not selectable by click or keyboard", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Select label="F" onChange={onChange}>
        <SelectItem value="a" disabled>A</SelectItem>
        <SelectItem value="b">B</SelectItem>
      </Select>
    );
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByText("A"));
    expect(onChange).not.toHaveBeenCalled();
  });

  // --- Groups ---
  it("SelectGroup renders role=group with aria-labelledby", async () => {
    const user = userEvent.setup();
    render(
      <Select label="F">
        <SelectGroup label="Fruit">
          <SelectItem value="a">Apple</SelectItem>
        </SelectGroup>
      </Select>
    );
    await user.click(screen.getByRole("combobox"));
    const groups = await screen.findAllByRole("group");
    expect(groups.length).toBeGreaterThanOrEqual(1);
    const group = groups[0];
    const labelledBy = group.getAttribute("aria-labelledby");
    expect(labelledBy).toBeTruthy();
    expect(document.getElementById(labelledBy!)).toHaveTextContent("Fruit");
  });

  it("keyboard traverses across groups using global indices", async () => {
    const user = userEvent.setup();
    render(
      <Select label="F">
        <SelectGroup label="G1">
          <SelectItem value="a">A</SelectItem>
        </SelectGroup>
        <SelectGroup label="G2">
          <SelectItem value="b">B</SelectItem>
        </SelectGroup>
      </Select>
    );
    const trigger = screen.getByRole("combobox");
    await user.click(trigger);
    await user.keyboard("{ArrowDown}");
    const listbox = screen.getByRole("listbox");
    const b = within(listbox).getByText("B").closest("[role=option]")!;
    expect(trigger.getAttribute("aria-activedescendant")).toBe(b.id);
  });

  // --- Form integration ---
  it("name + single value → one hidden input", () => {
    renderBasic({ name: "fruit", defaultValue: "banana" });
    const hidden = document.querySelectorAll<HTMLInputElement>(
      'input[type="hidden"][name="fruit"]'
    );
    expect(hidden).toHaveLength(1);
    expect(hidden[0].value).toBe("banana");
  });

  it("name + multi values → one hidden input per value", () => {
    render(
      <Select label="F" multiple name="tags" defaultValue={["a", "b"]}>
        <SelectItem value="a">A</SelectItem>
        <SelectItem value="b">B</SelectItem>
      </Select>
    );
    const hidden = document.querySelectorAll<HTMLInputElement>(
      'input[type="hidden"][name="tags"]'
    );
    expect(hidden).toHaveLength(2);
    expect(Array.from(hidden).map((h) => h.value)).toEqual(["a", "b"]);
  });

  it("no name → no hidden inputs", () => {
    renderBasic({ defaultValue: "banana" });
    expect(
      document.querySelectorAll('input[type="hidden"]').length
    ).toBe(0);
  });

  // --- Ref + passthrough ---
  it("ref forwards to the trigger button", () => {
    const ref = createRef<HTMLButtonElement>();
    renderBasic({ ref });
    expect(ref.current?.tagName).toBe("BUTTON");
    expect(ref.current).toHaveAttribute("role", "combobox");
  });

  it("className, triggerClassName, listboxClassName merge on correct nodes", async () => {
    const user = userEvent.setup();
    renderBasic({
      className: "wrap-x",
      triggerClassName: "trg-x",
      listboxClassName: "lb-x",
    });
    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveClass("trg-x");
    const wrapper = trigger.closest(".wrapper")!;
    expect(wrapper).toHaveClass("wrap-x");
    await user.click(trigger);
    expect(screen.getByRole("listbox")).toHaveClass("lb-x");
  });

  // --- Controlled open ---
  it("open prop controls visibility; onOpenChange fires on user intent", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <Select label="F" open={false} onOpenChange={onOpenChange}>
        <SelectItem value="a">A</SelectItem>
      </Select>
    );
    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await user.click(trigger);
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    rerender(
      <Select label="F" open={true} onOpenChange={onOpenChange}>
        <SelectItem value="a">A</SelectItem>
      </Select>
    );
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("defaultOpen={true} opens on mount", async () => {
    render(
      <Select label="F" defaultOpen>
        <SelectItem value="a">A</SelectItem>
      </Select>
    );
    expect(await screen.findByRole("listbox")).toBeInTheDocument();
  });
});
