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

describe("SidebarItem disabled state", () => {
  it("disabled anchor: strips href + sets aria-disabled + suppresses onClick", async () => {
    const onClick = vi.fn();
    const user = (await import("@testing-library/user-event")).default.setup();
    render(
      <Sidebar>
        <SidebarBody>
          <SidebarItem icon={IconFile} href="/files" disabled onClick={onClick}>
            Files
          </SidebarItem>
        </SidebarBody>
      </Sidebar>
    );
    const link = screen.getByText("Files").closest("a")!;
    expect(link).not.toHaveAttribute("href");
    expect(link).toHaveAttribute("aria-disabled", "true");
    await user.click(link);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("disabled button: sets native disabled + aria-disabled + suppresses onClick", async () => {
    const onClick = vi.fn();
    const user = (await import("@testing-library/user-event")).default.setup();
    render(
      <Sidebar>
        <SidebarBody>
          <SidebarItem as="button" icon={IconFile} disabled onClick={onClick}>
            Go
          </SidebarItem>
        </SidebarBody>
      </Sidebar>
    );
    const btn = screen.getByRole("button", { name: "Go" });
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute("aria-disabled", "true");
    await user.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("disabled custom component: sets aria-disabled only + suppresses onClick", async () => {
    const onClick = vi.fn();
    const user = (await import("@testing-library/user-event")).default.setup();
    type LinkStubProps = { to: string; children?: React.ReactNode; className?: string; onClick?: React.MouseEventHandler };
    const LinkStub = ({ to, children, className, onClick: cb, ...r }: LinkStubProps) => (
      <a href={to} className={className} onClick={cb} {...r}>{children}</a>
    );
    render(
      <Sidebar>
        <SidebarBody>
          <SidebarItem as={LinkStub} to="/x" icon={IconFile} disabled onClick={onClick}>
            X
          </SidebarItem>
        </SidebarBody>
      </Sidebar>
    );
    const link = screen.getByText("X").closest("a")!;
    expect(link).toHaveAttribute("aria-disabled", "true");
    await user.click(link);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("applies disabled CSS class", () => {
    const { container } = render(
      <Sidebar>
        <SidebarBody>
          <SidebarItem icon={IconFile} href="/" disabled>X</SidebarItem>
        </SidebarBody>
      </Sidebar>
    );
    expect(container.querySelector("a")?.className).toMatch(/disabled/);
  });
});

describe("SidebarItem rightSection", () => {
  it("renders rightSection when expanded", () => {
    render(
      <Sidebar>
        <SidebarBody>
          <SidebarItem icon={IconFile} href="/" rightSection={<span>12</span>}>
            Files
          </SidebarItem>
        </SidebarBody>
      </Sidebar>
    );
    expect(screen.getByText("12")).toBeInTheDocument();
  });

  it("omits rightSection wrapper when prop not passed", () => {
    const { container } = render(
      <Sidebar>
        <SidebarBody>
          <SidebarItem icon={IconFile} href="/">Files</SidebarItem>
        </SidebarBody>
      </Sidebar>
    );
    expect(container.querySelector(".right_section, [class*='right_section']")).toBeNull();
  });

  it("rightSection element is always present in DOM when passed (CSS hides it in collapsed mode, not JS)", () => {
    render(
      <Sidebar defaultCollapsed>
        <SidebarBody>
          <SidebarItem icon={IconFile} href="/" rightSection={<span data-testid="rs">12</span>}>
            Files
          </SidebarItem>
        </SidebarBody>
      </Sidebar>
    );
    // DOM stays; CSS handles visibility via `.sidebar[data-collapsed="true"] .right_section { display: none }`
    expect(screen.getByTestId("rs")).toBeInTheDocument();
  });
});

describe("SidebarItem tooltip on collapsed", () => {
  it("does NOT wrap in Tooltip when expanded", () => {
    const { container } = render(
      <Sidebar>
        <SidebarBody>
          <SidebarItem icon={IconFile} href="/">Files</SidebarItem>
        </SidebarBody>
      </Sidebar>
    );
    // Tooltip injects an element with aria-describedby linkage;
    // when absent, the link has no aria-describedby from tooltip
    const link = container.querySelector("a")!;
    expect(link).not.toHaveAttribute("aria-describedby");
  });

  it("sets aria-label to string children when collapsed", () => {
    render(
      <Sidebar defaultCollapsed>
        <SidebarBody>
          <SidebarItem icon={IconFile} href="/">Files</SidebarItem>
        </SidebarBody>
      </Sidebar>
    );
    expect(screen.getByRole("link")).toHaveAttribute("aria-label", "Files");
  });

  it("prefers explicit label prop over children for aria-label in collapsed mode", () => {
    render(
      <Sidebar defaultCollapsed>
        <SidebarBody>
          <SidebarItem icon={IconFile} href="/" label="Files section">
            <strong>Files</strong>
          </SidebarItem>
        </SidebarBody>
      </Sidebar>
    );
    expect(screen.getByRole("link")).toHaveAttribute("aria-label", "Files section");
  });

  it("consumer-supplied aria-label wins over auto-derived", () => {
    render(
      <Sidebar defaultCollapsed>
        <SidebarBody>
          <SidebarItem icon={IconFile} href="/" aria-label="Consumer choice">
            Files
          </SidebarItem>
        </SidebarBody>
      </Sidebar>
    );
    expect(screen.getByRole("link")).toHaveAttribute("aria-label", "Consumer choice");
  });

  it("logs a dev warning and omits aria-label when collapsed with non-string children and no label prop", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <Sidebar defaultCollapsed>
        <SidebarBody>
          <SidebarItem icon={IconFile} href="/">
            <strong>Files</strong>
          </SidebarItem>
        </SidebarBody>
      </Sidebar>
    );
    expect(screen.getByRole("link")).not.toHaveAttribute("aria-label");
    expect(spy).toHaveBeenCalledWith(
      "SidebarItem: collapsed mode needs a string `children` or a `label` prop to announce the item."
    );
    spy.mockRestore();
  });
});
