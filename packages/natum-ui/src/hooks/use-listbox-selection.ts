import { useCallback, useRef, useState } from "react";

type SingleProps = {
  multiple?: false;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string | undefined) => void;
};

type MultiProps = {
  multiple: true;
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
};

export type UseListboxSelectionProps = SingleProps | MultiProps;

export type UseListboxSelectionReturn = {
  selected: string[];
  isSelected: (v: string) => boolean;
  toggle: (v: string) => void;
  clear: () => void;
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
    (v: string) => {
      if (isMulti) {
        const next = currentMulti.includes(v)
          ? currentMulti.filter((x) => x !== v)
          : [...currentMulti, v];
        if (!multiIsControlled) setMultiInternal(next);
        (onChangeRef.current as MultiProps["onChange"])?.(next);
      } else {
        if (currentSingle === v) return; // no-op
        if (!singleIsControlled) setSingleInternal(v);
        (onChangeRef.current as SingleProps["onChange"])?.(v);
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

  const clear = useCallback(() => {
    if (isMulti) {
      if (!multiIsControlled) setMultiInternal([]);
      (onChangeRef.current as MultiProps["onChange"])?.([]);
    } else {
      if (!singleIsControlled) setSingleInternal(undefined);
      (onChangeRef.current as SingleProps["onChange"])?.(undefined);
    }
  }, [isMulti, singleIsControlled, multiIsControlled]);

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
