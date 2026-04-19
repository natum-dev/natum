import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { Table } from "./Table";
import { TableHead } from "./TableHead";
import { TableBody } from "./TableBody";
import { TableRow } from "./TableRow";
import { TableCell } from "./TableCell";
import { TableSelectAllCell } from "./TableSelectAllCell";

const files = [
  { id: "a", name: "alpha" },
  { id: "b", name: "beta" },
  { id: "c", name: "gamma" },
];

type RenderOpts = Partial<Omit<ComponentProps<typeof Table>, "children">>;

const renderSelectable = (props: RenderOpts = {}) =>
  render(
    <Table rowIds={files.map((f) => f.id)} {...props}>
      <TableHead>
        <tr>
          <TableSelectAllCell />
          <th scope="col">Name</th>
        </tr>
      </TableHead>
      <TableBody>
        {files.map((f) => (
          <TableRow key={f.id} rowId={f.id}>
            <td />
            <TableCell>{f.name}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

describe("TableSelectAllCell", () => {
  it("renders a header-cell checkbox labelled 'Select all rows' by default", () => {
    renderSelectable();
    expect(screen.getByRole("checkbox", { name: "Select all rows" })).toBeInTheDocument();
  });

  it("unchecked when no rows selected", () => {
    renderSelectable();
    const cb = screen.getByRole("checkbox", { name: "Select all rows" }) as HTMLInputElement;
    expect(cb.checked).toBe(false);
    expect(cb.indeterminate).toBe(false);
  });

  it("indeterminate when some (not all) rows selected", () => {
    renderSelectable({ defaultSelectedRowIds: ["a"] });
    const cb = screen.getByRole("checkbox", { name: "Select all rows" }) as HTMLInputElement;
    expect(cb.checked).toBe(false);
    expect(cb.indeterminate).toBe(true);
  });

  it("checked when all rowIds are selected", () => {
    renderSelectable({ defaultSelectedRowIds: ["a", "b", "c"] });
    const cb = screen.getByRole("checkbox", { name: "Select all rows" }) as HTMLInputElement;
    expect(cb.checked).toBe(true);
    expect(cb.indeterminate).toBe(false);
  });

  it("click toggles all rowIds: none → all", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    renderSelectable({ onSelectedRowIdsChange: onChange });
    await user.click(screen.getByRole("checkbox", { name: "Select all rows" }));
    expect(onChange).toHaveBeenCalledWith(["a", "b", "c"]);
  });

  it("click toggles all rowIds: all → none", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    renderSelectable({
      defaultSelectedRowIds: ["a", "b", "c"],
      onSelectedRowIdsChange: onChange,
    });
    await user.click(screen.getByRole("checkbox", { name: "Select all rows" }));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it("select-all does NOT clear ids outside rowIds", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    // "z" is selected but not in rowIds (simulates server pagination preserving selection)
    renderSelectable({
      defaultSelectedRowIds: ["a", "b", "c", "z"],
      onSelectedRowIdsChange: onChange,
    });
    // Currently all visible rowIds selected → clicking clears only those
    await user.click(screen.getByRole("checkbox", { name: "Select all rows" }));
    expect(onChange).toHaveBeenCalledWith(["z"]);
  });

  it("controlled mode: reflects consumer-provided selectedRowIds", () => {
    renderSelectable({ selectedRowIds: ["a", "b"] });
    const cb = screen.getByRole("checkbox", { name: "Select all rows" }) as HTMLInputElement;
    expect(cb.indeterminate).toBe(true);
  });

  it("consumer aria-label override", () => {
    render(
      <Table rowIds={files.map((f) => f.id)}>
        <TableHead>
          <tr>
            <TableSelectAllCell aria-label="Select all files" />
            <th scope="col">Name</th>
          </tr>
        </TableHead>
        <TableBody>
          <TableRow rowId="a"><td /><TableCell>x</TableCell></TableRow>
        </TableBody>
      </Table>
    );
    expect(screen.getByRole("checkbox", { name: "Select all files" })).toBeInTheDocument();
  });
});

import { TableSelectionCell } from "./TableSelectionCell";

const renderWithSelectionCells = (props: RenderOpts = {}) =>
  render(
    <Table rowIds={files.map((f) => f.id)} {...props}>
      <TableHead>
        <tr>
          <TableSelectAllCell />
          <th scope="col">Name</th>
        </tr>
      </TableHead>
      <TableBody>
        {files.map((f) => (
          <TableRow key={f.id} rowId={f.id} data-testid={`row-${f.id}`}>
            <TableSelectionCell />
            <TableCell>{f.name}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

describe("TableSelectionCell", () => {
  it("renders one checkbox per row", () => {
    renderWithSelectionCells();
    // Plus 1 select-all
    expect(screen.getAllByRole("checkbox")).toHaveLength(4);
  });

  it("clicking a row checkbox selects that row", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    renderWithSelectionCells({ onSelectedRowIdsChange: onChange });
    const rowCbs = screen.getAllByRole("checkbox", { name: "Select row" });
    await user.click(rowCbs[0]);
    expect(onChange).toHaveBeenCalledWith(["a"]);
  });

  it("aria-selected reflects selection state", () => {
    renderWithSelectionCells({ defaultSelectedRowIds: ["b"] });
    expect(screen.getByTestId("row-a")).toHaveAttribute("aria-selected", "false");
    expect(screen.getByTestId("row-b")).toHaveAttribute("aria-selected", "true");
    expect(screen.getByTestId("row-c")).toHaveAttribute("aria-selected", "false");
  });

  it("toggling checkbox off removes from selection", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    renderWithSelectionCells({
      defaultSelectedRowIds: ["a", "b"],
      onSelectedRowIdsChange: onChange,
    });
    const rowCbs = screen.getAllByRole("checkbox", { name: "Select row" });
    await user.click(rowCbs[0]); // uncheck "a"
    expect(onChange).toHaveBeenCalledWith(["b"]);
  });

  it("checkbox click does not trigger parent row onClick", async () => {
    const onRowClick = vi.fn();
    const user = userEvent.setup();
    render(
      <Table rowIds={["a"]}>
        <TableBody>
          <TableRow rowId="a" onClick={onRowClick}>
            <TableSelectionCell />
            <TableCell>x</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    await user.click(screen.getByRole("checkbox", { name: "Select row" }));
    expect(onRowClick).not.toHaveBeenCalled();
  });

  it("consumer aria-label override for individual row", () => {
    render(
      <Table rowIds={["a"]}>
        <TableBody>
          <TableRow rowId="a">
            <TableSelectionCell aria-label="Select alpha" />
            <TableCell>x</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    expect(screen.getByRole("checkbox", { name: "Select alpha" })).toBeInTheDocument();
  });

  it("throws when rendered without a TableRow parent (no rowId context)", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() =>
      render(
        <Table>
          <TableBody>
            <tr>
              <TableSelectionCell />
            </tr>
          </TableBody>
        </Table>
      )
    ).toThrow(/useTableRowContext must be used within <TableRow>/);
    spy.mockRestore();
  });

  it("throws when rendered inside TableRow with no rowId", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() =>
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableSelectionCell />
            </TableRow>
          </TableBody>
        </Table>
      )
    ).toThrow(/TableSelectionCell requires rowId on its <TableRow>/);
    spy.mockRestore();
  });
});

describe("Shift-click range select", () => {
  it("after a first click, shift-click on a later row selects the range", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    renderWithSelectionCells({ onSelectedRowIdsChange: onChange });
    const rowCbs = screen.getAllByRole("checkbox", { name: "Select row" });
    await user.click(rowCbs[0]);            // select "a"; anchor = "a"
    await user.keyboard("{Shift>}");
    await user.click(rowCbs[2]);            // shift-click "c"; range a..c selected
    await user.keyboard("{/Shift}");
    expect(onChange).toHaveBeenLastCalledWith(["a", "b", "c"]);
  });

  it("shift-click with no prior click behaves as a plain toggle", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    renderWithSelectionCells({ onSelectedRowIdsChange: onChange });
    const rowCbs = screen.getAllByRole("checkbox", { name: "Select row" });
    await user.keyboard("{Shift>}");
    await user.click(rowCbs[1]);            // no anchor yet → simple toggle of "b"
    await user.keyboard("{/Shift}");
    expect(onChange).toHaveBeenLastCalledWith(["b"]);
  });

  it("shift-click reverse range (anchor below, click above)", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    renderWithSelectionCells({ onSelectedRowIdsChange: onChange });
    const rowCbs = screen.getAllByRole("checkbox", { name: "Select row" });
    await user.click(rowCbs[2]);            // select "c"; anchor = "c"
    await user.keyboard("{Shift>}");
    await user.click(rowCbs[0]);            // shift-click "a"; range [a..c]
    await user.keyboard("{/Shift}");
    expect(onChange).toHaveBeenLastCalledWith(["c", "a", "b"]);
  });

  it("shift-click UNselects range when target row was selected", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    renderWithSelectionCells({
      defaultSelectedRowIds: ["a", "b", "c"],
      onSelectedRowIdsChange: onChange,
    });
    const rowCbs = screen.getAllByRole("checkbox", { name: "Select row" });
    await user.click(rowCbs[0]);            // unselect "a"; anchor = "a"
    await user.keyboard("{Shift>}");
    await user.click(rowCbs[2]);            // shift-click "c"; a was just unselected
                                             // target state = !selectedSet.has("c") = false → unselect range a..c
    await user.keyboard("{/Shift}");
    expect(onChange).toHaveBeenLastCalledWith([]);
  });
});
