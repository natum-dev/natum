import {
  IconAlertTriangle,
  IconCheckCircle,
  IconFile,
  IconX,
} from "@natum/icons";
import { IconButton } from "../IconButton";
import { formatSize } from "./format-size";
import type { UploadItem } from "../hooks/use-upload-queue";
import styles from "./UploadPanel.module.scss";

export type UploadPanelItemProps = {
  item: UploadItem;
  onCancel?: (id: string) => void;
  onRetry?: (id: string) => void;
};

const UploadPanelItem = ({ item, onCancel, onRetry }: UploadPanelItemProps) => {
  const showProgress =
    item.status === "pending" || item.status === "uploading";
  const isIndeterminate = item.progress === undefined;
  const progressPercent =
    item.progress != null ? Math.round(item.progress * 100) : undefined;
  const canCancel = !!onCancel && item.status !== "success";
  const canRetry = !!onRetry && item.status === "error";

  return (
    <li data-status={item.status} className={styles.row}>
      <IconFile size={20} className={styles.file_icon} aria-hidden="true" />
      <div className={styles.row_main}>
        <div className={styles.row_name}>{item.name}</div>
        <div className={styles.row_meta}>
          <span>{formatSize(item.size)}</span>
          {item.status === "error" && item.error && (
            <span className={styles.error_text}>{item.error}</span>
          )}
        </div>
        {showProgress && (
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={isIndeterminate ? undefined : progressPercent}
            aria-label={`Upload progress for ${item.name}`}
            data-indeterminate={isIndeterminate ? "true" : "false"}
            className={styles.progress}
          >
            <span
              className={styles.progress_fill}
              style={
                !isIndeterminate
                  ? { inlineSize: `${progressPercent}%` }
                  : undefined
              }
            />
          </div>
        )}
      </div>
      <div className={styles.row_status}>
        {item.status === "pending" && (
          <span className={styles.status_text}>Queued</span>
        )}
        {item.status === "success" && (
          <IconCheckCircle
            className={styles.icon_success}
            aria-hidden="true"
          />
        )}
        {item.status === "error" && (
          <IconAlertTriangle
            className={styles.icon_error}
            aria-hidden="true"
          />
        )}
        {canRetry && (
          <button
            type="button"
            onClick={() => onRetry!(item.id)}
            className={styles.retry_button}
          >
            Retry
          </button>
        )}
        {canCancel && (
          <IconButton
            icon={IconX}
            aria-label={`Cancel ${item.name}`}
            onClick={() => onCancel!(item.id)}
          />
        )}
      </div>
    </li>
  );
};

UploadPanelItem.displayName = "UploadPanelItem";

export { UploadPanelItem };
