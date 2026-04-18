"use client";

import { useState, useEffect, useCallback, forwardRef, type ComponentType } from "react";
import {
  IconCheckCircle,
  IconXCircle,
  IconAlertTriangle,
  IconInfo,
  IconX,
  type IconProps,
} from "@natum/icons";
import { useAnimationState } from "../hooks/use-animation-state";
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

const ANIMATION_DURATION = 250;

const ToastItem = forwardRef<HTMLDivElement, ToastItemProps>(
  ({ toast: t, onDismiss }, ref) => {
    const [dismissed, setDismissed] = useState(false);
    const [paused, setPaused] = useState(false);

    const handleDismiss = useCallback(() => {
      setDismissed(true);
    }, []);

    const { state: animationState } = useAnimationState({
      isOpen: !dismissed,
      enterDuration: ANIMATION_DURATION,
      exitDuration: ANIMATION_DURATION,
    });

    useEffect(() => {
      if (animationState === "exited" && dismissed) {
        onDismiss(t.id);
      }
    }, [animationState, dismissed, onDismiss, t.id]);

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
        ref={ref}
        className={cx(styles.toast, styles[t.type ?? "info"], {
          [styles.entering]: animationState === "entering",
          [styles.exiting]: animationState === "exiting",
        })}
        role={t.type === "error" ? "alert" : "status"}
        aria-live={t.type === "error" ? "assertive" : "polite"}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <TypeIcon size="md" className={styles.type_icon} />
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
  }
);

ToastItem.displayName = "ToastItem";

export { ToastItem };
