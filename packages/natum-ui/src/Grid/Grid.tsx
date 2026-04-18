import {
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ElementType,
  type ReactNode,
  forwardRef,
} from "react";
import type { Align, Justify, Space } from "../layout/types";
import styles from "./Grid.module.scss";
import cx from "classnames";

type GridElementType =
  | "div"
  | "section"
  | "article"
  | "ul"
  | "ol"
  | "main";

type GridAlign = Extract<Align, "start" | "center" | "end" | "stretch">;
type GridJustify = Extract<Justify, "start" | "center" | "end">;

type SupportedColumns = 1 | 2 | 3 | 4 | 6 | 12;

type GridBaseProps<T extends GridElementType = "div"> = {
  as?: T;
  columns?: SupportedColumns;
  minChildWidth?: string;
  gap?: Space;
  rowGap?: Space;
  columnGap?: Space;
  align?: GridAlign;
  justify?: GridJustify;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

export type GridProps<T extends GridElementType = "div"> =
  GridBaseProps<T> & Omit<ComponentPropsWithoutRef<T>, keyof GridBaseProps<T>>;

const GridInner = <T extends GridElementType = "div">(
  {
    as,
    columns = 1,
    minChildWidth,
    gap = 0,
    rowGap,
    columnGap,
    align,
    justify,
    className,
    style,
    children,
    ...rest
  }: GridProps<T>,
  ref: React.ForwardedRef<Element>
) => {
  const Tag = (as ?? "div") as ElementType;

  const useAutoFit = typeof minChildWidth === "string";

  const mergedStyle: CSSProperties | undefined = useAutoFit
    ? {
        ...style,
        gridTemplateColumns: `repeat(auto-fit, minmax(${minChildWidth}, 1fr))`,
      }
    : style;

  return (
    <Tag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      className={cx(
        styles.grid,
        !useAutoFit && styles[`columns_${columns}`],
        styles[`gap_${gap}`],
        rowGap !== undefined && styles[`row_gap_${rowGap}`],
        columnGap !== undefined && styles[`column_gap_${columnGap}`],
        align && styles[`align_${align}`],
        justify && styles[`justify_${justify}`],
        className
      )}
      style={mergedStyle}
      {...rest}
    >
      {children}
    </Tag>
  );
};

const Grid = forwardRef(GridInner) as <T extends GridElementType = "div">(
  props: GridProps<T> & { ref?: React.Ref<Element> }
) => JSX.Element;

(Grid as { displayName?: string }).displayName = "Grid";

export { Grid };
export type { GridElementType, SupportedColumns };
