"use client";

import { forwardRef, useEffect, useState } from "react";
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
      onSubmit: _onSubmit,
      debounceMs: _debounceMs = 250,
      clearable = true,
      ...rest
    },
    ref
  ) => {
    void _onSubmit;
    void _debounceMs;
    // Internal raw state — DOM input always reflects the latest keystroke
    // immediately. External `value` changes sync back via effect.
    const [rawValue, setRawValue] = useState<string>(value ?? defaultValue);

    useEffect(() => {
      if (value !== undefined) setRawValue(value);
    }, [value]);

    return (
      <TextField
        ref={ref}
        type="search"
        leftSection={<IconSearch aria-hidden="true" />}
        clearable={clearable}
        value={rawValue}
        onChange={(e) => {
          // Scaffold: synchronous passthrough. Debounce lands in Task 3.
          const next = e.target.value;
          setRawValue(next);
          onChange?.(next);
        }}
        {...rest}
      />
    );
  }
);

SearchInput.displayName = "SearchInput";
export { SearchInput };
