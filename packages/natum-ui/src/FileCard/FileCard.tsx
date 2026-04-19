import {
  type ComponentType,
  type HTMLAttributes,
  type MouseEventHandler,
  type ReactNode,
  forwardRef,
} from "react";
import type { IconProps } from "@natum/icons";
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

const FileCard = forwardRef<HTMLDivElement, FileCardProps>(
  ({ icon: Icon, thumbnail, name, className, ...rest }, ref) => {
    const hasThumbnail = thumbnail != null;
    return (
      <div
        ref={ref}
        className={cx(styles.file_card, className)}
        data-has-thumbnail={hasThumbnail ? "true" : "false"}
        data-selected="false"
        data-size="md"
        {...rest}
      >
        <div className={styles.preview}>
          {hasThumbnail ? (
            <div className={styles.thumbnail_wrapper}>{thumbnail}</div>
          ) : (
            <Icon size={40} aria-hidden="true" />
          )}
        </div>
        <div className={styles.body}>
          <div className={styles.name} title={name}>
            {name}
          </div>
        </div>
      </div>
    );
  }
);

FileCard.displayName = "FileCard";

export { FileCard };
export type { FileCardProps, FileCardSize };
