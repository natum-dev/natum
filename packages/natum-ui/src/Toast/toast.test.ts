import { describe, it, expect, beforeEach } from "vitest";
import { toast } from "./toast";
import { toastStore } from "./toast-store";

describe("toast API", () => {
  beforeEach(() => {
    toastStore.clear();
  });

  it("creates an info toast by default", () => {
    toast("Hello");
    const toasts = toastStore.getToasts();
    expect(toasts).toHaveLength(1);
    expect(toasts[0].type).toBe("info");
    expect(toasts[0].message).toBe("Hello");
  });

  it("toast.success creates a success toast", () => {
    toast.success("Done");
    expect(toastStore.getToasts()[0].type).toBe("success");
  });

  it("toast.error creates an error toast", () => {
    toast.error("Failed");
    expect(toastStore.getToasts()[0].type).toBe("error");
  });

  it("toast.warning creates a warning toast", () => {
    toast.warning("Careful");
    expect(toastStore.getToasts()[0].type).toBe("warning");
  });

  it("toast.info creates an info toast", () => {
    toast.info("FYI");
    expect(toastStore.getToasts()[0].type).toBe("info");
  });

  it("toast.dismiss removes a toast", () => {
    const id = toast("temp");
    toast.dismiss(id);
    expect(toastStore.getToasts()).toHaveLength(0);
  });

  it("toast.dismissAll clears all toasts", () => {
    toast("one");
    toast("two");
    toast.dismissAll();
    expect(toastStore.getToasts()).toHaveLength(0);
  });

  it("toast.update modifies an existing toast", () => {
    const id = toast("original");
    toast.update(id, { message: "updated" });
    expect(toastStore.getToasts()[0].message).toBe("updated");
  });
});
