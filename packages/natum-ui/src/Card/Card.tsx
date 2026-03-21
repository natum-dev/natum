import {
  forwardRef,
  type ReactNode,
  type ComponentPropsWithoutRef,
  Children,
  isValidElement,
} from "react";
import styles from "./Card.module.scss";
import cx from "classnames";

export type CardProps = Omit<ComponentPropsWithoutRef<"div">, "color"> & {
  variant?: "elevated" | "outlined" | "filled";
  elevation?: "none" | "low" | "medium" | "high";
  padding?: "none" | "small" | "medium" | "large";
  radius?: "small" | "medium" | "large";
  interactive?: boolean;
  fullWidth?: boolean;
};

type CardSectionProps = {
  children?: ReactNode;
  className?: string;
};

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = "elevated",
      elevation = "low",
      padding = "medium",
      radius = "medium",
      interactive,
      fullWidth,
      className,
      children,
      onKeyDown,
      onClick,
      ...rest
    },
    ref
  ) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (interactive && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        (e.currentTarget as HTMLDivElement).click();
      }
      onKeyDown?.(e);
    };

    const hasSections = Children.toArray(children).some(
      (child) =>
        isValidElement(child) &&
        (child.type === CardHeader ||
          child.type === CardBody ||
          child.type === CardFooter)
    );

    return (
      <div
        ref={ref}
        className={cx(
          styles.card,
          styles[variant],
          styles[`elevation_${elevation}`],
          styles[`padding_${padding}`],
          styles[`radius_${radius}`],
          {
            [styles.interactive]: interactive,
            [styles.full_width]: fullWidth,
            [styles.has_sections]: hasSections,
          },
          className
        )}
        {...(interactive
          ? { role: "button", tabIndex: 0, onKeyDown: handleKeyDown }
          : {})}
        onClick={onClick}
        {...rest}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

const CardHeader = ({ children, className }: CardSectionProps) => (
  <div className={cx(styles.header, className)}>{children}</div>
);


const CardBody = ({ children, className }: CardSectionProps) => (
  <div className={cx(styles.body, className)}>{children}</div>
);


const CardFooter = ({ children, className }: CardSectionProps) => (
  <div className={cx(styles.footer, className)}>{children}</div>
);


// Attach sub-components as static properties
const CardNamespace = Object.assign(Card, {
  Header: CardHeader,
  Body: CardBody,
  Footer: CardFooter,
});

export { CardNamespace as Card, CardHeader, CardBody, CardFooter };
export type { CardSectionProps };
