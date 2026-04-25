import type { ReactNode } from "react";
import { sizeMap, type IconProps } from "./types";

const createIcon = (name: string, children: ReactNode) => {
  const Icon = ({
    size = "md",
    color,
    strokeWidth = 2,
    className,
    style,
    ...rest
  }: IconProps) => {
    const px = typeof size === "number" ? size : sizeMap[size];

    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={px}
        height={px}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        style={{ color, ...style }}
        aria-hidden="true"
        {...rest}
      >
        {children}
      </svg>
    );
  };

  Icon.displayName = name;
  return Icon;
};

export { createIcon };
