"use client";

import {
  type ComponentPropsWithoutRef,
  type ReactElement,
  type ReactNode,
  Children,
  forwardRef,
  useCallback,
  useRef,
  useState,
} from "react";
import type { BreadcrumbItemProps } from "./BreadcrumbItem";
import { useClickOutside } from "../hooks/use-click-outside";
import { useEscapeKey } from "../hooks/use-escape-key";
import styles from "./Breadcrumb.module.scss";
import cx from "classnames";

type BreadcrumbBaseProps = {
  separator?: ReactNode;
  maxVisible?: number;
  children: ReactElement<BreadcrumbItemProps> | ReactElement<BreadcrumbItemProps>[];
  className?: string;
};

export type BreadcrumbProps = BreadcrumbBaseProps &
  Omit<ComponentPropsWithoutRef<"nav">, keyof BreadcrumbBaseProps>;

const DefaultSeparator = () => (
  <span className={styles.separator} aria-hidden="true">›</span>
);

const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(
  ({ separator, maxVisible = 4, children, className, ...rest }, ref) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const ellipsisRef = useRef<HTMLButtonElement>(null);

    const items = Children.toArray(children) as ReactElement<BreadcrumbItemProps>[];
    const shouldCollapse = items.length > maxVisible;

    const visibleTailCount = Math.max(maxVisible - 2, 1);
    const visibleItems = shouldCollapse
      ? [items[0], ...items.slice(items.length - visibleTailCount)]
      : items;
    const hiddenItems = shouldCollapse
      ? items.slice(1, items.length - visibleTailCount)
      : [];

    const closeDropdown = useCallback(() => {
      setDropdownOpen(false);
      ellipsisRef.current?.focus();
    }, []);

    const { ref: outsideRef } = useClickOutside({
      onClickOutside: () => setDropdownOpen(false),
      enabled: dropdownOpen,
    });

    useEscapeKey({ onEscape: closeDropdown, enabled: dropdownOpen });

    const handleDropdownKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          const container = (e.currentTarget as HTMLElement).querySelector("ul");
          const focusable = container?.querySelectorAll<HTMLElement>("a, button");
          if (!focusable?.length) return;
          const current = document.activeElement;
          const idx = Array.from(focusable).indexOf(current as HTMLElement);
          const next =
            e.key === "ArrowDown"
              ? focusable[(idx + 1) % focusable.length]
              : focusable[(idx - 1 + focusable.length) % focusable.length];
          next?.focus();
        }
      },
      []
    );

    const renderSeparator = (key: string) =>
      separator ? (
        <span key={key} className={styles.separator} aria-hidden="true">{separator}</span>
      ) : (
        <DefaultSeparator key={key} />
      );

    const renderSegment = (
      item: ReactElement<BreadcrumbItemProps>,
      index: number,
      isLast: boolean
    ) => {
      const { href, children: label, onClick } = item.props;

      return (
        <li key={index} className={styles.item}>
          {isLast ? (
            <span className={styles.current} aria-current="page">{label}</span>
          ) : (
            <>
              <a href={href} className={styles.link} onClick={onClick}>{label}</a>
              {renderSeparator(`sep-${index}`)}
            </>
          )}
        </li>
      );
    };

    return (
      <nav
        ref={ref}
        aria-label="Breadcrumb"
        className={cx(styles.breadcrumb, className)}
        {...rest}
      >
        <ol className={styles.list}>
          {shouldCollapse ? (
            <>
              {renderSegment(visibleItems[0], 0, false)}
              <li ref={outsideRef} className={styles.item} onKeyDown={handleDropdownKeyDown}>
                <button
                  ref={ellipsisRef}
                  type="button"
                  className={styles.ellipsis_button}
                  aria-label="Show hidden breadcrumbs"
                  aria-expanded={dropdownOpen}
                  onClick={() => setDropdownOpen((v) => !v)}
                >
                  …
                </button>
                {dropdownOpen && (
                  <ul
                    className={styles.dropdown}
                    role="menu"
                  >
                    {hiddenItems.map((item, i) => (
                      <li key={i} role="menuitem">
                        <a
                          href={item.props.href}
                          className={styles.dropdown_link}
                          onClick={(e) => {
                            item.props.onClick?.(e);
                            setDropdownOpen(false);
                          }}
                        >
                          {item.props.children}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
                {renderSeparator("sep-ellipsis")}
              </li>
              {visibleItems.slice(1).map((item, i) => {
                const isLast = i === visibleItems.length - 2;
                return renderSegment(item, i + 1000, isLast);
              })}
            </>
          ) : (
            items.map((item, i) =>
              renderSegment(item, i, i === items.length - 1)
            )
          )}
        </ol>
      </nav>
    );
  }
);

Breadcrumb.displayName = "Breadcrumb";

export { Breadcrumb };
export { BreadcrumbItem } from "./BreadcrumbItem";
export type { BreadcrumbItemProps } from "./BreadcrumbItem";
