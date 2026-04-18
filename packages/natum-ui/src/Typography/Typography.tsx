import {
  type ComponentPropsWithoutRef,
  type PropsWithChildren,
  createElement,
  forwardRef,
} from "react";
import styles from "./Typography.module.scss";
import classNames from "classnames";

export type TypographyVariantBase =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "body1"
  | "body2"
  | "body3"
  | "caption"
  | "code";

export type TypographyColorBase =
  | "primary"
  | "secondary"
  | "disabled"
  | "link"
  | "inverse"
  | "error"
  | "info"
  | "success"
  | "warning";

export type TypographyVariant = TypographyVariantBase;
export type TypographyColor = TypographyColorBase;

export type TypographyProps = Omit<ComponentPropsWithoutRef<"p">, "color"> & {
  tag?: keyof JSX.IntrinsicElements;
  variant?: TypographyVariant;
  color?: TypographyColor;
};

const allowedHtml5Element = new Set([
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "code",
]);

const sanitizeHtmlTag = (variant: string): keyof JSX.IntrinsicElements => {
  return allowedHtml5Element.has(variant)
    ? (variant as keyof JSX.IntrinsicElements)
    : "p";
};

const Typography = forwardRef<HTMLElement, PropsWithChildren<TypographyProps>>(
  ({ tag, variant = "body1", children, color, className, ...restProps }, ref) => {
    return createElement(
      tag ?? sanitizeHtmlTag(variant),
      {
        ref,
        className: classNames(
          className,
          styles.typography,
          styles[variant],
          color && styles[color]
        ),
        ...restProps,
      },
      children
    );
  }
);

Typography.displayName = "Typography";

export { Typography };
