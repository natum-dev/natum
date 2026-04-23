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
