import { ComponentPropsWithRef, createElement, ReactNode } from "react";
import { TypographyColor, TypographySize, useTheme } from "../Theme";

type TypographyType = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p";

type TypographyProps<TType extends TypographyType = TypographyType> = {
  type?: TType;
  children?: ReactNode;
  align?: "left" | "right" | "center";
  color?: keyof TypographyColor;
  weight?: number | string;
} & ComponentPropsWithRef<TType>;

const Typography = ({
  type = "p",
  children,
  color = "primary",
  align,
  weight,
  ...restProps
}: TypographyProps) => {
  const {
    typography: { sizes, color: colorTheme },
  } = useTheme();
  return createElement(
    type,
    {
      style: {
        fontSize:
          type in sizes ? sizes[type as keyof TypographySize] : sizes.default,
        color: colorTheme[color],
        textAlign: align,
        fontWeight: weight,
      },
      ...restProps,
    },
    children
  );
};

export default Typography;
