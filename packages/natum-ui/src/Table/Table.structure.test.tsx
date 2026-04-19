import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Table } from "./Table";
import { TableHead } from "./TableHead";
import { TableBody } from "./TableBody";
import { TableFoot } from "./TableFoot";
import { TableCaption } from "./TableCaption";

describe("Table structure — slots", () => {
  it("TableHead renders <thead> inside <table>", () => {
    render(
      <Table>
        <TableHead data-testid="h"><tr><th>A</th></tr></TableHead>
        <tbody><tr><td>x</td></tr></tbody>
      </Table>
    );
    expect(screen.getByTestId("h").tagName).toBe("THEAD");
  });

  it("TableBody renders <tbody>", () => {
    render(
      <Table>
        <TableBody data-testid="b"><tr><td>x</td></tr></TableBody>
      </Table>
    );
    expect(screen.getByTestId("b").tagName).toBe("TBODY");
  });

  it("TableFoot renders <tfoot>", () => {
    render(
      <Table>
        <tbody><tr><td>x</td></tr></tbody>
        <TableFoot data-testid="f"><tr><td>y</td></tr></TableFoot>
      </Table>
    );
    expect(screen.getByTestId("f").tagName).toBe("TFOOT");
  });

  it("TableCaption renders <caption> above the <thead> by default (captionSide=top)", () => {
    render(
      <Table>
        <TableCaption data-testid="c">File list</TableCaption>
        <tbody><tr><td>x</td></tr></tbody>
      </Table>
    );
    const caption = screen.getByTestId("c");
    expect(caption.tagName).toBe("CAPTION");
    expect(caption).toHaveStyle({ captionSide: "top" });
  });

  it("TableCaption with captionSide='bottom' applies caption-side: bottom", () => {
    render(
      <Table>
        <TableCaption data-testid="c" captionSide="bottom">x</TableCaption>
        <tbody><tr><td>x</td></tr></tbody>
      </Table>
    );
    expect(screen.getByTestId("c")).toHaveStyle({ captionSide: "bottom" });
  });

  it("caption text is the accessible name of the table", () => {
    render(
      <Table>
        <TableCaption>Monthly invoices</TableCaption>
        <tbody><tr><td>x</td></tr></tbody>
      </Table>
    );
    expect(screen.getByRole("table", { name: "Monthly invoices" })).toBeInTheDocument();
  });
});

describe("Table structure — orphans", () => {
  it.each([
    ["TableHead", TableHead],
    ["TableBody", TableBody],
    ["TableFoot", TableFoot],
    ["TableCaption", TableCaption],
  ])("%s throws when used outside <Table>", (_name, Comp) => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() =>
      render(<Comp>x</Comp> as React.ReactElement)
    ).toThrow(/useTableContext must be used within <Table>/);
    spy.mockRestore();
  });
});
