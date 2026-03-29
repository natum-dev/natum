import { type ComponentPropsWithoutRef, type ReactNode, forwardRef } from "react";
import styles from "./Figure.module.scss";
import cx from "classnames";

type FigureBaseProps = {
  layout?: "horizontal" | "vertical";
  illustration?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export type FigureProps = FigureBaseProps &
  Omit<ComponentPropsWithoutRef<"div">, keyof FigureBaseProps>;

const Figure = forwardRef<HTMLDivElement, FigureProps>(
  (
    {
      layout = "vertical",
      illustration,
      title,
      description,
      action,
      className,
      ...rest
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cx(styles.figure, styles[layout], className)}
        {...rest}
      >
        {illustration != null && (
          <div data-figure-section="illustration" className={styles.illustration}>
            {illustration}
          </div>
        )}
        <div data-figure-section="body" className={styles.body}>
          {title != null && <div className={styles.title}>{title}</div>}
          {description != null && (
            <div className={styles.description}>{description}</div>
          )}
        </div>
        {action != null && (
          <div data-figure-section="action" className={styles.action}>
            {action}
          </div>
        )}
      </div>
    );
  }
);

Figure.displayName = "Figure";

export { Figure };
