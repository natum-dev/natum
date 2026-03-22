import { useState } from "react";

type UseControllableProps<T> = {
  value?: T | null;
  defaultValue?: T;
  onChange?: (value: T | null) => void;
};

type UseControllableReturn<T> = {
  value: T | null;
  setValue: (next: T | null) => void;
  isControlled: boolean;
};

export function useControllable<T>(
  props: UseControllableProps<T>
): UseControllableReturn<T> {
  const isControlled = props.value !== undefined;
  const [internal, setInternal] = useState<T | null>(
    props.defaultValue ?? null
  );

  const currentValue = isControlled ? props.value! : internal;

  const setValue = (next: T | null) => {
    if (!isControlled) setInternal(next);
    props.onChange?.(next);
  };

  return { value: currentValue, setValue, isControlled };
}
