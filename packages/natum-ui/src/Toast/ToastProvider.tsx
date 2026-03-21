"use client";

import { useSyncExternalStore, useCallback } from "react";
import { createPortal } from "react-dom";
import { toastStore } from "./toast-store";
import type { ToastPosition } from "./toast-store";
import { ToastItem } from "./ToastItem";
import styles from "./Toast.module.scss";
import cx from "classnames";

export type ToastProviderProps = {
  children: React.ReactNode;
  position?: ToastPosition;
  limit?: number;
};

const positionClassMap: Record<ToastPosition, keyof typeof styles> = {
  "top-right": "top_right",
  "top-left": "top_left",
  "top-center": "top_center",
  "bottom-right": "bottom_right",
  "bottom-left": "bottom_left",
  "bottom-center": "bottom_center",
};

const getServerSnapshot = (): ReturnType<typeof toastStore.getToasts> => [];

const ToastProvider = ({
  children,
  position = "bottom-right",
  limit = 5,
}: ToastProviderProps) => {
  const toasts = useSyncExternalStore(
    toastStore.subscribe,
    toastStore.getToasts,
    getServerSnapshot
  );

  const visibleToasts = toasts.slice(-limit);

  const handleDismiss = useCallback((id: string) => {
    toastStore.removeToast(id);
  }, []);

  return (
    <>
      {children}
      {typeof document !== "undefined" &&
        createPortal(
          <div
            className={cx(
              styles.toast_container,
              styles[positionClassMap[position]]
            )}
            aria-label="Notifications"
          >
            {visibleToasts.map((t) => (
              <ToastItem key={t.id} toast={t} onDismiss={handleDismiss} />
            ))}
          </div>,
          document.body
        )}
    </>
  );
};

export { ToastProvider };
