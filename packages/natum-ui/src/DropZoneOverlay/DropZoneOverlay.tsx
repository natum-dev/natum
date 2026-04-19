"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { IconUpload } from "@natum/icons";
import { Typography } from "../Typography";
import { useEscapeKey } from "../hooks/use-escape-key";
import { useAnimationState } from "../hooks/use-animation-state";
import styles from "./DropZoneOverlay.module.scss";
import cx from "classnames";

export type DropZoneOverlayProps = {
  onFilesDropped: (files: File[]) => void;
  accept?: string;
  disabled?: boolean;
  label?: ReactNode;
  className?: string;
};

const matchesAccept = (file: File, acceptTokens: string[]): boolean => {
  for (const raw of acceptTokens) {
    const token = raw.trim();
    if (!token) continue;
    if (token.startsWith(".")) {
      if (file.name.toLowerCase().endsWith(token.toLowerCase())) return true;
    } else if (token.endsWith("/*")) {
      const prefix = token.slice(0, -2);
      if (file.type.startsWith(prefix + "/")) return true;
    } else if (file.type === token) {
      return true;
    }
  }
  return false;
};

const hasFiles = (dt: DataTransfer | null | undefined): boolean =>
  !!dt && Array.from(dt.types).includes("Files");

const DropZoneOverlay = ({
  onFilesDropped,
  accept,
  disabled = false,
  label,
  className,
}: DropZoneOverlayProps) => {
  const [isActive, setIsActive] = useState(false);
  const counterRef = useRef(0);

  const onFilesDroppedRef = useRef(onFilesDropped);
  onFilesDroppedRef.current = onFilesDropped;

  useEscapeKey({
    onEscape: () => {
      counterRef.current = 0;
      setIsActive(false);
    },
    enabled: isActive,
  });

  useEffect(() => {
    if (disabled) return;

    const handleEnter = (e: Event) => {
      const dt = (e as DragEvent).dataTransfer;
      if (!hasFiles(dt)) return;
      counterRef.current += 1;
      if (counterRef.current === 1) setIsActive(true);
    };

    const handleOver = (e: Event) => {
      e.preventDefault();
    };

    const handleLeave = () => {
      if (counterRef.current > 0) counterRef.current -= 1;
      if (counterRef.current === 0) setIsActive(false);
    };

    const handleDrop = (e: Event) => {
      e.preventDefault();
      counterRef.current = 0;
      setIsActive(false);
      const dt = (e as DragEvent).dataTransfer;
      const files = dt?.files ? Array.from(dt.files) : [];
      if (files.length === 0) return;
      if (accept) {
        const tokens = accept.split(",");
        const allMatch = files.every((f) => matchesAccept(f, tokens));
        if (!allMatch) return;
      }
      onFilesDroppedRef.current(files);
    };

    document.addEventListener("dragenter", handleEnter);
    document.addEventListener("dragover", handleOver);
    document.addEventListener("dragleave", handleLeave);
    document.addEventListener("drop", handleDrop);

    return () => {
      document.removeEventListener("dragenter", handleEnter);
      document.removeEventListener("dragover", handleOver);
      document.removeEventListener("dragleave", handleLeave);
      document.removeEventListener("drop", handleDrop);
    };
  }, [disabled, accept]);

  const { state, shouldRender } = useAnimationState({
    isOpen: isActive,
    enterDuration: 150,
    exitDuration: 150,
  });

  if (disabled || !shouldRender) return null;
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-label="Drop files to upload"
      className={cx(styles.overlay, className)}
      data-state={state}
    >
      <div className={styles.card}>
        <IconUpload size={48} aria-hidden="true" />
        <Typography tag="p" variant="h5">
          {label ?? "Drop files anywhere to upload"}
        </Typography>
      </div>
    </div>,
    document.body
  );
};

DropZoneOverlay.displayName = "DropZoneOverlay";

export { DropZoneOverlay };
