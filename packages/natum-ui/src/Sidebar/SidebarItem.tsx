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
import { useSidebarCollapsed } from "./context";
import styles from "./Sidebar.module.scss";

type IconComponent = ComponentType<{ size?: number; className?: string }>;

type SidebarItemOwnProps = {
  icon: IconComponent;
  children?: ReactNode;
  active?: boolean;
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
    active = false,
    className,
    onClick,
    ...rest
  }: SidebarItemProps<T> & { onClick?: MouseEventHandler<HTMLElement> },
  ref: ForwardedRef<Element>
) => {
  useSidebarCollapsed();
  const Tag = (as ?? "a") as ElementType;

  return (
    <li>
      <Tag
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ref={ref as any}
        aria-current={active ? "page" : undefined}
        {...rest}
        className={cx(styles.item, { [styles.active]: active }, className)}
        onClick={onClick}
      >
        <Icon className={styles.item_icon} size={20} />
        <span className={styles.item_label}>{children}</span>
      </Tag>
    </li>
  );
};

const SidebarItem = forwardRef(SidebarItemInner) as <
  T extends ElementType = "a"
>(
  props: SidebarItemProps<T> & { ref?: Ref<Element> }
) => JSX.Element;

(SidebarItem as { displayName?: string }).displayName = "SidebarItem";

export { SidebarItem };
