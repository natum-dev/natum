"use client";

import { useMemo, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  IconChevronDown,
  IconChevronUp,
  IconTrash,
  IconX,
} from "@natum/icons";
import { IconButton } from "../IconButton";
import { useControllable } from "../hooks/use-controllable";
import { UploadPanelItem } from "./UploadPanelItem";
import type { UploadItem } from "../hooks/use-upload-queue";
import styles from "./UploadPanel.module.scss";
import cx from "classnames";

export type UploadPanelProps = {
  items: UploadItem[];
  onCancel?: (id: string) => void;
  onRetry?: (id: string) => void;
  onClearCompleted?: () => void;
  onClose?: () => void;
  position?: "bottom-right" | "bottom-left";
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapseChange?: (collapsed: boolean) => void;
  title?: ReactNode;
  className?: string;
};

const deriveTitle = (items: UploadItem[]): string => {
  const uploading = items.filter((i) => i.status === "uploading").length;
  const pending = items.filter((i) => i.status === "pending").length;
  const success = items.filter((i) => i.status === "success").length;
  const error = items.filter((i) => i.status === "error").length;
  const active = uploading + pending;

  if (active > 0) {
    return `Uploading ${active} ${active === 1 ? "file" : "files"}`;
  }
  if (error > 0 && success > 0) {
    return `${success} complete, ${error} failed`;
  }
  if (error > 0) {
    return `${error} ${error === 1 ? "upload" : "uploads"} failed`;
  }
  return `${success} ${success === 1 ? "upload" : "uploads"} complete`;
};

const UploadPanel = ({
  items,
  onCancel,
  onRetry,
  onClearCompleted,
  onClose,
  position = "bottom-right",
  collapsed,
  defaultCollapsed,
  onCollapseChange,
  title,
  className,
}: UploadPanelProps) => {
  const collapseBoxed = useControllable<boolean>({
    value: collapsed,
    defaultValue: defaultCollapsed ?? false,
    onChange: (next) => onCollapseChange?.(next ?? false),
  });
  const isCollapsed = collapseBoxed.value ?? false;
  const toggleCollapse = () => collapseBoxed.setValue(!isCollapsed);

  const derivedTitle = useMemo(() => deriveTitle(items), [items]);
  const effectiveTitle = title ?? derivedTitle;
  const hasTerminalItems = useMemo(
    () => items.some((i) => i.status === "success" || i.status === "error"),
    [items]
  );

  if (items.length === 0) return null;
  if (typeof document === "undefined") return null;

  const ariaLabel =
    typeof effectiveTitle === "string" ? effectiveTitle : "Uploads";

  return createPortal(
    <aside
      role="region"
      aria-label={ariaLabel}
      data-position={position}
      data-collapsed={isCollapsed ? "true" : "false"}
      className={cx(
        styles.panel,
        styles[position === "bottom-left" ? "bottom_left" : "bottom_right"],
        className
      )}
    >
      <header className={styles.header}>
        <div className={styles.title}>{effectiveTitle}</div>
        <div className={styles.header_actions}>
          {hasTerminalItems && onClearCompleted && (
            <IconButton
              icon={IconTrash}
              aria-label="Clear completed uploads"
              onClick={onClearCompleted}
            />
          )}
          <IconButton
            icon={isCollapsed ? IconChevronUp : IconChevronDown}
            aria-label={isCollapsed ? "Expand uploads" : "Collapse uploads"}
            onClick={toggleCollapse}
          />
          {onClose && (
            <IconButton
              icon={IconX}
              aria-label="Close uploads panel"
              onClick={onClose}
            />
          )}
        </div>
      </header>
      <ul className={styles.list}>
        {items.map((item) => (
          <UploadPanelItem
            key={item.id}
            item={item}
            onCancel={onCancel}
            onRetry={onRetry}
          />
        ))}
      </ul>
    </aside>,
    document.body
  );
};

UploadPanel.displayName = "UploadPanel";

export { UploadPanel };
