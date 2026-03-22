import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useUncontrolledValue } from "./useUncontrolledValue";

describe("useUncontrolledValue", () => {
  it("returns isControlled=true when value is provided", () => {
    const { result } = renderHook(() =>
      useUncontrolledValue({ value: "hello" })
    );
    expect(result.current.isControlled).toBe(true);
  });

  it("returns isControlled=false when no value", () => {
    const { result } = renderHook(() =>
      useUncontrolledValue({})
    );
    expect(result.current.isControlled).toBe(false);
  });

  it("hasValue tracks onChange for uncontrolled", () => {
    const { result } = renderHook(() =>
      useUncontrolledValue({ defaultValue: "" })
    );
    expect(result.current.hasValue).toBe(false);

    act(() => {
      result.current.handleChange({
        target: { value: "typed" },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    expect(result.current.hasValue).toBe(true);

    act(() => {
      result.current.handleChange({
        target: { value: "" },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    expect(result.current.hasValue).toBe(false);
  });

  it("hasValue derives from value prop for controlled", () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) =>
        useUncontrolledValue({ value }),
      { initialProps: { value: "" } }
    );
    expect(result.current.hasValue).toBe(false);

    rerender({ value: "hello" });
    expect(result.current.hasValue).toBe(true);

    rerender({ value: "" });
    expect(result.current.hasValue).toBe(false);
  });

  it("handleClear fires onClear callback", () => {
    const onClear = vi.fn();
    const inputEl = document.createElement("input");
    inputEl.value = "test";
    const inputRef = { current: inputEl };

    const { result } = renderHook(() =>
      useUncontrolledValue({ defaultValue: "test", onClear })
    );

    act(() => {
      result.current.handleClear(inputRef);
    });
    expect(onClear).toHaveBeenCalledOnce();
  });

  it("handleClear resets hasValue to false for uncontrolled", () => {
    const inputEl = document.createElement("input");
    inputEl.value = "test";
    const inputRef = { current: inputEl };

    const { result } = renderHook(() =>
      useUncontrolledValue({ defaultValue: "test" })
    );
    expect(result.current.hasValue).toBe(true);

    act(() => {
      result.current.handleClear(inputRef);
    });
    expect(result.current.hasValue).toBe(false);
  });

  it("showClear reflects clearable + hasValue", () => {
    const { result: r1 } = renderHook(() =>
      useUncontrolledValue({ value: "hi", clearable: true })
    );
    expect(r1.current.showClear).toBe(true);

    const { result: r2 } = renderHook(() =>
      useUncontrolledValue({ value: "", clearable: true })
    );
    expect(r2.current.showClear).toBe(false);

    const { result: r3 } = renderHook(() =>
      useUncontrolledValue({ value: "hi", clearable: false })
    );
    expect(r3.current.showClear).toBe(false);

    const { result: r4 } = renderHook(() =>
      useUncontrolledValue({ value: "hi" })
    );
    expect(r4.current.showClear).toBe(false);
  });
});
