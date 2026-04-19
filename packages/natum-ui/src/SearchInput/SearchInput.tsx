/// <reference types="vite/client" />
"use client";

import { forwardRef, useEffect, useRef, useState } from "react";
import type { ComponentPropsWithoutRef } from "react";
import { IconSearch } from "@natum/icons";
import { TextField } from "../TextField";
import type { TextFieldProps } from "../TextField";

type SearchInputOwnProps = {
  value?: string;
  defaultValue?: string;
  /**
   * Fires after typing pauses for `debounceMs` — NOT on every keystroke.
   * Also fires immediately on Enter, blur, and clear (pending timer flushed).
   * The input itself stays responsive to keystrokes independently of this
   * callback.
   */
  onChange?: (value: string) => void;
  /** Fires on Enter. The pending debounce timer is flushed first. */
  onSubmit?: (value: string) => void;
  /** Default 250ms. `0` still dispatches async via setTimeout(…, 0). */
  debounceMs?: number;
};

type SearchInputForwardedProps = Pick<
  TextFieldProps,
  | "size"
  | "variant"
  | "color"
  | "placeholder"
  | "disabled"
  | "readOnly"
  | "clearable"
  | "className"
  | "inputClassName"
  | "id"
  | "name"
  | "autoFocus"
  | "aria-label"
  | "aria-labelledby"
> &
  Omit<
    ComponentPropsWithoutRef<"input">,
    "type" | "value" | "defaultValue" | "onChange" | "onSubmit" | "size" | "color"
  >;

export type SearchInputProps = SearchInputOwnProps & SearchInputForwardedProps;

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      value,
      defaultValue = "",
      onChange,
      onSubmit,
      debounceMs = 250,
      clearable = true,
      onKeyDown,
      onBlur,
      ...rest
    },
    ref
  ) => {
    if (import.meta.env.DEV) {
      const restRecord = rest as Record<string, unknown>;
      const ariaLabel = restRecord["aria-label"];
      const ariaLabelledBy = restRecord["aria-labelledby"];
      const hasAccessibleName =
        (typeof ariaLabel === "string" && ariaLabel.length > 0) ||
        typeof ariaLabelledBy === "string";
      if (!hasAccessibleName) {
        console.warn(
          "SearchInput: no accessible name. Supply `aria-label` or `aria-labelledby`."
        );
      }
    }

    const [rawValue, setRawValue] = useState<string>(value ?? defaultValue);

    useEffect(() => {
      if (value !== undefined) setRawValue(value);
    }, [value]);

    const timerRef = useRef<number | null>(null);
    const pendingRef = useRef<string | null>(null);

    const cancelPending = () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
        pendingRef.current = null;
      }
    };

    const flush = () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
        const pending = pendingRef.current;
        pendingRef.current = null;
        if (pending !== null) onChange?.(pending);
      }
    };

    const schedule = (next: string) => {
      cancelPending();
      pendingRef.current = next;
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;
        pendingRef.current = null;
        onChange?.(next);
      }, Math.max(0, debounceMs));
    };

    useEffect(() => cancelPending, []);

    return (
      <TextField
        ref={ref}
        type="search"
        leftSection={<IconSearch aria-hidden="true" />}
        clearable={clearable}
        value={rawValue}
        onChange={(e) => {
          const next = e.target.value;
          setRawValue(next);
          schedule(next);
        }}
        onKeyDown={(e) => {
          onKeyDown?.(e);
          if (e.defaultPrevented) return;
          if (e.key === "Enter") {
            flush();
            onSubmit?.(rawValue);
          }
        }}
        onBlur={(e) => {
          onBlur?.(e);
          flush();
        }}
        onClear={() => {
          cancelPending();
          setRawValue("");
          onChange?.("");
        }}
        {...rest}
      />
    );
  }
);

SearchInput.displayName = "SearchInput";
export { SearchInput };
