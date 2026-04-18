import {
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ElementType,
  type ReactNode,
  forwardRef,
} from "react";
import styles from "./AspectRatio.module.scss";
import cx from "classnames";

type AspectRatioElementType = "div" | "figure" | "section";

type AspectRatioBaseProps<T extends AspectRatioElementType = "div"> = {
  as?: T;
  ratio: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

export type AspectRatioProps<T extends AspectRatioElementType = "div"> =
  AspectRatioBaseProps<T> &
    Omit<ComponentPropsWithoutRef<T>, keyof AspectRatioBaseProps<T>>;

const AspectRatioInner = <T extends AspectRatioElementType = "div">(
  {
    as,
    ratio,
    className,
    style,
    children,
    ...rest
  }: AspectRatioProps<T>,
  ref: React.ForwardedRef<Element>
) => {
  const Tag = (as ?? "div") as ElementType;

  const mergedStyle = {
    ...style,
    "--ar-ratio": String(ratio),
  } as CSSProperties;

  return (
    <Tag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      className={cx(styles.aspect_ratio, className)}
      style={mergedStyle}
      {...rest}
    >
      {children}
    </Tag>
  );
};

const AspectRatio = forwardRef(AspectRatioInner) as <
  T extends AspectRatioElementType = "div",
>(
  props: AspectRatioProps<T> & { ref?: React.Ref<Element> }
) => JSX.Element;

(AspectRatio as { displayName?: string }).displayName = "AspectRatio";

export { AspectRatio };
export type { AspectRatioElementType };
