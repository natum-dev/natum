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
import { IconChevronDown } from "@natum/icons";
import { useActiveDescendant } from "../hooks/use-active-descendant";
import { useControllable } from "../hooks/use-controllable";
import { useEscapeKey } from "../hooks/use-escape-key";
import { useListboxSelection } from "../hooks/use-listbox-selection";
import { useMergedRefs } from "../hooks/use-merge-refs";
import { Listbox } from "../internal/listbox/Listbox";
import type { FlatItem } from "../internal/listbox/types";
import { ComboboxContext, type ComboboxContextValue } from "./context";
import { flatten } from "./flatten";
import styles from "./Combobox.module.scss";
import cx from "classnames";

type ComboboxSize = "sm" | "md" | "lg";
type ComboboxVariant = "outlined" | "filled";

type ComboboxBaseProps = {
  variant?: ComboboxVariant;
  size?: ComboboxSize;
  leftSection?: ReactNode;

  placeholder?: string;
  searchValue?: string;
  defaultSearchValue?: string;
  onSearchChange?: (query: string) => void;

  filter?: (query: string, item: FlatItem) => boolean;

  loading?: boolean;
  error?: ReactNode;
  emptyContent?: ReactNode;
  noMatchContent?: ReactNode;

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
  inputClassName?: string;
  listboxClassName?: string;
};

type ComboboxSingleProps = ComboboxBaseProps & {
  multiple?: false;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string | undefined) => void;
};

type ComboboxMultipleProps = ComboboxBaseProps & {
  multiple: true;
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
};

export type ComboboxProps = ComboboxSingleProps | ComboboxMultipleProps;

const isMultiProps = (p: ComboboxProps): p is ComboboxMultipleProps =>
  p.multiple === true;

const Combobox = forwardRef<HTMLInputElement, ComboboxProps>((props, ref) => {
  const {
    variant = "outlined",
    size = "md",
    leftSection,
    placeholder,
    searchValue: searchValueProp,
    defaultSearchValue,
    onSearchChange,
    loading,
    error,
    emptyContent,
    noMatchContent,
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
    children,
    className,
    inputClassName,
    listboxClassName,
  } = props;

  // --- Selection state (single hook call with conditional arg; Rules of Hooks compliant) ---
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
          value: (props as ComboboxSingleProps).value,
          defaultValue: (props as ComboboxSingleProps).defaultValue,
          onChange: (props as ComboboxSingleProps).onChange,
        }
  );

  // --- Flatten children ---
  const { items: allItems, tree: allTree } = useMemo(
    () => flatten(children),
    [children]
  );

  // Scaffolding: visible = all. Filtering added in Task 6.
  const visibleItems = allItems;
  const visibleTree = allTree;

  // --- Search state (controlled or uncontrolled) ---
  const { value: searchBoxed, setValue: setSearchRaw } = useControllable<string>(
    {
      value: searchValueProp,
      defaultValue: defaultSearchValue ?? "",
      onChange: (v) => onSearchChange?.(v ?? ""),
    }
  );
  const searchValue = searchBoxed ?? "";
  const setSearchValue = useCallback(
    (v: string) => setSearchRaw(v),
    [setSearchRaw]
  );

  // --- Open/closed state ---
  const { value: isOpenBoxed, setValue: setIsOpenRaw } = useControllable<boolean>(
    {
      value: openProp,
      defaultValue: defaultOpen ?? false,
      onChange: (v) => onOpenChange?.(v === true),
    }
  );
  const isOpen = isOpenBoxed === true;
  const setOpen = useCallback((v: boolean) => setIsOpenRaw(v), [setIsOpenRaw]);

  // --- Selection handler (scaffolding — Task 7 may refine) ---
  const onItemSelect = useCallback(
    (value: string) => {
      if (disabled || readOnly) return;
      selection.toggle(value);
      if (!selection.isMulti) {
        setOpen(false);
        setSearchValue("");
      } else {
        setSearchValue("");
      }
    },
    [disabled, readOnly, selection, setOpen, setSearchValue]
  );

  const handleIndexSelect = useCallback(
    (i: number) => {
      const item = visibleItems[i];
      if (!item) return;
      onItemSelect(item.value);
    },
    [visibleItems, onItemSelect]
  );

  const { activeIndex, setActiveIndex, onKeyDown: onListboxKeyDown } =
    useActiveDescendant({
      count: visibleItems.length,
      isOpen,
      onSelect: handleIndexSelect,
      isDisabled: (i) => visibleItems[i]?.disabled ?? false,
    });

  // --- Ids ---
  const comboboxId = useId();
  const inputId = `${comboboxId}-input`;
  const listboxId = `${comboboxId}-listbox`;
  const messageId = `${comboboxId}-message`;
  const itemId = useCallback(
    (i: number) => `${comboboxId}-item-${i}`,
    [comboboxId]
  );

  // --- Refs ---
  const inputRef = useRef<HTMLInputElement>(null);
  const mergedInputRef = useMergedRefs(ref, inputRef);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);

  // --- Derived ---
  const hasError = errorMessage != null;
  const message = errorMessage ?? helperText;

  const labelFor = useCallback(
    (value: string): ReactNode => {
      const item = allItems.find((it) => it.value === value);
      return item?.children ?? value;
    },
    [allItems]
  );

  const selectedSingleLabel = useMemo<string>(() => {
    if (selection.isMulti || selection.selected.length === 0) return "";
    const lbl = labelFor(selection.selected[0]);
    return typeof lbl === "string" ? lbl : "";
  }, [selection.isMulti, selection.selected, labelFor]);

  // Input display: typing query when non-empty, otherwise the selected label.
  // Keys on searchValue (not isFocused) so Escape — which clears searchValue —
  // reverts the input even though focus remains.
  const inputDisplayValue = selection.isMulti
    ? searchValue
    : searchValue !== ""
      ? searchValue
      : selectedSingleLabel;

  const placeholderToShow = selection.isMulti
    ? selection.selected.length > 0
      ? ""
      : placeholder ?? ""
    : inputDisplayValue
      ? ""
      : placeholder ?? "";

  // --- Handlers ---
  const handleContainerMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (disabled || readOnly) return;
      if (e.target !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
        if (!isOpen) setOpen(true);
      }
    },
    [disabled, readOnly, isOpen, setOpen]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (readOnly || disabled) return;
      setSearchValue(e.target.value);
      if (!isOpen) setOpen(true);
    },
    [readOnly, disabled, isOpen, setOpen, setSearchValue]
  );

  const handleInputClick = useCallback(() => {
    if (readOnly || disabled) return;
    if (!isOpen) setOpen(true);
  }, [readOnly, disabled, isOpen, setOpen]);

  const handleInputFocus = useCallback(() => {
    if (!selection.isMulti && selection.selected.length > 0 && inputRef.current) {
      const el = inputRef.current;
      requestAnimationFrame(() => el.select());
    }
  }, [selection.isMulti, selection.selected]);

  const handleInputBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      if (containerRef.current?.contains(e.relatedTarget as Node)) return;
      setSearchValue("");
      setOpen(false);
    },
    [setOpen, setSearchValue]
  );

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (readOnly || disabled) return;
      // Space must pass through to the native input.
      if (e.key === " ") return;
      // Tab closes and lets native focus advance — handle before delegation so a
      // future useActiveDescendant change that starts handling Tab can't steal it.
      if (e.key === "Tab") {
        setOpen(false);
        return;
      }
      if (e.key.length === 1 && !isOpen) setOpen(true);
      onListboxKeyDown(e);
    },
    [readOnly, disabled, isOpen, setOpen, onListboxKeyDown]
  );

  // --- Click outside (inline, since useClickOutside is single-ref) ---
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node | null;
      if (!t) return;
      const inContainer = containerRef.current?.contains(t);
      const inListbox = listboxRef.current?.contains(t);
      if (!inContainer && !inListbox) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, setOpen]);

  // --- Escape ---
  useEscapeKey({
    onEscape: () => {
      setSearchValue("");
      setOpen(false);
    },
    enabled: isOpen,
  });

  // --- Context for marker orphan detection ---
  const ctxValue = useMemo<ComboboxContextValue>(
    () => ({ comboboxId }),
    [comboboxId]
  );

  return (
    <div className={cx(styles.wrapper, { [styles.error]: hasError }, className)}>
      {label != null && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
          {required && (
            <span aria-hidden="true" className={styles.required_asterisk}>
              {" "}
              *
            </span>
          )}
        </label>
      )}

      <div
        ref={containerRef}
        className={cx(
          styles.input_container,
          styles[variant],
          styles[size],
          {
            [styles.open]: isOpen,
            [styles.error]: hasError,
            [styles.readonly_state]: readOnly,
            [styles.disabled_state]: disabled,
          }
        )}
        onMouseDown={handleContainerMouseDown}
      >
        {leftSection && (
          <span className={styles.left_section}>{leftSection}</span>
        )}

        <input
          ref={mergedInputRef}
          id={inputId}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-activedescendant={
            isOpen && activeIndex >= 0 ? itemId(activeIndex) : undefined
          }
          aria-required={required || undefined}
          aria-invalid={hasError || undefined}
          aria-describedby={message != null ? messageId : undefined}
          placeholder={placeholderToShow}
          value={inputDisplayValue}
          disabled={disabled}
          readOnly={readOnly}
          className={cx(styles.input, inputClassName)}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onChange={handleInputChange}
          onClick={handleInputClick}
          onKeyDown={handleInputKeyDown}
        />

        <span className={styles.right_section}>
          <IconChevronDown
            size="sm"
            color="currentColor"
            className={cx(styles.chevron, { [styles.chevron_open]: isOpen })}
          />
        </span>
      </div>

      <ComboboxContext.Provider value={ctxValue}>
        {/* Mount children for marker dev warnings; markers return null. */}
        {children}
      </ComboboxContext.Provider>

      <Listbox
        ref={listboxRef}
        isOpen={isOpen}
        triggerRef={containerRef}
        tree={visibleTree}
        items={visibleItems}
        activeIndex={activeIndex}
        setActiveIndex={setActiveIndex}
        isSelected={selection.isSelected}
        isMulti={selection.isMulti}
        onItemSelect={onItemSelect}
        placement={placement}
        maxHeight={maxListboxHeight}
        labelId={inputId}
        listboxId={listboxId}
        itemId={itemId}
        loading={loading}
        error={error}
        emptyContent={emptyContent}
        noMatchContent={noMatchContent}
        query={searchValue}
        className={listboxClassName}
      />

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

Combobox.displayName = "Combobox";

export { Combobox };
