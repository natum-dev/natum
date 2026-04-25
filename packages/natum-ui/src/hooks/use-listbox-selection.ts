import { useCallback, useRef, useState } from "react";
import type { SyntheticEvent } from "react";

type SingleProps = {
  multiple?: false;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string | undefined, event?: SyntheticEvent) => void;
};

type MultiProps = {
  multiple: true;
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[], event?: SyntheticEvent) => void;
};

export type UseListboxSelectionProps = SingleProps | MultiProps;

export type UseListboxSelectionReturn = {
  selected: string[];
  isSelected: (v: string) => boolean;
  toggle: (v: string, event?: SyntheticEvent) => void;
  clear: (event?: SyntheticEvent) => void;
  isMulti: boolean;
};

export function useListboxSelection(
  props: UseListboxSelectionProps
): UseListboxSelectionReturn {
  const isMulti = props.multiple === true;

  // Single branch
  const singleIsControlled = !isMulti && (props as SingleProps).value !== undefined;
  const [singleInternal, setSingleInternal] = useState<string | undefined>(
    !isMulti ? (props as SingleProps).defaultValue : undefined
  );

  // Multi branch
  const multiIsControlled = isMulti && (props as MultiProps).value !== undefined;
  const [multiInternal, setMultiInternal] = useState<string[]>(
    isMulti ? (props as MultiProps).defaultValue ?? [] : []
  );

  // Resolved "current" value per branch
  const currentSingle = singleIsControlled
    ? (props as SingleProps).value
    : singleInternal;
  const currentMulti = multiIsControlled
    ? (props as MultiProps).value!
    : multiInternal;

  // Keep latest onChange in a ref so toggle's identity doesn't churn when
  // callers pass inline functions.
  const onChangeRef = useRef(props.onChange);
  onChangeRef.current = props.onChange;

  const toggle = useCallback(
    (v: string, event?: SyntheticEvent) => {
      if (isMulti) {
        const next = currentMulti.includes(v)
          ? currentMulti.filter((x) => x !== v)
          : [...currentMulti, v];
        if (!multiIsControlled) setMultiInternal(next);
        (onChangeRef.current as MultiProps["onChange"])?.(next, event);
      } else {
        if (currentSingle === v) return; // no-op
        if (!singleIsControlled) setSingleInternal(v);
        (onChangeRef.current as SingleProps["onChange"])?.(v, event);
      }
    },
    [
      isMulti,
      currentMulti,
      currentSingle,
      singleIsControlled,
      multiIsControlled,
    ]
  );

  const clear = useCallback(
    (event?: SyntheticEvent) => {
      if (isMulti) {
        if (!multiIsControlled) setMultiInternal([]);
        (onChangeRef.current as MultiProps["onChange"])?.([], event);
      } else {
        if (!singleIsControlled) setSingleInternal(undefined);
        (onChangeRef.current as SingleProps["onChange"])?.(undefined, event);
      }
    },
    [isMulti, singleIsControlled, multiIsControlled]
  );

  const selected = isMulti
    ? currentMulti
    : currentSingle !== undefined
      ? [currentSingle]
      : [];

  const isSelected = useCallback(
    (v: string) => selected.includes(v),
    [selected]
  );

  return {
    selected,
    isSelected,
    toggle,
    clear,
    isMulti,
  };
}
