import { ComponentPropsWithRef, createElement, PropsWithChildren } from "react";
import styles from "./Typography.module.scss";
import classNames from "classnames";
import { getPropertyValue } from "../utils/property";

type TypographyColor =
  | "primary"
  | "secondary"
  | "disabled"
  | "link"
  | "inverse"
  | "error"
  | "info"
  | "success"
  | "warning";

type TypographyVariant =
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

export type TypographyProps<TTag extends keyof JSX.IntrinsicElements> = {
  tag?: TTag;
  variant?: TypographyVariant;
  color?: TypographyColor;
} & ComponentPropsWithRef<TTag>;

const allowedHtml5Element = new Set([
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "code",
]);

const sanitizeHtmlTag = (tag: string): keyof JSX.IntrinsicElements => {
  return allowedHtml5Element.has(tag)
    ? (tag as keyof JSX.IntrinsicElements)
    : "p";
};

const Typography = <TTag extends keyof JSX.IntrinsicElements = "p">({
  tag,
  variant = "body1",
  children,
  color,
  className,
  ...restProps
}: PropsWithChildren<TypographyProps<TTag>>) => {
  return createElement(
    tag ?? sanitizeHtmlTag(variant),
    {
      className: classNames(
        className,
        styles.typography,
        getPropertyValue(styles, variant),
        color && getPropertyValue(styles, color)
      ),
      ...restProps,
    },
    children
  );
};

export default Typography;
