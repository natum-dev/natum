import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { Table } from "./Table";
import { TableHead } from "./TableHead";
import { TableBody } from "./TableBody";
import { TableHeaderCell } from "./TableHeaderCell";

type RenderOpts = Partial<Omit<ComponentProps<typeof Table>, "children">>;

const renderTable = (overrides: RenderOpts = {}) =>
  render(
    <Table {...overrides}>
      <TableHead>
        <tr>
          <TableHeaderCell sortKey="name">Name</TableHeaderCell>
          <TableHeaderCell sortKey="size">Size</TableHeaderCell>
          <TableHeaderCell>Actions</TableHeaderCell>
        </tr>
      </TableHead>
      <TableBody><tr><td>x</td></tr></TableBody>
    </Table>
  );

describe("Table sort", () => {
  it("sortable HeaderCell renders an inner <button>; non-sortable does not", () => {
    renderTable();
    expect(screen.getByRole("button", { name: "Name" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Size" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Actions" })).not.toBeInTheDocument();
  });

  it("default aria-sort is 'none' on sortable columns, absent on non-sortable", () => {
    renderTable();
    const name = screen.getByRole("columnheader", { name: /Name/ });
    const actions = screen.getByRole("columnheader", { name: /Actions/ });
    expect(name).toHaveAttribute("aria-sort", "none");
    expect(actions).not.toHaveAttribute("aria-sort");
  });

  it("uncontrolled: click cycles asc → desc → none on same column", async () => {
    const onSortChange = vi.fn();
    const user = userEvent.setup();
    renderTable({ onSortChange });
    const btn = screen.getByRole("button", { name: "Name" });
    const th = screen.getByRole("columnheader", { name: /Name/ });

    await user.click(btn);
    expect(th).toHaveAttribute("aria-sort", "ascending");
    expect(onSortChange).toHaveBeenLastCalledWith({ key: "name", direction: "asc" });

    await user.click(btn);
    expect(th).toHaveAttribute("aria-sort", "descending");
    expect(onSortChange).toHaveBeenLastCalledWith({ key: "name", direction: "desc" });

    await user.click(btn);
    expect(th).toHaveAttribute("aria-sort", "none");
    expect(onSortChange).toHaveBeenLastCalledWith(null);
  });

  it("clicking a different column resets to asc on that column", async () => {
    const user = userEvent.setup();
    renderTable({ defaultSort: { key: "name", direction: "desc" } });
    const sizeBtn = screen.getByRole("button", { name: "Size" });
    const sizeTh = screen.getByRole("columnheader", { name: /Size/ });
    await user.click(sizeBtn);
    expect(sizeTh).toHaveAttribute("aria-sort", "ascending");
  });

  it("controlled: consumer's sort is reflected; click fires onSortChange but does not mutate state without a controlled update", async () => {
    const onSortChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Table sort={{ key: "name", direction: "asc" }} onSortChange={onSortChange}>
        <TableHead>
          <tr>
            <TableHeaderCell sortKey="name">Name</TableHeaderCell>
          </tr>
        </TableHead>
        <TableBody><tr><td>x</td></tr></TableBody>
      </Table>
    );
    const th = screen.getByRole("columnheader", { name: /Name/ });
    expect(th).toHaveAttribute("aria-sort", "ascending");

    await user.click(screen.getByRole("button", { name: "Name" }));
    // onSortChange fires with next state, but DOM aria-sort stays because consumer didn't update
    expect(onSortChange).toHaveBeenCalledWith({ key: "name", direction: "desc" });
    expect(th).toHaveAttribute("aria-sort", "ascending");
  });

  it("defaultSort seeds initial state", () => {
    renderTable({ defaultSort: { key: "size", direction: "desc" } });
    const size = screen.getByRole("columnheader", { name: /Size/ });
    expect(size).toHaveAttribute("aria-sort", "descending");
  });

  it("consumer aria-label on TableHeaderCell overrides button accessible name", () => {
    render(
      <Table>
        <TableHead>
          <tr>
            <TableHeaderCell sortKey="name" aria-label="Sort by name">Name</TableHeaderCell>
          </tr>
        </TableHead>
        <TableBody><tr><td>x</td></tr></TableBody>
      </Table>
    );
    // button accessible name = Sort by name (mirrored from th's aria-label)
    expect(screen.getByRole("button", { name: "Sort by name" })).toBeInTheDocument();
  });
});
