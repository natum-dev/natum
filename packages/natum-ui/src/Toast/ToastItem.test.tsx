import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import * as React from "react";
import { ToastItem } from "./ToastItem";
import type { Toast } from "./toast-store";

const minimalToast: Toast = {
  id: "test-toast-1",
  type: "info",
  message: "hello",
  duration: 0,
  createdAt: 0,
};

const noop = () => undefined;

describe("ToastItem", () => {
  it("forwards ref to the rendered toast container", () => {
    const ref = { current: null } as React.MutableRefObject<HTMLDivElement | null>;
    render(<ToastItem ref={ref} toast={minimalToast} onDismiss={noop} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("renders correctly with dir='rtl'", () => {
    const { container } = render(
      <div dir="rtl">
        <ToastItem toast={minimalToast} onDismiss={noop} />
      </div>
    );
    expect(container.firstChild).toBeInTheDocument();
  });
});
