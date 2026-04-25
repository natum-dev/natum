import {
  forwardRef,
  useCallback,
  type ReactNode,
  type ThHTMLAttributes,
} from "react";
import cx from "classnames";
import { useTableContext, type SortDirection, type TableAlign } from "./context";
import styles from "./Table.module.scss";

export type TableHeaderCellProps = {
  sortKey?: string;
  align?: TableAlign;
  className?: string;
  children: ReactNode;
} & Omit<ThHTMLAttributes<HTMLTableCellElement>, "children" | "className" | "align" | "scope">;

const nextDirection = (
  key: string,
  current: { key: string; direction: SortDirection } | null
): { key: string; direction: SortDirection } | null => {
  if (current?.key !== key) return { key, direction: "asc" };
  if (current.direction === "asc") return { key, direction: "desc" };
  if (current.direction === "desc") return null;
  return { key, direction: "asc" };
};

const ChevronIcon = ({ direction }: { direction: "asc" | "desc" | "none" }) => (
  <svg
    className={cx(styles.sort_icon, styles[`sort_icon_${direction}`])}
    viewBox="0 0 12 12"
    width="12"
    height="12"
    fill="none"
    aria-hidden="true"
  >
    {direction === "none" ? (
      <>
        <path d="M4 4.5L6 2.5L8 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 7.5L6 9.5L8 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ) : (
      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    )}
  </svg>
);

const TableHeaderCell = forwardRef<HTMLTableCellElement, TableHeaderCellProps>(
  ({ sortKey, align, className, style, children, ...rest }, ref) => {
    const { sort, setSort } = useTableContext();
    const mergedStyle = align != null ? { ...style, textAlign: align } : style;

    if (sortKey == null) {
      return (
        <th ref={ref} scope="col" {...rest} className={className} style={mergedStyle}>
          {children}
        </th>
      );
    }

    const isActive = sort?.key === sortKey;
    const direction: "asc" | "desc" | "none" = isActive ? sort!.direction : "none";
    const ariaSort =
      direction === "asc" ? "ascending" : direction === "desc" ? "descending" : "none";

    const onClick = useCallback(() => {
      setSort(nextDirection(sortKey, sort));
    }, [setSort, sort, sortKey]);

    const ariaLabel = (rest["aria-label"] as string | undefined) ?? undefined;

    return (
      <th
        ref={ref}
        scope="col"
        aria-sort={ariaSort}
        {...rest}
        className={className}
        style={mergedStyle}
      >
        <button
          type="button"
          className={styles.sort_button}
          onClick={onClick}
          aria-label={ariaLabel}
        >
          {children}
          <ChevronIcon direction={direction} />
        </button>
      </th>
    );
  }
);

TableHeaderCell.displayName = "TableHeaderCell";
export { TableHeaderCell };
