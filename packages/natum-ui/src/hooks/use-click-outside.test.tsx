import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { useClickOutside } from "./use-click-outside";
import { useMergedRefs } from "./use-merge-refs";
import { useRef } from "react";

function Harness({
  onClickOutside,
  enabled,
}: {
  onClickOutside: () => void;
  enabled?: boolean;
}) {
  const { ref: outsideRef } = useClickOutside({ onClickOutside, enabled });

  return (
    <>
      <div ref={outsideRef} data-testid="inside">Inside</div>
      <div data-testid="outside">Outside</div>
    </>
  );
}

function MergeRefHarness({ onClickOutside }: { onClickOutside: () => void }) {
  const localRef = useRef<HTMLDivElement>(null);
  const { ref: outsideRef } = useClickOutside({ onClickOutside });
  const mergedRef = useMergedRefs(localRef, outsideRef);

  return (
    <>
      <div ref={mergedRef} data-testid="inside">Inside</div>
      <div data-testid="outside">Outside</div>
    </>
  );
}

describe("useClickOutside", () => {
  it("calls onClickOutside when clicking outside the ref element", async () => {
    const user = userEvent.setup();
    const onClickOutside = vi.fn();
    render(<Harness onClickOutside={onClickOutside} />);

    await user.click(screen.getByTestId("outside"));
    expect(onClickOutside).toHaveBeenCalledOnce();
  });

  it("does not call onClickOutside when clicking inside the ref element", async () => {
    const user = userEvent.setup();
    const onClickOutside = vi.fn();
    render(<Harness onClickOutside={onClickOutside} />);

    await user.click(screen.getByTestId("inside"));
    expect(onClickOutside).not.toHaveBeenCalled();
  });

  it("does not call onClickOutside when enabled is false", async () => {
    const user = userEvent.setup();
    const onClickOutside = vi.fn();
    render(<Harness onClickOutside={onClickOutside} enabled={false} />);

    await user.click(screen.getByTestId("outside"));
    expect(onClickOutside).not.toHaveBeenCalled();
  });

  it("works when ref is merged with other refs", async () => {
    const user = userEvent.setup();
    const onClickOutside = vi.fn();
    render(<MergeRefHarness onClickOutside={onClickOutside} />);

    await user.click(screen.getByTestId("outside"));
    expect(onClickOutside).toHaveBeenCalledOnce();

    onClickOutside.mockClear();
    await user.click(screen.getByTestId("inside"));
    expect(onClickOutside).not.toHaveBeenCalled();
  });

  it("removes listener on unmount", async () => {
    const user = userEvent.setup();
    const onClickOutside = vi.fn();
    const { unmount } = render(<Harness onClickOutside={onClickOutside} />);

    unmount();
    await user.click(document.body);
    expect(onClickOutside).not.toHaveBeenCalled();
  });
});
