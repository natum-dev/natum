import { describe, it, expect, beforeEach, vi } from "vitest";
import { toastStore } from "./toast-store";

describe("toastStore", () => {
  beforeEach(() => {
    toastStore.clear();
  });

  it("starts empty", () => {
    expect(toastStore.getToasts()).toHaveLength(0);
  });

  it("adds a toast and returns its id", () => {
    const id = toastStore.addToast({ message: "Hello" });
    expect(id).toBeDefined();
    const toasts = toastStore.getToasts();
    expect(toasts).toHaveLength(1);
    expect(toasts[0].message).toBe("Hello");
    expect(toasts[0].type).toBe("info");
    expect(toasts[0].duration).toBe(5000);
  });

  it("uses provided id", () => {
    const id = toastStore.addToast({ id: "custom", message: "Hi" });
    expect(id).toBe("custom");
  });

  it("updates an existing toast if same id is added again", () => {
    toastStore.addToast({ id: "t1", message: "first" });
    toastStore.addToast({ id: "t1", message: "updated", type: "success" });
    const toasts = toastStore.getToasts();
    expect(toasts).toHaveLength(1);
    expect(toasts[0].message).toBe("updated");
    expect(toasts[0].type).toBe("success");
  });

  it("updates a toast via updateToast", () => {
    const id = toastStore.addToast({ message: "original" });
    toastStore.updateToast(id, { message: "changed" });
    expect(toastStore.getToasts()[0].message).toBe("changed");
  });

  it("removes a toast", () => {
    const id = toastStore.addToast({ message: "bye" });
    toastStore.removeToast(id);
    expect(toastStore.getToasts()).toHaveLength(0);
  });

  it("clears all toasts", () => {
    toastStore.addToast({ message: "1" });
    toastStore.addToast({ message: "2" });
    toastStore.clear();
    expect(toastStore.getToasts()).toHaveLength(0);
  });

  it("notifies subscribers on changes", () => {
    const listener = vi.fn();
    const unsub = toastStore.subscribe(listener);
    toastStore.addToast({ message: "notify" });
    expect(listener).toHaveBeenCalledOnce();
    unsub();
    toastStore.addToast({ message: "no notify" });
    expect(listener).toHaveBeenCalledOnce();
  });
});
