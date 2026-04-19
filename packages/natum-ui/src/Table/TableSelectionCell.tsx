"use client";

import type { ChangeEvent, MouseEvent } from "react";
import cx from "classnames";
import { Checkbox } from "../Checkbox";
import { useTableContext, useTableRowContext } from "./context";
import styles from "./Table.module.scss";

export type TableSelectionCellProps = {
  className?: string;
  "aria-label"?: string;
};

const TableSelectionCell = ({
  className,
  "aria-label": ariaLabel = "Select row",
}: TableSelectionCellProps) => {
  const { selectedSet, toggleRow } = useTableContext();
  const { rowId } = useTableRowContext();
  if (rowId == null) {
    throw new Error("TableSelectionCell requires rowId on its <TableRow>.");
  }
  const checked = selectedSet.has(rowId);

  const onChange = (_e: ChangeEvent<HTMLInputElement>) => {
    toggleRow(rowId, false);
  };

  return (
    <td
      className={cx(styles.selection_cell, className)}
      onClick={(e: MouseEvent<HTMLTableCellElement>) => e.stopPropagation()}
    >
      <Checkbox
        checked={checked}
        onChange={onChange}
        aria-label={ariaLabel}
      />
    </td>
  );
};

TableSelectionCell.displayName = "TableSelectionCell";
export { TableSelectionCell };
