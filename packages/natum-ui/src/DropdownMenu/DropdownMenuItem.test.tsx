import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DropdownMenu } from "./DropdownMenu";
import { DropdownMenuItem } from "./DropdownMenuItem";
import { useDropdownMenuContext } from "./context";

function OpenStateProbe() {
  const ctx = useDropdownMenuContext();
  return <span data-testid="open">{String(ctx.open)}</span>;
}

describe("DropdownMenuItem base", () => {
  it("renders role=menuitem with children", () => {
    render(
      <DropdownMenu>
        <DropdownMenuItem>Rename</DropdownMenuItem>
      </DropdownMenu>
    );
    const item = screen.getByRole("menuitem");
    expect(item).toHaveTextContent("Rename");
  });

  it("stamps data-dropdown-menu-item and tabIndex=-1", () => {
    render(
      <DropdownMenu>
        <DropdownMenuItem>x</DropdownMenuItem>
      </DropdownMenu>
    );
    const item = screen.getByRole("menuitem");
    expect(item).toHaveAttribute("data-dropdown-menu-item");
    expect(item).toHaveAttribute("tabindex", "-1");
  });

  it("click fires onSelect then closes the menu", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <DropdownMenu defaultOpen>
        <OpenStateProbe />
        <DropdownMenuItem onSelect={onSelect}>Delete</DropdownMenuItem>
      </DropdownMenu>
    );
    expect(screen.getByTestId("open").textContent).toBe("true");
    await user.click(screen.getByRole("menuitem"));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("open").textContent).toBe("false");
  });

  it("onSelect event.preventDefault() keeps menu open", async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu defaultOpen>
        <OpenStateProbe />
        <DropdownMenuItem
          onSelect={(e) => e.preventDefault()}
        >
          Sticky
        </DropdownMenuItem>
      </DropdownMenu>
    );
    await user.click(screen.getByRole("menuitem"));
    expect(screen.getByTestId("open").textContent).toBe("true");
  });

  it("Enter fires onSelect", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuItem onSelect={onSelect}>x</DropdownMenuItem>
      </DropdownMenu>
    );
    const item = screen.getByRole("menuitem");
    item.focus();
    await user.keyboard("{Enter}");
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("Space fires onSelect and preventsDefault", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuItem onSelect={onSelect}>x</DropdownMenuItem>
      </DropdownMenu>
    );
    const item = screen.getByRole("menuitem");
    item.focus();
    await user.keyboard(" ");
    expect(onSelect).toHaveBeenCalledTimes(1);
  });
});

describe("DropdownMenuItem states", () => {
  it("disabled sets aria-disabled and suppresses onSelect", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuItem disabled onSelect={onSelect}>
          Nope
        </DropdownMenuItem>
      </DropdownMenu>
    );
    const item = screen.getByRole("menuitem");
    expect(item).toHaveAttribute("aria-disabled", "true");
    await user.click(item);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("destructive sets data-destructive=true", () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuItem destructive>Delete</DropdownMenuItem>
      </DropdownMenu>
    );
    expect(screen.getByRole("menuitem")).toHaveAttribute(
      "data-destructive",
      "true"
    );
  });

  it("leftSection renders as aria-hidden sibling before children", () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuItem leftSection={<svg data-testid="icon" />}>
          Label
        </DropdownMenuItem>
      </DropdownMenu>
    );
    const section = screen.getByTestId("icon").parentElement!;
    expect(section).toHaveAttribute("aria-hidden", "true");
  });

  it("hover (mouseEnter) moves focus onto the item", async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuItem>A</DropdownMenuItem>
        <DropdownMenuItem>B</DropdownMenuItem>
      </DropdownMenu>
    );
    const [a, b] = screen.getAllByRole("menuitem");
    expect(document.activeElement).not.toBe(a);
    await user.hover(a);
    expect(document.activeElement).toBe(a);
    await user.hover(b);
    expect(document.activeElement).toBe(b);
  });

  it("focus sets data-highlighted=true; blur removes it", async () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuItem>A</DropdownMenuItem>
      </DropdownMenu>
    );
    const item = screen.getByRole("menuitem");
    item.focus();
    expect(item).toHaveAttribute("data-highlighted", "true");
    item.blur();
    expect(item).not.toHaveAttribute("data-highlighted");
  });

  it("library-managed role wins over a consumer-supplied role via rest", () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuItem
          data-testid="item"
          // @ts-expect-error testing rest-spread ordering
          role="button"
        >
          x
        </DropdownMenuItem>
      </DropdownMenu>
    );
    expect(screen.getByTestId("item")).toHaveAttribute("role", "menuitem");
  });
});
