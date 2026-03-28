import { forwardRef, type ComponentPropsWithoutRef, type ComponentType } from "react";
import { IconLoader, type IconProps } from "@natum/icons";
import styles from "./IconButton.module.scss";
import cx from "classnames";

export type IconButtonProps = Omit<
  ComponentPropsWithoutRef<"button">,
  "color" | "children"
> & {
  icon: ComponentType<IconProps>;
  "aria-label": string;
  size?: "small" | "medium" | "large";
  variant?: "filled" | "light" | "outlined" | "text";
  color?: "primary" | "secondary" | "error" | "success" | "warning";
  disabled?: boolean;
  loading?: boolean;
  className?: string;
};

const iconSizeMap = {
  small: "sm" as const,
  medium: "md" as const,
  large: "lg" as const,
};

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      icon: IconComponent,
      size = "medium",
      variant = "filled",
      color = "primary",
      disabled,
      loading,
      className,
      ...rest
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cx(
          styles.icon_button,
          styles[variant],
          styles[size],
          !(disabled || loading) && styles[color],
          {
            [styles.disabled]: disabled || loading,
          },
          className
        )}
        disabled={disabled || loading}
        {...rest}
      >
        {loading ? (
          <IconLoader size={iconSizeMap[size]} color="currentColor" className={styles.spinner} />
        ) : (
          <IconComponent size={iconSizeMap[size]} color="currentColor" />
        )}
      </button>
    );
  }
);

IconButton.displayName = "IconButton";

export { IconButton };
