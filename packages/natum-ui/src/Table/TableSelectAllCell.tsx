"use client";

import type { ChangeEvent } from "react";
import cx from "classnames";
import { Checkbox } from "../Checkbox";
import { useTableContext } from "./context";
import styles from "./Table.module.scss";

export type TableSelectAllCellProps = {
  className?: string;
  "aria-label"?: string;
};

const TableSelectAllCell = ({
  className,
  "aria-label": ariaLabel = "Select all rows",
}: TableSelectAllCellProps) => {
  const { isAllSelected, isIndeterminate, toggleAll } = useTableContext();
  return (
    <th scope="col" className={cx(styles.selection_cell, className)}>
      <Checkbox
        checked={isAllSelected}
        indeterminate={isIndeterminate}
        onChange={(_e: ChangeEvent<HTMLInputElement>) => toggleAll()}
        aria-label={ariaLabel}
      />
    </th>
  );
};

TableSelectAllCell.displayName = "TableSelectAllCell";
export { TableSelectAllCell };
