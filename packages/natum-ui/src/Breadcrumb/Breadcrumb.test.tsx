import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { createRef } from "react";
import { Breadcrumb, BreadcrumbItem } from "./Breadcrumb";

describe("Breadcrumb", () => {
  it("renders without crashing", () => {
    render(
      <Breadcrumb>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem>Current</BreadcrumbItem>
      </Breadcrumb>
    );
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  it("renders nav with aria-label", () => {
    render(
      <Breadcrumb>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
      </Breadcrumb>
    );
    expect(screen.getByRole("navigation")).toHaveAttribute("aria-label", "Breadcrumb");
  });

  it("renders an ordered list", () => {
    render(
      <Breadcrumb>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem>Current</BreadcrumbItem>
      </Breadcrumb>
    );
    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("renders links for items with href", () => {
    render(
      <Breadcrumb>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/docs">Docs</BreadcrumbItem>
        <BreadcrumbItem>Current</BreadcrumbItem>
      </Breadcrumb>
    );
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Docs" })).toHaveAttribute("href", "/docs");
  });

  it("renders last item as text without link", () => {
    render(
      <Breadcrumb>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem>Current</BreadcrumbItem>
      </Breadcrumb>
    );
    expect(screen.queryByRole("link", { name: "Current" })).not.toBeInTheDocument();
    expect(screen.getByText("Current")).toBeInTheDocument();
  });

  it("sets aria-current on last item", () => {
    render(
      <Breadcrumb>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem>Current</BreadcrumbItem>
      </Breadcrumb>
    );
    expect(screen.getByText("Current")).toHaveAttribute("aria-current", "page");
  });

  it("calls onClick on item click", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <Breadcrumb>
        <BreadcrumbItem href="/" onClick={handleClick}>Home</BreadcrumbItem>
        <BreadcrumbItem>Current</BreadcrumbItem>
      </Breadcrumb>
    );
    await user.click(screen.getByRole("link", { name: "Home" }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("renders default chevron separator", () => {
    const { container } = render(
      <Breadcrumb>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem>Current</BreadcrumbItem>
      </Breadcrumb>
    );
    const separators = container.querySelectorAll("[aria-hidden='true']");
    expect(separators.length).toBeGreaterThanOrEqual(1);
  });

  it("renders custom separator", () => {
    render(
      <Breadcrumb separator="/">
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem>Current</BreadcrumbItem>
      </Breadcrumb>
    );
    expect(screen.getByText("/")).toBeInTheDocument();
  });

  it("hides separator from screen readers", () => {
    const { container } = render(
      <Breadcrumb separator="/">
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem>Current</BreadcrumbItem>
      </Breadcrumb>
    );
    const separator = container.querySelector("[aria-hidden='true']");
    expect(separator).toBeInTheDocument();
  });

  it("shows all items when count is within maxVisible", () => {
    render(
      <Breadcrumb maxVisible={4}>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/a">A</BreadcrumbItem>
        <BreadcrumbItem>B</BreadcrumbItem>
      </Breadcrumb>
    );
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
  });

  it("collapses middle items when count exceeds maxVisible", () => {
    render(
      <Breadcrumb maxVisible={4}>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/a">A</BreadcrumbItem>
        <BreadcrumbItem href="/b">B</BreadcrumbItem>
        <BreadcrumbItem href="/c">C</BreadcrumbItem>
        <BreadcrumbItem href="/d">D</BreadcrumbItem>
        <BreadcrumbItem>E</BreadcrumbItem>
      </Breadcrumb>
    );
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("D")).toBeInTheDocument();
    expect(screen.getByText("E")).toBeInTheDocument();
    expect(screen.queryByText("A")).not.toBeInTheDocument();
    expect(screen.queryByText("B")).not.toBeInTheDocument();
    expect(screen.queryByText("C")).not.toBeInTheDocument();
  });

  it("renders ellipsis button with correct aria-label", () => {
    render(
      <Breadcrumb maxVisible={4}>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/a">A</BreadcrumbItem>
        <BreadcrumbItem href="/b">B</BreadcrumbItem>
        <BreadcrumbItem href="/c">C</BreadcrumbItem>
        <BreadcrumbItem>D</BreadcrumbItem>
      </Breadcrumb>
    );
    expect(screen.getByLabelText("Show hidden breadcrumbs")).toBeInTheDocument();
  });

  it("opens dropdown with hidden items when ellipsis is clicked", async () => {
    const user = userEvent.setup();
    render(
      <Breadcrumb maxVisible={4}>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/a">A</BreadcrumbItem>
        <BreadcrumbItem href="/b">B</BreadcrumbItem>
        <BreadcrumbItem href="/c">C</BreadcrumbItem>
        <BreadcrumbItem href="/d">D</BreadcrumbItem>
        <BreadcrumbItem>E</BreadcrumbItem>
      </Breadcrumb>
    );
    await user.click(screen.getByLabelText("Show hidden breadcrumbs"));
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
    expect(screen.getByText("C")).toBeInTheDocument();
  });

  it("closes dropdown on Escape", async () => {
    const user = userEvent.setup();
    render(
      <Breadcrumb maxVisible={4}>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/a">A</BreadcrumbItem>
        <BreadcrumbItem href="/b">B</BreadcrumbItem>
        <BreadcrumbItem href="/c">C</BreadcrumbItem>
        <BreadcrumbItem>D</BreadcrumbItem>
      </Breadcrumb>
    );
    await user.click(screen.getByLabelText("Show hidden breadcrumbs"));
    expect(screen.getByText("A")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByText("A")).not.toBeInTheDocument();
  });

  it("forwards ref to nav element", () => {
    const ref = createRef<HTMLElement>();
    render(
      <Breadcrumb ref={ref}>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
      </Breadcrumb>
    );
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current?.tagName).toBe("NAV");
  });

  it("merges custom className", () => {
    const { container } = render(
      <Breadcrumb className="custom">
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
      </Breadcrumb>
    );
    expect(container.firstChild).toHaveClass("custom");
  });
});
