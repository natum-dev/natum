"use client";

import { useState, useEffect, useCallback, type ComponentType } from "react";
import { IconCheckCircle, IconXCircle, IconAlertTriangle, IconInfo, IconX, type IconProps } from "@natum/icons";
import type { Toast } from "./toast-store";
import styles from "./Toast.module.scss";
import cx from "classnames";

type ToastItemProps = {
  toast: Toast;
  onDismiss: (id: string) => void;
};

const typeIconMap: Record<string, ComponentType<IconProps>> = {
  success: IconCheckCircle,
  error: IconXCircle,
  warning: IconAlertTriangle,
  info: IconInfo,
};

const ToastItem = ({ toast: t, onDismiss }: ToastItemProps) => {
  const [state, setState] = useState<"entering" | "visible" | "exiting">("entering");
  const [paused, setPaused] = useState(false);

  const handleDismiss = useCallback(() => {
    setState("exiting");
  }, []);

  const handleAnimationEnd = useCallback(() => {
    if (state === "entering") {
      setState("visible");
    } else if (state === "exiting") {
      onDismiss(t.id);
    }
  }, [state, onDismiss, t.id]);

  useEffect(() => {
    if (t.duration === 0 || paused) return;

    const timer = setTimeout(() => {
      handleDismiss();
    }, t.duration);

    return () => clearTimeout(timer);
  }, [t.duration, paused, handleDismiss]);

  const TypeIcon = typeIconMap[t.type ?? "info"];

  return (
    <div
      className={cx(styles.toast, styles[t.type ?? "info"], {
        [styles.entering]: state === "entering",
        [styles.exiting]: state === "exiting",
      })}
      role={t.type === "error" ? "alert" : "status"}
      aria-live={t.type === "error" ? "assertive" : "polite"}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onAnimationEnd={handleAnimationEnd}
    >
      <TypeIcon
        size="md"
        color="currentColor"
        className={styles.type_icon}
      />
      <div className={styles.content}>
        {t.title && <div className={styles.title}>{t.title}</div>}
        <div className={styles.message}>{t.message}</div>
        {t.action && (
          <button
            className={styles.action_button}
            onClick={() => {
              t.action?.onClick();
              handleDismiss();
            }}
          >
            {t.action.label}
          </button>
        )}
      </div>
      <button
        className={styles.close_button}
        onClick={handleDismiss}
        aria-label="Dismiss"
      >
        <IconX size="sm" color="currentColor" />
      </button>
    </div>
  );
};

export { ToastItem };
