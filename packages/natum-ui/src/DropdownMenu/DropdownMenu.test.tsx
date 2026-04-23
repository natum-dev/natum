import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useDropdownMenuContext } from "./context";

describe("DropdownMenu context", () => {
  it("useDropdownMenuContext throws when used outside <DropdownMenu>", () => {
    const Child = () => {
      useDropdownMenuContext();
      return null;
    };

    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Child />)).toThrow(
      "useDropdownMenuContext must be used within <DropdownMenu>."
    );
    spy.mockRestore();
  });
});

import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DropdownMenu } from "./DropdownMenu";

function Probe() {
  const ctx = useDropdownMenuContext();
  return (
    <>
      <span data-testid="open">{String(ctx.open)}</span>
      <button onClick={() => ctx.setOpen(!ctx.open)}>toggle</button>
      <span data-testid="modal">{String(ctx.modal)}</span>
      <span data-testid="trigger-id">{ctx.triggerId}</span>
      <span data-testid="content-id">{ctx.contentId}</span>
    </>
  );
}

describe("DropdownMenu root", () => {
  it("renders no wrapping DOM (Fragment-only)", () => {
    const { container } = render(
      <DropdownMenu>
        <span data-testid="c">child</span>
      </DropdownMenu>
    );
    expect(container.firstChild).toBe(screen.getByTestId("c"));
  });

  it("provides default open=false", () => {
    render(
      <DropdownMenu>
        <Probe />
      </DropdownMenu>
    );
    expect(screen.getByTestId("open").textContent).toBe("false");
  });

  it("uncontrolled: defaultOpen sets initial + setOpen toggles", async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu defaultOpen>
        <Probe />
      </DropdownMenu>
    );
    expect(screen.getByTestId("open").textContent).toBe("true");
    await user.click(screen.getByRole("button", { name: "toggle" }));
    expect(screen.getByTestId("open").textContent).toBe("false");
  });

  it("controlled: value wins, setOpen calls onOpenChange", async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(
      <DropdownMenu open={false} onOpenChange={onOpenChange}>
        <Probe />
      </DropdownMenu>
    );
    expect(screen.getByTestId("open").textContent).toBe("false");
    await user.click(screen.getByRole("button", { name: "toggle" }));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    // Still false because parent never flipped the prop.
    expect(screen.getByTestId("open").textContent).toBe("false");
  });

  it("modal defaults to true; triggerId + contentId are stable strings", () => {
    render(
      <DropdownMenu>
        <Probe />
      </DropdownMenu>
    );
    expect(screen.getByTestId("modal").textContent).toBe("true");
    expect(screen.getByTestId("trigger-id").textContent).toMatch(/.+/);
    expect(screen.getByTestId("content-id").textContent).toMatch(/.+/);
    expect(screen.getByTestId("trigger-id").textContent).not.toBe(
      screen.getByTestId("content-id").textContent
    );
  });

  it("modal={false} propagates through context", () => {
    render(
      <DropdownMenu modal={false}>
        <Probe />
      </DropdownMenu>
    );
    expect(screen.getByTestId("modal").textContent).toBe("false");
  });
});
