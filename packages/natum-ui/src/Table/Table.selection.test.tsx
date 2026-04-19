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
