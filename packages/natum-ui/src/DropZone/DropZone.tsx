"use client";

import {
  forwardRef,
  useRef,
  type ChangeEvent,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { IconUpload } from "@natum/icons";
import { Typography } from "../Typography";
import { useMergedRefs } from "../hooks/use-merge-refs";
import { useFileDrop } from "../internal/file-drop/use-file-drop";
import styles from "./DropZone.module.scss";
import cx from "classnames";

export type DropZoneProps = {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  children?: ReactNode;
  className?: string;
} & Omit<
  HTMLAttributes<HTMLDivElement>,
  "onDrop" | "onDragEnter" | "onDragLeave" | "onDragOver" | "children"
>;

const DropZone = forwardRef<HTMLDivElement, DropZoneProps>(
  (
    {
      onFilesSelected,
      accept,
      multiple = true,
      disabled = false,
      children,
      className,
      onClick,
      onKeyDown,
      ...rest
    },
    ref
  ) => {
    const internalRef = useRef<HTMLDivElement>(null);
    const mergedRef = useMergedRefs(ref, internalRef);
    const inputRef = useRef<HTMLInputElement>(null);

    const { isOver, bind } = useFileDrop({
      target: internalRef,
      onFilesDropped: (files) => {
        if (files.length > 0) onFilesSelected(files);
      },
      filesOnly: true,
      disabled,
    });

    const openPicker = () => {
      if (disabled) return;
      inputRef.current?.click();
    };

    const handleClick = (event: MouseEvent<HTMLDivElement>) => {
      onClick?.(event);
      if (event.defaultPrevented) return;
      // detail === 0 means keyboard-synthesised click (Enter on role=button);
      // the keydown handler already called openPicker(), so skip here.
      if (event.detail === 0) return;
      openPicker();
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;
      if (disabled) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openPicker();
      }
    };

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files
        ? Array.from(event.target.files)
        : [];
      if (files.length > 0) onFilesSelected(files);
      event.target.value = "";
    };

    const dataState = disabled ? "disabled" : isOver ? "dragover" : "idle";
    const ariaLabel = rest["aria-label"] ?? "Upload files";

    return (
      <div
        ref={mergedRef}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled || undefined}
        aria-label={ariaLabel}
        data-state={dataState}
        {...bind!}
        {...rest}
        className={cx(styles.drop_zone, className)}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        {children ?? (
          <>
            <IconUpload size={24} aria-hidden="true" />
            <Typography tag="p" variant="h6">
              Drag files here or click to browse
            </Typography>
            <Typography tag="p" variant="body2" color="secondary">
              or click anywhere in this area
            </Typography>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          className={styles.hidden_input}
          tabIndex={-1}
          aria-hidden="true"
          onChange={handleInputChange}
        />
      </div>
    );
  }
);

DropZone.displayName = "DropZone";

export { DropZone };
