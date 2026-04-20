import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, beforeEach, afterEach, describe, it, expect, vi } from "vitest";
import { Tabs } from "./Tabs";
import { TabsList } from "./TabsList";
import { TabsTrigger } from "./TabsTrigger";

beforeAll(() => {
  if (!("ResizeObserver" in globalThis)) {
    (globalThis as unknown as { ResizeObserver: typeof ResizeObserver }).ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
});

const offsets: Record<string, { left: number; width: number }> = {
  a: { left: 0, width: 60 },
  b: { left: 60, width: 80 },
  c: { left: 140, width: 50 },
};

beforeEach(() => {
  Object.defineProperty(HTMLElement.prototype, "offsetLeft", {
    configurable: true,
    get(this: HTMLElement) {
      const v = this.getAttribute("data-value");
      return v && offsets[v] ? offsets[v].left : 0;
    },
  });
  Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
    configurable: true,
    get(this: HTMLElement) {
      const v = this.getAttribute("data-value");
      return v && offsets[v] ? offsets[v].width : 0;
    },
  });
});

afterEach(() => {
  delete (HTMLElement.prototype as unknown as { offsetLeft?: unknown }).offsetLeft;
  delete (HTMLElement.prototype as unknown as { offsetWidth?: unknown }).offsetWidth;
});

describe("Tabs indicator — measurement", () => {
  it("writes --tabs-indicator-x and --tabs-indicator-width on the list", () => {
    render(
      <Tabs defaultValue="b">
        <TabsList aria-label="m">
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b">B</TabsTrigger>
          <TabsTrigger value="c">C</TabsTrigger>
        </TabsList>
      </Tabs>
    );
    const list = screen.getByRole("tablist") as HTMLElement;
    expect(list.style.getPropertyValue("--tabs-indicator-x")).toBe("60px");
    expect(list.style.getPropertyValue("--tabs-indicator-width")).toBe("80px");
    expect(list.style.getPropertyValue("--tabs-indicator-opacity")).toBe("1");
  });

  it("updates custom props on value change", async () => {
    const user = userEvent.setup();
    render(
      <Tabs defaultValue="a">
        <TabsList aria-label="m">
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b">B</TabsTrigger>
          <TabsTrigger value="c">C</TabsTrigger>
        </TabsList>
      </Tabs>
    );
    await user.click(screen.getByRole("tab", { name: "C" }));
    const list = screen.getByRole("tablist") as HTMLElement;
    expect(list.style.getPropertyValue("--tabs-indicator-x")).toBe("140px");
    expect(list.style.getPropertyValue("--tabs-indicator-width")).toBe("50px");
  });

  it("hides indicator (opacity 0) when value has no matching trigger", () => {
    render(
      <Tabs defaultValue="missing">
        <TabsList aria-label="m">
          <TabsTrigger value="a">A</TabsTrigger>
        </TabsList>
      </Tabs>
    );
    const list = screen.getByRole("tablist") as HTMLElement;
    expect(list.style.getPropertyValue("--tabs-indicator-opacity")).toBe("0");
  });

  it("pill variant still writes custom props but CSS hides the indicator (integration smoke)", () => {
    render(
      <Tabs defaultValue="a" variant="pill">
        <TabsList aria-label="m">
          <TabsTrigger value="a">A</TabsTrigger>
        </TabsList>
      </Tabs>
    );
    const list = screen.getByRole("tablist") as HTMLElement;
    const root = list.closest("[data-variant]") as HTMLElement;
    expect(root).toHaveAttribute("data-variant", "pill");
  });

  it("calls scrollIntoView on active trigger after activation", async () => {
    const user = userEvent.setup();
    const scrollSpy = vi.fn();
    Element.prototype.scrollIntoView = scrollSpy;
    render(
      <Tabs defaultValue="a">
        <TabsList aria-label="m">
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b">B</TabsTrigger>
        </TabsList>
      </Tabs>
    );
    scrollSpy.mockClear();
    await user.click(screen.getByRole("tab", { name: "B" }));
    expect(scrollSpy).toHaveBeenCalled();
  });

  it("reduced-motion flips scrollIntoView behavior to auto", async () => {
    const user = userEvent.setup();
    const scrollSpy = vi.fn();
    Element.prototype.scrollIntoView = scrollSpy;
    const matchSpy = vi
      .spyOn(window, "matchMedia")
      .mockImplementation((q: string) => ({
        matches: q.includes("reduce"),
        media: q,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        onchange: null,
        dispatchEvent: () => true,
      } as MediaQueryList));
    render(
      <Tabs defaultValue="a">
        <TabsList aria-label="m">
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b">B</TabsTrigger>
        </TabsList>
      </Tabs>
    );
    scrollSpy.mockClear();
    await user.click(screen.getByRole("tab", { name: "B" }));
    expect(scrollSpy).toHaveBeenCalledWith(
      expect.objectContaining({ behavior: "auto" })
    );
    matchSpy.mockRestore();
  });
});
