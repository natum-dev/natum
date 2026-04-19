import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Table } from "./Table";
import { TableBody } from "./TableBody";
import { TableRow } from "./TableRow";
import { TableCell } from "./TableCell";

describe("TableRow", () => {
  it("renders as <tr>", () => {
    render(
      <Table>
        <TableBody>
          <TableRow data-testid="r"><TableCell>x</TableCell></TableRow>
        </TableBody>
      </Table>
    );
    expect(screen.getByTestId("r").tagName).toBe("TR");
  });

  it("without onClick, row has no .interactive class and no cursor:pointer", () => {
    render(
      <Table>
        <TableBody>
          <TableRow data-testid="r"><TableCell>x</TableCell></TableRow>
        </TableBody>
      </Table>
    );
    expect(screen.getByTestId("r").className).not.toMatch(/interactive/);
  });

  it("with onClick, row has .interactive class and fires onClick", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(
      <Table>
        <TableBody>
          <TableRow data-testid="r" onClick={onClick}><TableCell>x</TableCell></TableRow>
        </TableBody>
      </Table>
    );
    const row = screen.getByTestId("r");
    expect(row.className).toMatch(/interactive/);
    await user.click(row);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("without rowId, <tr> has no aria-selected", () => {
    render(
      <Table>
        <TableBody>
          <TableRow data-testid="r"><TableCell>x</TableCell></TableRow>
        </TableBody>
      </Table>
    );
    expect(screen.getByTestId("r")).not.toHaveAttribute("aria-selected");
  });

  it("with rowId (stub selection in Task 2), aria-selected='false' is emitted", () => {
    render(
      <Table>
        <TableBody>
          <TableRow data-testid="r" rowId="a"><TableCell>x</TableCell></TableRow>
        </TableBody>
      </Table>
    );
    expect(screen.getByTestId("r")).toHaveAttribute("aria-selected", "false");
  });
});

describe("TableCell", () => {
  it("renders as <td>", () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell data-testid="c">x</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    expect(screen.getByTestId("c").tagName).toBe("TD");
  });

  it("align='end' applies text-align: end", () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell data-testid="c" align="end">x</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    expect(screen.getByTestId("c")).toHaveStyle({ textAlign: "end" });
  });

  it("colSpan passes through", () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell data-testid="c" colSpan={3}>x</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    expect(screen.getByTestId("c")).toHaveAttribute("colspan", "3");
  });
});

import { TableActionCell } from "./TableActionCell";

describe("TableActionCell", () => {
  it("renders as <td>", () => {
    render(
      <Table>
        <TableBody>
          <TableRow><TableActionCell data-testid="a">x</TableActionCell></TableRow>
        </TableBody>
      </Table>
    );
    expect(screen.getByTestId("a").tagName).toBe("TD");
  });

  it("default align is 'end' (text-align: end)", () => {
    render(
      <Table>
        <TableBody>
          <TableRow><TableActionCell data-testid="a">x</TableActionCell></TableRow>
        </TableBody>
      </Table>
    );
    expect(screen.getByTestId("a")).toHaveStyle({ textAlign: "end" });
  });

  it("child button click does NOT bubble to parent row onClick", async () => {
    const onRowClick = vi.fn();
    const onBtnClick = vi.fn();
    const user = userEvent.setup();
    render(
      <Table>
        <TableBody>
          <TableRow rowId="a" onClick={onRowClick}>
            <TableActionCell>
              <button onClick={onBtnClick}>Action</button>
            </TableActionCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    await user.click(screen.getByRole("button", { name: "Action" }));
    expect(onBtnClick).toHaveBeenCalledTimes(1);
    expect(onRowClick).not.toHaveBeenCalled();
  });

  it("child mousedown does NOT bubble to parent row", async () => {
    const onRowMouseDown = vi.fn();
    const user = userEvent.setup();
    render(
      <Table>
        <TableBody>
          <TableRow rowId="a" onMouseDown={onRowMouseDown}>
            <TableActionCell>
              <button>x</button>
            </TableActionCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    // user.click fires mousedown → mouseup → click; TableActionCell stops mousedown bubbling.
    await user.click(screen.getByRole("button"));
    expect(onRowMouseDown).not.toHaveBeenCalled();
  });

  it("consumer-passed onClick on the cell still fires", async () => {
    const onCellClick = vi.fn();
    const onRowClick = vi.fn();
    const user = userEvent.setup();
    render(
      <Table>
        <TableBody>
          <TableRow rowId="a" onClick={onRowClick}>
            <TableActionCell data-testid="a" onClick={onCellClick}>
              <button>x</button>
            </TableActionCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    await user.click(screen.getByTestId("a"));
    expect(onCellClick).toHaveBeenCalledTimes(1);
    expect(onRowClick).not.toHaveBeenCalled();
  });

  it("consumer-passed onKeyDown still fires + doesn't bubble to row", async () => {
    const onCellKeyDown = vi.fn();
    const onRowKeyDown = vi.fn();
    const user = userEvent.setup();
    render(
      <Table>
        <TableBody>
          <TableRow rowId="a" onKeyDown={onRowKeyDown}>
            <TableActionCell onKeyDown={onCellKeyDown}>
              <button>x</button>
            </TableActionCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    // Focus the button and press Enter
    screen.getByRole("button").focus();
    await user.keyboard("{Enter}");
    expect(onCellKeyDown).toHaveBeenCalledTimes(1);
    expect(onRowKeyDown).not.toHaveBeenCalled();
  });
});
