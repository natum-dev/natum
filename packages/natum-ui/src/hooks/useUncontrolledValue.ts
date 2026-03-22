import { useCallback, useState } from "react";

type UseUncontrolledValueOptions = {
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear?: () => void;
  clearable?: boolean;
};

type UseUncontrolledValueReturn = {
  isControlled: boolean;
  hasValue: boolean;
  showClear: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleClear: (inputRef: React.RefObject<HTMLInputElement | null>) => void;
};

export const useUncontrolledValue = ({
  value,
  defaultValue,
  onChange,
  onClear,
  clearable = false,
}: UseUncontrolledValueOptions): UseUncontrolledValueReturn => {
  const isControlled = value !== undefined;

  const [hasValueInternal, setHasValueInternal] = useState(
    () => (isControlled ? (value as string)?.length > 0 : (defaultValue as string)?.length > 0)
  );

  const hasValue = isControlled ? (value as string)?.length > 0 : hasValueInternal;

  const showClear = clearable && hasValue;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) {
        setHasValueInternal(e.target.value.length > 0);
      }
      onChange?.(e);
    },
    [isControlled, onChange]
  );

  const handleClear = useCallback(
    (inputRef: React.RefObject<HTMLInputElement | null>) => {
      const input = inputRef.current;
      if (!input) return;

      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value"
      )?.set;
      nativeInputValueSetter?.call(input, "");
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));

      if (!isControlled) {
        setHasValueInternal(false);
      }

      onClear?.();
      input.focus();
    },
    [isControlled, onClear]
  );

  return { isControlled, hasValue, showClear, handleChange, handleClear };
};
