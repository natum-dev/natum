import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useControllable } from "./use-controllable";

describe("useControllable", () => {
  // --- isControlled ---
  it("isControlled=true when value is provided", () => {
    const { result } = renderHook(() =>
      useControllable({ value: "hello" })
    );
    expect(result.current.isControlled).toBe(true);
  });

  it("isControlled=false when value is undefined", () => {
    const { result } = renderHook(() => useControllable({}));
    expect(result.current.isControlled).toBe(false);
  });

  it("isControlled=true when value is null", () => {
    const { result } = renderHook(() =>
      useControllable({ value: null })
    );
    expect(result.current.isControlled).toBe(true);
  });

  // --- Controlled mode ---
  it("controlled: returns provided value", () => {
    const { result } = renderHook(() =>
      useControllable({ value: "controlled" })
    );
    expect(result.current.value).toBe("controlled");
  });

  it("controlled: setValue calls onChange but does not update internal state", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useControllable({ value: "initial", onChange })
    );

    act(() => {
      result.current.setValue("new");
    });

    expect(onChange).toHaveBeenCalledWith("new");
    // Value stays the same because it's controlled externally
    expect(result.current.value).toBe("initial");
  });

  // --- Uncontrolled mode ---
  it("uncontrolled: returns internal state", () => {
    const { result } = renderHook(() =>
      useControllable({ defaultValue: "default" })
    );
    expect(result.current.value).toBe("default");
  });

  it("uncontrolled: setValue updates internal state AND calls onChange", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useControllable({ defaultValue: "start", onChange })
    );

    act(() => {
      result.current.setValue("updated");
    });

    expect(result.current.value).toBe("updated");
    expect(onChange).toHaveBeenCalledWith("updated");
  });

  it("uncontrolled: defaults to null when no defaultValue", () => {
    const { result } = renderHook(() => useControllable({}));
    expect(result.current.value).toBeNull();
  });

  // --- Null handling ---
  it("setValue(null) works correctly", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useControllable({ defaultValue: "has-value", onChange })
    );

    act(() => {
      result.current.setValue(null);
    });

    expect(result.current.value).toBeNull();
    expect(onChange).toHaveBeenCalledWith(null);
  });

  // --- Generic types ---
  it("works with number type", () => {
    const { result } = renderHook(() =>
      useControllable<number>({ defaultValue: 42 })
    );
    expect(result.current.value).toBe(42);

    act(() => {
      result.current.setValue(100);
    });
    expect(result.current.value).toBe(100);
  });

  it("works with object type", () => {
    const obj = { name: "test", count: 1 };
    const { result } = renderHook(() =>
      useControllable({ defaultValue: obj })
    );
    expect(result.current.value).toEqual({ name: "test", count: 1 });

    const next = { name: "updated", count: 2 };
    act(() => {
      result.current.setValue(next);
    });
    expect(result.current.value).toEqual(next);
  });

  // --- Default value for uncontrolled ---
  it("uses defaultValue as initial state for uncontrolled", () => {
    const { result } = renderHook(() =>
      useControllable({ defaultValue: "initial" })
    );
    expect(result.current.value).toBe("initial");
  });
});
