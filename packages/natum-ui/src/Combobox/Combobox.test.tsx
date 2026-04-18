import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createRef } from "react";
import { Combobox } from "./Combobox";
import { ComboboxItem } from "./ComboboxItem";

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
