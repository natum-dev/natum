import {
  type ComponentPropsWithoutRef,
  type ComponentType,
  type ElementType,
  type ForwardedRef,
  type MouseEventHandler,
  type Ref,
  type ReactNode,
  forwardRef,
} from "react";
import cx from "classnames";
import { Tooltip } from "../Tooltip";
import { useSidebarCollapsed } from "./context";
import styles from "./Sidebar.module.scss";

type IconComponent = ComponentType<{ size?: number; className?: string }>;

type SidebarItemOwnProps = {
  icon: IconComponent;
  children?: ReactNode;
  label?: string;
  active?: boolean;
  disabled?: boolean;
  rightSection?: ReactNode;
  className?: string;
};

export type SidebarItemProps<T extends ElementType = "a"> =
  SidebarItemOwnProps & { as?: T } &
    Omit<ComponentPropsWithoutRef<T>, keyof SidebarItemOwnProps | "as">;

const SidebarItemInner = <T extends ElementType = "a">(
  {
    as,
    icon: Icon,
    children,
    label,
    active = false,
    disabled = false,
    rightSection,
    className,
    onClick,
    ...rest
  }: SidebarItemProps<T> & { onClick?: MouseEventHandler<HTMLElement> },
  ref: ForwardedRef<Element>
) => {
  const { collapsed } = useSidebarCollapsed();
  const Tag = (as ?? "a") as ElementType;
  const isAnchor = Tag === "a";
  const isButton = Tag === "button";

  const spreadProps = { ...rest } as Record<string, unknown>;
  if (isAnchor && disabled) {
    delete spreadProps.href;
  }

  const resolvedLabel =
    label ?? (typeof children === "string" ? children : undefined);

  if (collapsed && resolvedLabel === undefined && import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.warn(
      "SidebarItem: collapsed mode needs a string `children` or a `label` prop to announce the item."
    );
  }

  // If consumer provided aria-label (even explicitly `undefined`), honor that intent.
  // Otherwise derive from collapsed + resolvedLabel.
  const consumerProvidedAriaLabel = "aria-label" in spreadProps;
  const ariaLabel = consumerProvidedAriaLabel
    ? (spreadProps["aria-label"] as string | undefined)
    : collapsed && resolvedLabel !== undefined
      ? resolvedLabel
      : undefined;

  // Remove aria-label from spread so we set it once from the resolved value above.
  delete spreadProps["aria-label"];

  const itemNode = (
    <Tag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      aria-current={active ? "page" : undefined}
      aria-disabled={disabled ? "true" : undefined}
      aria-label={ariaLabel}
      disabled={isButton && disabled ? true : undefined}
      {...spreadProps}
      className={cx(
        styles.item,
        { [styles.active]: active, [styles.disabled]: disabled },
        className
      )}
      onClick={disabled ? undefined : onClick}
    >
      <Icon className={styles.item_icon} size={20} />
      <span className={styles.item_label}>{children}</span>
      {rightSection !== undefined && (
        <span className={styles.right_section}>{rightSection}</span>
      )}
    </Tag>
  );

  if (collapsed && resolvedLabel !== undefined) {
    return (
      <li>
        <Tooltip content={resolvedLabel} placement="right">
          {itemNode}
        </Tooltip>
      </li>
    );
  }

  return <li>{itemNode}</li>;
};

const SidebarItem = forwardRef(SidebarItemInner) as <
  T extends ElementType = "a"
>(
  props: SidebarItemProps<T> & { ref?: Ref<Element> }
) => JSX.Element;

(SidebarItem as { displayName?: string }).displayName = "SidebarItem";

export { SidebarItem };
