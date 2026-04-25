import {
  forwardRef,
  useEffect,
  useState,
  type HTMLAttributes,
} from "react";
import { Spinner } from "../Spinner";
import { Figure } from "../Figure";
import { Typography } from "../Typography";
import { IconXCircle } from "@natum/icons";
import styles from "./ImagePreview.module.scss";
import cx from "classnames";

type ImagePreviewStatus = "loading" | "loaded" | "error";

type ImagePreviewBaseProps = {
  src: string;
  alt: string;
  onLoad?: () => void;
  onError?: () => void;
  className?: string;
};

export type ImagePreviewProps = ImagePreviewBaseProps &
  Omit<HTMLAttributes<HTMLDivElement>, "children" | keyof ImagePreviewBaseProps>;

const ImagePreview = forwardRef<HTMLDivElement, ImagePreviewProps>(
  ({ src, alt, onLoad, onError, className, ...rest }, ref) => {
    const [status, setStatus] = useState<ImagePreviewStatus>("loading");

    useEffect(() => {
      setStatus("loading");
    }, [src]);

    const handleLoad = () => {
      setStatus("loaded");
      onLoad?.();
    };

    const handleError = () => {
      setStatus("error");
      onError?.();
    };

    return (
      <div
        ref={ref}
        className={cx(styles.image_preview, className)}
        data-status={status}
        {...rest}
      >
        {status === "loading" && <Spinner label="Loading preview" />}

        {status !== "error" && (
          <img
            src={src}
            alt={alt}
            className={styles.image}
            onLoad={handleLoad}
            onError={handleError}
          />
        )}

        {status === "error" && (
          <Figure
            layout="vertical"
            illustration={<IconXCircle size="lg" color="currentColor" />}
            description={
              <Typography variant="body2" color="secondary">
                Preview unavailable
              </Typography>
            }
          />
        )}
      </div>
    );
  }
);

ImagePreview.displayName = "ImagePreview";

export { ImagePreview };
