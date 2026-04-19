import { describe, it, expect, vi } from "vitest";
import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { IconFile } from "@natum/icons";
import { Sidebar } from "./Sidebar";
import { SidebarBody } from "./SidebarBody";
import { SidebarItem } from "./SidebarItem";

describe("SidebarItem base", () => {
  it("renders as <a> by default and wraps the item in <li>", () => {
    render(
      <Sidebar>
        <SidebarBody>
          <SidebarItem icon={IconFile} href="/files">Files</SidebarItem>
        </SidebarBody>
      </Sidebar>
    );
    const link = screen.getByRole("link", { name: "Files" });
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "/files");
    expect(link.parentElement?.tagName).toBe("LI");
  });

  it("renders as <button> when as=\"button\"", () => {
    render(
      <Sidebar>
        <SidebarBody>
          <SidebarItem as="button" icon={IconFile}>Action</SidebarItem>
        </SidebarBody>
      </Sidebar>
    );
    expect(screen.getByRole("button", { name: "Action" }).tagName).toBe("BUTTON");
  });

  it("renders as a custom component via as={Component}", () => {
    type LinkStubProps = { to: string; children?: React.ReactNode; className?: string };
    const LinkStub = ({ to, children, className }: LinkStubProps) => (
      <a href={to} className={className}>{children}</a>
    );
    render(
      <Sidebar>
        <SidebarBody>
          <SidebarItem as={LinkStub} to="/files" icon={IconFile}>Files</SidebarItem>
        </SidebarBody>
      </Sidebar>
    );
    expect(screen.getByRole("link", { name: "Files" })).toHaveAttribute("href", "/files");
  });

  it("renders the icon with size=20", () => {
    render(
      <Sidebar>
        <SidebarBody>
          <SidebarItem icon={IconFile} href="/">Home</SidebarItem>
        </SidebarBody>
      </Sidebar>
    );
    const svg = screen.getByRole("link").querySelector("svg");
    expect(svg).toHaveAttribute("width", "20");
    expect(svg).toHaveAttribute("height", "20");
  });

  it("forwards ref to underlying element", () => {
    const ref = createRef<HTMLElement>();
    render(
      <Sidebar>
        <SidebarBody>
          <SidebarItem ref={ref} icon={IconFile} href="/">Home</SidebarItem>
        </SidebarBody>
      </Sidebar>
    );
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe("A");
  });

  it("passes className through", () => {
    render(
      <Sidebar>
        <SidebarBody>
          <SidebarItem icon={IconFile} href="/" className="custom">X</SidebarItem>
        </SidebarBody>
      </Sidebar>
    );
    expect(screen.getByRole("link")).toHaveClass("custom");
  });

  it("fires onClick on plain interaction", async () => {
    const onClick = vi.fn();
    const user = (await import("@testing-library/user-event")).default.setup();
    render(
      <Sidebar>
        <SidebarBody>
          <SidebarItem as="button" icon={IconFile} onClick={onClick}>Go</SidebarItem>
        </SidebarBody>
      </Sidebar>
    );
    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("throws when used outside Sidebar", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<SidebarItem icon={IconFile}>X</SidebarItem>)).toThrow(
      "useSidebarCollapsed must be used within <Sidebar>."
    );
    spy.mockRestore();
  });
});

describe("SidebarItem active state", () => {
  it("sets aria-current=page when active", () => {
    render(
      <Sidebar>
        <SidebarBody>
          <SidebarItem icon={IconFile} href="/" active>Home</SidebarItem>
        </SidebarBody>
      </Sidebar>
    );
    expect(screen.getByRole("link")).toHaveAttribute("aria-current", "page");
  });

  it("does NOT set aria-current when not active", () => {
    render(
      <Sidebar>
        <SidebarBody>
          <SidebarItem icon={IconFile} href="/">Home</SidebarItem>
        </SidebarBody>
      </Sidebar>
    );
    expect(screen.getByRole("link")).not.toHaveAttribute("aria-current");
  });

  it("applies the active CSS class when active", () => {
    const { container } = render(
      <Sidebar>
        <SidebarBody>
          <SidebarItem icon={IconFile} href="/" active>Home</SidebarItem>
        </SidebarBody>
      </Sidebar>
    );
    const link = container.querySelector("a");
    expect(link?.className).toMatch(/active/);
  });

  it("renders with dir=rtl without throwing (RTL smoke)", () => {
    render(
      <div dir="rtl">
        <Sidebar>
          <SidebarBody>
            <SidebarItem icon={IconFile} href="/" active>Home</SidebarItem>
          </SidebarBody>
        </Sidebar>
      </div>
    );
    expect(screen.getByRole("link")).toHaveAttribute("aria-current", "page");
  });
});
