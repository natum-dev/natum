import {
  type ComponentType,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type MouseEventHandler,
  type ReactNode,
  forwardRef,
} from "react";
import type { IconProps } from "@natum/icons";
import { Checkbox } from "../Checkbox";
import styles from "./FileCard.module.scss";
import cx from "classnames";

type FileCardSize = "sm" | "md" | "lg";

type FileCardBaseProps = {
  icon: ComponentType<IconProps>;
  thumbnail?: ReactNode;
  name: string;
  meta?: ReactNode;
  action?: ReactNode;
  selected?: boolean;
  onSelectedChange?: (next: boolean) => void;
  onClick?: MouseEventHandler<HTMLDivElement>;
  onDoubleClick?: MouseEventHandler<HTMLDivElement>;
  size?: FileCardSize;
  className?: string;
};

type FileCardProps = FileCardBaseProps &
  Omit<
    HTMLAttributes<HTMLDivElement>,
    keyof FileCardBaseProps | "onKeyDown"
  >;

const ICON_PX: Record<FileCardSize, number> = {
  sm: 32,
  md: 40,
  lg: 56,
};

const FileCard = forwardRef<HTMLDivElement, FileCardProps>(
  (
    {
      icon: Icon,
      thumbnail,
      name,
      meta,
      action,
      selected = false,
      onSelectedChange,
      onClick,
      onDoubleClick,
      size = "md",
      className,
      ...rest
    },
    ref
  ) => {
    const hasThumbnail = thumbnail != null;
    const isFocusable = typeof onClick === "function";
    const isSelectable = typeof onSelectedChange === "function";

    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
      if (!isFocusable) return;
      if (e.key === "Enter") {
        onClick?.(e as unknown as MouseEvent<HTMLDivElement>);
      } else if (e.key === " ") {
        e.preventDefault();
        onClick?.(e as unknown as MouseEvent<HTMLDivElement>);
      }
    };

    return (
      <div
        ref={ref}
        className={cx(styles.file_card, className)}
        role={isFocusable ? "button" : undefined}
        tabIndex={isFocusable ? 0 : undefined}
        aria-pressed={isFocusable && isSelectable ? selected : undefined}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        onKeyDown={isFocusable ? handleKeyDown : undefined}
        {...rest}
        data-has-thumbnail={hasThumbnail ? "true" : "false"}
        data-selected={selected ? "true" : "false"}
        data-size={size}
      >
        {isSelectable && (
          <div
            className={styles.checkbox_slot}
            onClick={(e) => e.stopPropagation()}
            onDoubleClick={(e) => e.stopPropagation()}
          >
            <Checkbox
              checked={selected}
              onChange={(e) => onSelectedChange?.(e.target.checked)}
              aria-label={`Select ${name}`}
            />
          </div>
        )}
        {action != null && (
          <div
            className={styles.action_slot}
            onClick={(e) => e.stopPropagation()}
            onDoubleClick={(e) => e.stopPropagation()}
          >
            {action}
          </div>
        )}
        <div className={styles.preview}>
          {hasThumbnail ? (
            <div className={styles.thumbnail_wrapper}>{thumbnail}</div>
          ) : (
            <Icon size={ICON_PX[size]} aria-hidden="true" />
          )}
        </div>
        <div className={styles.body}>
          <div className={styles.name} title={name}>
            {name}
          </div>
          {meta != null && <div className={styles.meta_line}>{meta}</div>}
        </div>
      </div>
    );
  }
);

FileCard.displayName = "FileCard";

export { FileCard };
export type { FileCardProps, FileCardSize };
