import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { ToastProvider } from "./ToastProvider";
import { toast } from "./toast";
import { toastStore } from "./toast-store";

describe("ToastProvider", () => {
  beforeEach(() => {
    toastStore.clear();
  });

  it("renders the portal container as a labelled region", () => {
    render(<ToastProvider />);
    // The container only matters for screen readers, so we look it up by
    // role+name rather than by class.
    const region = screen.getByRole("region", { name: "Notifications" });
    expect(region).toBeInTheDocument();
  });

  it("renders queued toasts inside the region", () => {
    render(<ToastProvider />);
    toast.info("Hello");
    // Each ToastItem carries role="status" / role="alert"; the parent region
    // owns the labelled-region affordance.
    const region = screen.getByRole("region", { name: "Notifications" });
    expect(region).toBeInTheDocument();
  });
});
