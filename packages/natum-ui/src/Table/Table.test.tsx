import { describe, it, expect } from "vitest";
import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { Table } from "./Table";
import { TableHeaderCell } from "./TableHeaderCell";

describe("Table root", () => {
  it("renders a wrapper <div> containing a <table>", () => {
    render(<Table data-testid="t"><tbody><tr><td>x</td></tr></tbody></Table>);
    const table = screen.getByTestId("t");
    expect(table.tagName).toBe("TABLE");
    expect(table.parentElement?.tagName).toBe("DIV");
  });

  it("defaults to size=md, striped=true, borders=false, stickyHeader=false", () => {
    render(<Table data-testid="t"><tbody><tr><td>x</td></tr></tbody></Table>);
    const table = screen.getByTestId("t");
    expect(table).toHaveAttribute("data-size", "md");
    expect(table).toHaveAttribute("data-striped", "true");
    expect(table).toHaveAttribute("data-row-borders", "false");
    expect(table).toHaveAttribute("data-sticky-header", "false");
  });

  it("reflects size / striped / withRowBorders / stickyHeader via data-attrs", () => {
    render(
      <Table data-testid="t" size="lg" striped={false} withRowBorders stickyHeader>
        <tbody><tr><td>x</td></tr></tbody>
      </Table>
    );
    const table = screen.getByTestId("t");
    expect(table).toHaveAttribute("data-size", "lg");
    expect(table).toHaveAttribute("data-striped", "false");
    expect(table).toHaveAttribute("data-row-borders", "true");
    expect(table).toHaveAttribute("data-sticky-header", "true");
  });

  it("className goes on <table>, wrapperClassName goes on wrapping <div>", () => {
    render(
      <Table data-testid="t" className="tbl-custom" wrapperClassName="wrap-custom">
        <tbody><tr><td>x</td></tr></tbody>
      </Table>
    );
    const table = screen.getByTestId("t");
    expect(table).toHaveClass("tbl-custom");
    expect(table.parentElement).toHaveClass("wrap-custom");
  });

  it("forwardRef targets the inner <table>", () => {
    const ref = createRef<HTMLTableElement>();
    render(
      <Table ref={ref}><tbody><tr><td>x</td></tr></tbody></Table>
    );
    expect(ref.current?.tagName).toBe("TABLE");
  });

  it("spreads aria-label onto <table>", () => {
    render(
      <Table aria-label="File list" data-testid="t">
        <tbody><tr><td>x</td></tr></tbody>
      </Table>
    );
    expect(screen.getByTestId("t")).toHaveAttribute("aria-label", "File list");
  });
});

describe("TableHeaderCell (no sort)", () => {
  it("renders as <th scope='col'>", () => {
    render(
      <Table>
        <thead><tr><TableHeaderCell data-testid="h">Name</TableHeaderCell></tr></thead>
        <tbody><tr><td>x</td></tr></tbody>
      </Table>
    );
    const th = screen.getByTestId("h");
    expect(th.tagName).toBe("TH");
    expect(th).toHaveAttribute("scope", "col");
  });

  it("renders children as plain text (no button when sortKey absent)", () => {
    render(
      <Table>
        <thead><tr><TableHeaderCell data-testid="h">Name</TableHeaderCell></tr></thead>
        <tbody><tr><td>x</td></tr></tbody>
      </Table>
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByTestId("h")).toHaveTextContent("Name");
  });

  it("align='end' applies text-align: end", () => {
    render(
      <Table>
        <thead><tr><TableHeaderCell data-testid="h" align="end">Size</TableHeaderCell></tr></thead>
        <tbody><tr><td>x</td></tr></tbody>
      </Table>
    );
    expect(screen.getByTestId("h")).toHaveStyle({ textAlign: "end" });
  });
});
