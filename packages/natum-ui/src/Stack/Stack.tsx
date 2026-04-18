import {
  type ComponentPropsWithoutRef,
  type ElementType,
  type ReactNode,
  forwardRef,
} from "react";
import type { Align, Justify, Space } from "../layout/types";
import styles from "./Stack.module.scss";
import cx from "classnames";

type StackElementType =
  | "div"
  | "section"
  | "article"
  | "nav"
  | "ul"
  | "ol"
  | "main"
  | "aside";

type StackBaseProps<T extends StackElementType = "div"> = {
  as?: T;
  direction?: "row" | "column";
  gap?: Space;
  align?: Align;
  justify?: Justify;
  wrap?: boolean;
  className?: string;
  children?: ReactNode;
};

export type StackProps<T extends StackElementType = "div"> =
  StackBaseProps<T> &
    Omit<ComponentPropsWithoutRef<T>, keyof StackBaseProps<T>>;

const StackInner = <T extends StackElementType = "div">(
  {
    as,
    direction = "column",
    gap = 0,
    align,
    justify,
    wrap = false,
    className,
    children,
    ...rest
  }: StackProps<T>,
  ref: React.ForwardedRef<Element>
) => {
  const Tag = (as ?? "div") as ElementType;

  return (
    <Tag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      className={cx(
        styles.stack,
        styles[direction],
        styles[`gap_${gap}`],
        align && styles[`align_${align}`],
        justify && styles[`justify_${justify}`],
        { [styles.wrap]: wrap },
        className
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
};

const Stack = forwardRef(StackInner) as <T extends StackElementType = "div">(
  props: StackProps<T> & { ref?: React.Ref<Element> }
) => JSX.Element;

(Stack as { displayName?: string }).displayName = "Stack";

export { Stack };
export type { StackElementType };
