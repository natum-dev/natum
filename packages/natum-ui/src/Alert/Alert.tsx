"use client";

import {
  type ComponentPropsWithoutRef,
  type ComponentType,
  type ReactNode,
  forwardRef,
  useState,
  useCallback,
} from "react";
import {
  IconCheckCircle,
  IconXCircle,
  IconAlertTriangle,
  IconInfo,
  IconX,
  type IconProps,
} from "@natum/icons";
import styles from "./Alert.module.scss";
import cx from "classnames";

type AlertType = "success" | "error" | "warning" | "info";

const typeIconMap: Record<AlertType, ComponentType<IconProps>> = {
  success: IconCheckCircle,
  error: IconXCircle,
  warning: IconAlertTriangle,
  info: IconInfo,
};

type AlertBaseProps = {
  type?: AlertType;
  title?: ReactNode;
  children?: ReactNode;
  icon?: ComponentType<IconProps> | false;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
};

export type AlertProps = AlertBaseProps &
  Omit<ComponentPropsWithoutRef<"div">, keyof AlertBaseProps>;

const Alert = forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      type = "info",
      title,
      children,
      icon,
      dismissible = false,
      onDismiss,
      className,
      ...rest
    },
    ref
  ) => {
    const isControlled = typeof onDismiss === "function";
    const [internallyDismissed, setInternallyDismissed] = useState(false);

    const handleDismiss = useCallback(() => {
      if (isControlled) {
        onDismiss?.();
      } else {
        setInternallyDismissed(true);
      }
    }, [isControlled, onDismiss]);

    if (!isControlled && internallyDismissed) {
      return null;
    }

    const IconToRender: ComponentType<IconProps> | null =
      icon === false ? null : (icon ?? typeIconMap[type]);

    const isError = type === "error";

    return (
      <div
        ref={ref}
        role={isError ? "alert" : "status"}
        aria-live={isError ? "assertive" : "polite"}
        className={cx(styles.alert, styles[type], className)}
        {...rest}
      >
        {IconToRender && (
          <IconToRender
            size="md"
            color="currentColor"
            className={styles.type_icon}
          />
        )}

        <div className={styles.content}>
          {title && <div className={styles.title}>{title}</div>}
          {children && <div className={styles.message}>{children}</div>}
        </div>

        {dismissible && (
          <button
            type="button"
            className={styles.close_button}
            onClick={handleDismiss}
            aria-label="Dismiss"
          >
            <IconX size="sm" color="currentColor" />
          </button>
        )}
      </div>
    );
  }
);

Alert.displayName = "Alert";

export { Alert };
export type { AlertType };
