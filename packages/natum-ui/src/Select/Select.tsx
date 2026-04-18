"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { IconChevronDown, IconX } from "@natum/icons";
import { useActiveDescendant } from "../hooks/use-active-descendant";
import { useControllable } from "../hooks/use-controllable";
import { useEscapeKey } from "../hooks/use-escape-key";
import { useListboxSelection } from "../hooks/use-listbox-selection";
import { useMergedRefs } from "../hooks/use-merge-refs";
import { useTypeahead } from "../hooks/use-typeahead";
import { SelectContext } from "./context";
import { flatten } from "./flatten";
import { Listbox } from "../internal/listbox/Listbox";
import type { SelectContextValue } from "./types";
import styles from "./Select.module.scss";
import cx from "classnames";

type SelectSize = "sm" | "md" | "lg";
type SelectVariant = "outlined" | "filled";

type SelectBaseProps = {
  variant?: SelectVariant;
  size?: SelectSize;
  leftSection?: ReactNode;
  placeholder?: string;
  clearable?: boolean;
  onClear?: () => void;

  label?: ReactNode;
  helperText?: ReactNode;
  errorMessage?: ReactNode;
  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean;

  placement?: "bottom" | "top";
  maxListboxHeight?: number;

  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;

  name?: string;

  children: ReactNode;

  className?: string;
  triggerClassName?: string;
  listboxClassName?: string;
};

type SelectSingleProps = SelectBaseProps & {
  multiple?: false;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string | undefined) => void;
};

type SelectMultipleProps = SelectBaseProps & {
  multiple: true;
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  renderValue?: (selected: string[]) => ReactNode;
};

export type SelectProps = SelectSingleProps | SelectMultipleProps;

const isMultiProps = (p: SelectProps): p is SelectMultipleProps =>
  p.multiple === true;

const Select = forwardRef<HTMLButtonElement, SelectProps>((props, ref) => {
  const {
    variant = "outlined",
    size = "md",
    leftSection,
    placeholder,
    clearable = false,
    onClear,
    label,
    helperText,
    errorMessage,
    required,
    readOnly,
    disabled,
    placement = "bottom",
    maxListboxHeight = 320,
    open: openProp,
    defaultOpen,
    onOpenChange,
    name,
    children,
    className,
    triggerClassName,
    listboxClassName,
  } = props;

  // Single hook call with conditional argument (Rules of Hooks compliant).
  const selection = useListboxSelection(
    isMultiProps(props)
      ? {
          multiple: true,
          value: props.value,
          defaultValue: props.defaultValue,
          onChange: props.onChange,
        }
      : {
          multiple: false,
          value: (props as SelectSingleProps).value,
          defaultValue: (props as SelectSingleProps).defaultValue,
          onChange: (props as SelectSingleProps).onChange,
        }
  );

  // --- Flatten children ---
  const { items, tree } = useMemo(() => flatten(children), [children]);

  // --- Open/closed state ---
  const { value: isOpenBoxed, setValue: setIsOpenRaw } = useControllable<boolean>({
    value: openProp,
    defaultValue: defaultOpen ?? false,
    onChange: (v) => onOpenChange?.(v === true),
  });
  const isOpen = isOpenBoxed === true;
  const setIsOpen = useCallback((v: boolean) => setIsOpenRaw(v), [setIsOpenRaw]);

  // --- Selection handler (wraps toggle + close-on-single) ---
  const onItemSelect = useCallback(
    (value: string) => {
      if (disabled || readOnly) return;
      selection.toggle(value);
      if (!selection.isMulti) {
        setIsOpen(false);
      }
    },
    [disabled, readOnly, selection, setIsOpen]
  );

  const handleIndexSelect = useCallback(
    (i: number) => {
      const item = items[i];
      if (!item) return;
      onItemSelect(item.value);
    },
    [items, onItemSelect]
  );

  const { activeIndex, setActiveIndex, onKeyDown: onListboxKeyDown } =
    useActiveDescendant({
      count: items.length,
      isOpen,
      onSelect: handleIndexSelect,
      isDisabled: (i) => items[i]?.disabled ?? false,
    });

  // --- Typeahead ---
  const { onKeyDown: onTypeaheadKeyDown } = useTypeahead({
    items,
    getKey: (item) => item.textValue,
    onMatch: (i) => setActiveIndex(i),
    enabled: isOpen,
  });

  // --- Ids ---
  const selectId = useId();
  const triggerId = `${selectId}-trigger`;
  const listboxId = `${selectId}-listbox`;
  const messageId = `${selectId}-message`;
  const itemId = useCallback(
    (i: number) => `${selectId}-item-${i}`,
    [selectId]
  );

  // --- Refs ---
  const triggerRef = useRef<HTMLButtonElement>(null);
  const mergedTriggerRef = useMergedRefs(ref, triggerRef);
  const listboxRef = useRef<HTMLUListElement>(null);

  // --- Derived view ---
  const hasError = errorMessage != null;
  const message = errorMessage ?? helperText;
  const hasValue = selection.selected.length > 0;

  const displayValue: ReactNode = !hasValue
    ? placeholder ?? ""
    : selection.isMulti
      ? ((props as SelectMultipleProps).renderValue?.(selection.selected) ??
        `${selection.selected.length} selected`)
      : items.find((it) => it.value === selection.selected[0])?.children ??
        selection.selected[0];

  // --- Trigger keyboard ---
  const handleTriggerKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled || readOnly) return;
      if (!isOpen) {
        if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setIsOpen(true);
          return;
        }
        return;
      }
      // Open: delegate
      onListboxKeyDown(e);
      if (!e.defaultPrevented) {
        onTypeaheadKeyDown(e);
      }
      if (e.key === "Tab") {
        setIsOpen(false);
        // Do not preventDefault — allow native focus advance.
      }
    },
    [disabled, readOnly, isOpen, onListboxKeyDown, onTypeaheadKeyDown, setIsOpen]
  );

  const handleTriggerClick = useCallback(() => {
    if (disabled || readOnly) return;
    setIsOpen(!isOpen);
  }, [disabled, readOnly, isOpen, setIsOpen]);

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (disabled || readOnly) return;
      selection.clear();
      onClear?.();
    },
    [disabled, readOnly, selection, onClear]
  );

  // --- Click outside ---
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node | null;
      if (!t) return;
      const inTrigger = triggerRef.current?.contains(t);
      const inListbox = listboxRef.current?.contains(t);
      if (!inTrigger && !inListbox) setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, setIsOpen]);

  // --- Escape ---
  useEscapeKey({
    onEscape: () => setIsOpen(false),
    enabled: isOpen,
  });

  // --- Context value ---
  const ctxValue = useMemo<SelectContextValue>(
    () => ({
      selectId,
      activeIndex,
      setActiveIndex,
      isSelected: selection.isSelected,
      isMulti: selection.isMulti,
      onItemSelect,
      itemId,
    }),
    [selectId, activeIndex, setActiveIndex, selection.isSelected, selection.isMulti, onItemSelect, itemId]
  );

  return (
    <div
      className={cx(
        styles.wrapper,
        {
          [styles.error]: hasError,
          [styles.focused]: isOpen,
        },
        className
      )}
    >
      {label != null && (
        <label htmlFor={triggerId} className={styles.label}>
          {label}
          {required && (
            <span aria-hidden="true" className={styles.required_asterisk}>
              {" "}
              *
            </span>
          )}
        </label>
      )}

      <button
        ref={mergedTriggerRef}
        id={triggerId}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-activedescendant={
          isOpen && activeIndex >= 0 ? itemId(activeIndex) : undefined
        }
        aria-required={required || undefined}
        aria-invalid={hasError || undefined}
        aria-describedby={message != null ? messageId : undefined}
        disabled={disabled}
        className={cx(
          styles.trigger,
          styles[variant],
          styles[size],
          {
            [styles.open]: isOpen,
            [styles.error]: hasError,
            [styles.readonly_state]: readOnly,
            [styles.disabled_state]: disabled,
          },
          triggerClassName
        )}
        onClick={handleTriggerClick}
        onKeyDown={handleTriggerKeyDown}
      >
        {leftSection && (
          <span className={styles.left_section}>{leftSection}</span>
        )}
        <span
          className={cx(styles.value_display, {
            [styles.value_placeholder]: !hasValue,
          })}
        >
          {hasValue ? displayValue : placeholder}
        </span>
        <span className={styles.right_section}>
          {clearable && hasValue && !readOnly && !disabled && (
            <span
              className={styles.clear_button}
              role="button"
              aria-label="Clear selection"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleClear}
            >
              <IconX size="sm" color="currentColor" />
            </span>
          )}
          <IconChevronDown size="sm" color="currentColor" className={styles.chevron} />
        </span>
      </button>

      <SelectContext.Provider value={ctxValue}>
        {/* Mount children for dev warnings; markers render null */}
        {children}
      </SelectContext.Provider>

      <Listbox
        ref={listboxRef}
        isOpen={isOpen}
        triggerRef={triggerRef}
        tree={tree}
        items={items}
        activeIndex={activeIndex}
        setActiveIndex={setActiveIndex}
        isSelected={selection.isSelected}
        isMulti={selection.isMulti}
        onItemSelect={onItemSelect}
        placement={placement}
        maxHeight={maxListboxHeight}
        labelId={triggerId}
        listboxId={listboxId}
        itemId={itemId}
        className={listboxClassName}
      />

      {name &&
        selection.selected.map((v) => (
          <input key={v} type="hidden" name={name} value={v} />
        ))}

      {message != null && (
        <div
          id={messageId}
          className={cx(styles.message, {
            [styles.message_error]: hasError,
          })}
          role={hasError ? "alert" : undefined}
        >
          {message}
        </div>
      )}
    </div>
  );
});

Select.displayName = "Select";

export { Select };
