import {
  type ComponentPropsWithoutRef,
  type ElementType,
  type ReactNode,
  forwardRef,
} from "react";
import styles from "./Container.module.scss";
import cx from "classnames";

type ContainerElementType =
  | "div"
  | "section"
  | "article"
  | "main"
  | "aside";

type ContainerSize = "sm" | "md" | "lg" | "xl" | "fluid";

type ContainerBaseProps<T extends ContainerElementType = "div"> = {
  as?: T;
  size?: ContainerSize;
  className?: string;
  children?: ReactNode;
};

export type ContainerProps<T extends ContainerElementType = "div"> =
  ContainerBaseProps<T> &
    Omit<ComponentPropsWithoutRef<T>, keyof ContainerBaseProps<T>>;

const ContainerInner = <T extends ContainerElementType = "div">(
  {
    as,
    size = "lg",
    className,
    children,
    ...rest
  }: ContainerProps<T>,
  ref: React.ForwardedRef<Element>
) => {
  const Tag = (as ?? "div") as ElementType;

  return (
    <Tag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      className={cx(styles.container, styles[`size_${size}`], className)}
      {...rest}
    >
      {children}
    </Tag>
  );
};

const Container = forwardRef(ContainerInner) as <
  T extends ContainerElementType = "div",
>(
  props: ContainerProps<T> & { ref?: React.Ref<Element> }
) => JSX.Element;

(Container as { displayName?: string }).displayName = "Container";

export { Container };
export type { ContainerElementType, ContainerSize };
