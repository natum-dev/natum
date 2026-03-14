import type { SVGProps } from "react";

export type IconSize = "xs" | "sm" | "md" | "lg" | "xl" | "xxl";

export type IconProps = SVGProps<SVGSVGElement> & {
  size?: IconSize | number;
  color?: string;
};

export const sizeMap: Record<IconSize, number> = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  xxl: 40,
};
