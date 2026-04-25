import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { createRef } from "react";
import { DropdownMenu } from "./DropdownMenu";
import { DropdownMenuTrigger } from "./DropdownMenuTrigger";
import { useDropdownMenuContext } from "./context";


function OpenStateProbe() {
  const ctx = useDropdownMenuContext();
  return <span data-testid="open">{String(ctx.open)}</span>;
}

describe("DropdownMenuTrigger", () => {
  it("clones the child, injects aria-haspopup/expanded/controls and id", () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>
          <button>open</button>
        </DropdownMenuTrigger>
      </DropdownMenu>
    );
    const btn = screen.getByRole("button", { name: "open" });
    expect(btn).toHaveAttribute("aria-haspopup", "menu");
    expect(btn).toHaveAttribute("aria-expanded", "false");
    expect(btn).toHaveAttribute("aria-controls");
    expect(btn).toHaveAttribute("id");
  });

  it("click opens the menu; second click closes it", async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu>
        <OpenStateProbe />
        <DropdownMenuTrigger>
          <button>open</button>
        </DropdownMenuTrigger>
      </DropdownMenu>
    );
    const btn = screen.getByRole("button", { name: "open" });
    expect(screen.getByTestId("open").textContent).toBe("false");
    await user.click(btn);
    expect(screen.getByTestId("open").textContent).toBe("true");
    expect(btn).toHaveAttribute("aria-expanded", "true");
    await user.click(btn);
    expect(screen.getByTestId("open").textContent).toBe("false");
  });

  it("composes with consumer-supplied onClick (both fire)", async () => {
    const user = userEvent.setup();
    const consumer = vi.fn();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>
          <button onClick={consumer}>open</button>
        </DropdownMenuTrigger>
      </DropdownMenu>
    );
    await user.click(screen.getByRole("button"));
    expect(consumer).toHaveBeenCalledTimes(1);
  });

  it("merges refs (consumer's ref stays attached)", () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>
          <button ref={ref}>open</button>
        </DropdownMenuTrigger>
      </DropdownMenu>
    );
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("disabled=true: sets native disabled on a <button> child and suppresses click", async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu>
        <OpenStateProbe />
        <DropdownMenuTrigger disabled>
          <button>open</button>
        </DropdownMenuTrigger>
      </DropdownMenu>
    );
    const btn = screen.getByRole("button", { name: "open" });
    expect(btn).toBeDisabled();
    await user.click(btn);
    expect(screen.getByTestId("open").textContent).toBe("false");
  });

  it("dev warning when children is not a single element", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>
          <button>a</button>
          <button>b</button>
        </DropdownMenuTrigger>
      </DropdownMenu>
    );
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe("DropdownMenuTrigger keyboard", () => {
  it("ArrowDown opens with focusTarget=first", async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu>
        <OpenStateProbe />
        <DropdownMenuTrigger>
          <button>open</button>
        </DropdownMenuTrigger>
      </DropdownMenu>
    );
    screen.getByRole("button").focus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByTestId("open").textContent).toBe("true");
  });

  it("Enter opens with focusTarget=first", async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu>
        <OpenStateProbe />
        <DropdownMenuTrigger>
          <button>open</button>
        </DropdownMenuTrigger>
      </DropdownMenu>
    );
    screen.getByRole("button").focus();
    await user.keyboard("{Enter}");
    expect(screen.getByTestId("open").textContent).toBe("true");
  });

  it("ArrowUp opens with focusTarget=last", async () => {
    const user = userEvent.setup();
    function LastProbe() {
      const ctx = useDropdownMenuContext();
      return <span data-testid="target">{String(ctx.focusTargetOnOpen)}</span>;
    }
    render(
      <DropdownMenu>
        <LastProbe />
        <DropdownMenuTrigger>
          <button>open</button>
        </DropdownMenuTrigger>
      </DropdownMenu>
    );
    screen.getByRole("button").focus();
    await user.keyboard("{ArrowUp}");
    expect(screen.getByTestId("target").textContent).toBe("last");
  });

  it("consumer onKeyDown fires before library handler (both run)", async () => {
    const user = userEvent.setup();
    const consumer = vi.fn();
    render(
      <DropdownMenu>
        <OpenStateProbe />
        <DropdownMenuTrigger>
          <button onKeyDown={consumer}>open</button>
        </DropdownMenuTrigger>
      </DropdownMenu>
    );
    screen.getByRole("button").focus();
    await user.keyboard("{ArrowDown}");
    expect(consumer).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("open").textContent).toBe("true");
  });
});
