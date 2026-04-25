import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useListboxSelection } from "./use-listbox-selection";

describe("useListboxSelection", () => {
  // --- Single ---
  it("single: controlled value + toggle fires onChange", () => {
    const onChange = vi.fn();
    const { result, rerender } = renderHook(
      ({ value }) =>
        useListboxSelection({
          multiple: false,
          value,
          onChange,
        }),
      { initialProps: { value: "a" as string | undefined } }
    );

    expect(result.current.selected).toEqual(["a"]);
    expect(result.current.isSelected("a")).toBe(true);
    expect(result.current.isSelected("b")).toBe(false);
    expect(result.current.isMulti).toBe(false);

    act(() => {
      result.current.toggle("b");
    });
    expect(onChange).toHaveBeenCalledWith("b", undefined);

    // simulate parent updating the prop
    rerender({ value: "b" });
    expect(result.current.selected).toEqual(["b"]);
  });

  it("single: uncontrolled defaultValue + toggle updates internal state", () => {
    const { result } = renderHook(() =>
      useListboxSelection({ multiple: false, defaultValue: "a" })
    );

    expect(result.current.selected).toEqual(["a"]);
    act(() => {
      result.current.toggle("b");
    });
    expect(result.current.selected).toEqual(["b"]);
  });

  it("single: toggling the same value is a no-op", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useListboxSelection({ multiple: false, defaultValue: "a", onChange })
    );

    act(() => {
      result.current.toggle("a");
    });
    expect(onChange).not.toHaveBeenCalled();
    expect(result.current.selected).toEqual(["a"]);
  });

  it("single: clear() sets to undefined and calls onChange(undefined)", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useListboxSelection({ multiple: false, defaultValue: "a", onChange })
    );

    act(() => {
      result.current.clear();
    });
    expect(onChange).toHaveBeenCalledWith(undefined, undefined);
    expect(result.current.selected).toEqual([]);
  });

  it("single: isSelected returns false when no value set", () => {
    const { result } = renderHook(() =>
      useListboxSelection({ multiple: false })
    );
    expect(result.current.selected).toEqual([]);
    expect(result.current.isSelected("a")).toBe(false);
  });

  // --- Multi ---
  it("multi: controlled value array + toggle adds a missing value", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useListboxSelection({
        multiple: true,
        value: ["a"],
        onChange,
      })
    );

    expect(result.current.selected).toEqual(["a"]);
    expect(result.current.isMulti).toBe(true);

    act(() => {
      result.current.toggle("b");
    });
    expect(onChange).toHaveBeenCalledWith(["a", "b"], undefined);
  });

  it("multi: toggling an existing value removes it", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useListboxSelection({
        multiple: true,
        value: ["a", "b"],
        onChange,
      })
    );

    act(() => {
      result.current.toggle("a");
    });
    expect(onChange).toHaveBeenCalledWith(["b"], undefined);
  });

  it("multi: toggle on empty array adds", () => {
    const { result } = renderHook(() =>
      useListboxSelection({ multiple: true, defaultValue: [] })
    );

    act(() => {
      result.current.toggle("x");
    });
    expect(result.current.selected).toEqual(["x"]);
  });

  it("multi: uncontrolled with defaultValue=[]", () => {
    const { result } = renderHook(() =>
      useListboxSelection({ multiple: true, defaultValue: [] })
    );
    expect(result.current.selected).toEqual([]);
  });

  it("multi: clear() sets to [] and calls onChange([])", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useListboxSelection({
        multiple: true,
        defaultValue: ["a", "b"],
        onChange,
      })
    );

    act(() => {
      result.current.clear();
    });
    expect(onChange).toHaveBeenCalledWith([], undefined);
    expect(result.current.selected).toEqual([]);
  });

  it("multi: isSelected checks membership", () => {
    const { result } = renderHook(() =>
      useListboxSelection({ multiple: true, defaultValue: ["a", "c"] })
    );
    expect(result.current.isSelected("a")).toBe(true);
    expect(result.current.isSelected("b")).toBe(false);
    expect(result.current.isSelected("c")).toBe(true);
  });

  it("selected is always an array (single with no value → [])", () => {
    const { result } = renderHook(() =>
      useListboxSelection({ multiple: false })
    );
    expect(Array.isArray(result.current.selected)).toBe(true);
    expect(result.current.selected).toEqual([]);
  });

  it("isMulti reflects the prop", () => {
    const single = renderHook(() =>
      useListboxSelection({ multiple: false })
    );
    const multi = renderHook(() =>
      useListboxSelection({ multiple: true })
    );
    expect(single.result.current.isMulti).toBe(false);
    expect(multi.result.current.isMulti).toBe(true);
  });

  it("single default when neither value nor defaultValue provided", () => {
    const { result } = renderHook(() =>
      useListboxSelection({ multiple: false })
    );
    expect(result.current.selected).toEqual([]);
  });
});
