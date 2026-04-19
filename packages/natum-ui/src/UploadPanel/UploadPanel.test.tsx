import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UploadPanel } from "./UploadPanel";
import type { UploadItem } from "../hooks/use-upload-queue";

const mk = (
  id: string,
  status: UploadItem["status"],
  overrides: Partial<UploadItem> = {}
): UploadItem => ({
  id,
  file: new File(["x"], `${id}.txt`, { type: "text/plain" }),
  name: `${id}.txt`,
  size: 1024,
  status,
  progress: status === "success" ? 1 : status === "pending" ? 0 : 0.3,
  ...overrides,
});

describe("UploadPanel — auto-hide + portal", () => {
  it("renders nothing when items is empty", () => {
    render(<UploadPanel items={[]} />);
    expect(document.querySelector("aside[role='region']")).toBeNull();
  });

  it("portals to document.body when items present", () => {
    render(<UploadPanel items={[mk("1", "uploading")]} />);
    const panel = document.body.querySelector("aside[role='region']");
    expect(panel).not.toBeNull();
  });

  it("applies data-position (default bottom-right)", () => {
    render(<UploadPanel items={[mk("1", "uploading")]} />);
    expect(
      document.body
        .querySelector("aside[role='region']")
        ?.getAttribute("data-position")
    ).toBe("bottom-right");
  });

  it("applies custom position", () => {
    render(
      <UploadPanel items={[mk("1", "uploading")]} position="bottom-left" />
    );
    expect(
      document.body
        .querySelector("aside[role='region']")
        ?.getAttribute("data-position")
    ).toBe("bottom-left");
  });
});

describe("UploadPanel — title derivation", () => {
  const getTitleDiv = () =>
    document.body.querySelector("aside[role='region'] > header > div");

  it("renders 'Uploading N files' when any uploading/pending", () => {
    render(
      <UploadPanel
        items={[mk("1", "uploading"), mk("2", "pending")]}
      />
    );
    expect(getTitleDiv()?.textContent).toMatch(/uploading 2 files/i);
  });

  it("renders singular 'file' for 1 active", () => {
    render(<UploadPanel items={[mk("1", "uploading")]} />);
    expect(getTitleDiv()?.textContent).toMatch(/uploading 1 file/i);
  });

  it("renders 'N complete, M failed' when mixed terminal", () => {
    render(
      <UploadPanel
        items={[
          mk("1", "success"),
          mk("2", "success"),
          mk("3", "error"),
        ]}
      />
    );
    expect(getTitleDiv()?.textContent).toMatch(/2 complete, 1 failed/i);
  });

  it("renders 'N uploads failed' when only errors", () => {
    render(<UploadPanel items={[mk("1", "error"), mk("2", "error")]} />);
    expect(getTitleDiv()?.textContent).toMatch(/2 uploads failed/i);
  });

  it("renders 'N uploads complete' when only successes", () => {
    render(<UploadPanel items={[mk("1", "success")]} />);
    expect(getTitleDiv()?.textContent).toMatch(/1 upload complete/i);
  });

  it("consumer-supplied title overrides derived", () => {
    render(
      <UploadPanel
        items={[mk("1", "uploading")]}
        title="My custom title"
      />
    );
    expect(screen.getByText("My custom title")).toBeInTheDocument();
    const titleDiv = document.body.querySelector(
      "aside[role='region'] > header > div"
    );
    expect(titleDiv?.textContent).toBe("My custom title");
    expect(titleDiv?.textContent).not.toMatch(/uploading/i);
  });
});

describe("UploadPanel — header actions", () => {
  it("clear button visible only when any terminal items present and onClearCompleted passed", async () => {
    const onClearCompleted = vi.fn();
    const { rerender } = render(
      <UploadPanel
        items={[mk("1", "success")]}
        onClearCompleted={onClearCompleted}
      />
    );
    const clearBtn = screen.getByRole("button", {
      name: /clear completed uploads/i,
    });
    await userEvent.click(clearBtn);
    expect(onClearCompleted).toHaveBeenCalled();

    rerender(
      <UploadPanel
        items={[mk("1", "uploading")]}
        onClearCompleted={onClearCompleted}
      />
    );
    expect(
      screen.queryByRole("button", { name: /clear completed uploads/i })
    ).toBeNull();
  });

  it("close button fires onClose", async () => {
    const onClose = vi.fn();
    render(
      <UploadPanel items={[mk("1", "uploading")]} onClose={onClose} />
    );
    await userEvent.click(
      screen.getByRole("button", { name: /close uploads panel/i })
    );
    expect(onClose).toHaveBeenCalled();
  });

  it("close button is absent when onClose not passed", () => {
    render(<UploadPanel items={[mk("1", "uploading")]} />);
    expect(
      screen.queryByRole("button", { name: /close uploads panel/i })
    ).toBeNull();
  });
});

describe("UploadPanel — row rendering", () => {
  it("renders one row per item in insertion order", () => {
    render(
      <UploadPanel
        items={[mk("a", "uploading"), mk("b", "pending"), mk("c", "success")]}
      />
    );
    const rows = document.body.querySelectorAll("aside[role='region'] li");
    expect(rows).toHaveLength(3);
    expect(rows[0].getAttribute("data-status")).toBe("uploading");
    expect(rows[1].getAttribute("data-status")).toBe("pending");
    expect(rows[2].getAttribute("data-status")).toBe("success");
  });

  it("per-row cancel callback receives item id", async () => {
    const onCancel = vi.fn();
    render(
      <UploadPanel
        items={[mk("xyz", "uploading", { name: "xyz.txt" })]}
        onCancel={onCancel}
      />
    );
    await userEvent.click(
      screen.getByRole("button", { name: /cancel xyz\.txt/i })
    );
    expect(onCancel).toHaveBeenCalledWith("xyz");
  });
});

describe("UploadPanel — collapse", () => {
  it("uncontrolled collapse toggles via chevron", async () => {
    render(<UploadPanel items={[mk("1", "uploading")]} />);
    const panel = document.body.querySelector(
      "aside[role='region']"
    ) as HTMLElement;
    expect(panel.getAttribute("data-collapsed")).toBe("false");

    await userEvent.click(
      screen.getByRole("button", { name: /collapse uploads/i })
    );
    expect(panel.getAttribute("data-collapsed")).toBe("true");
  });

  it("defaultCollapsed=true starts collapsed", () => {
    render(
      <UploadPanel items={[mk("1", "uploading")]} defaultCollapsed />
    );
    expect(
      document.body
        .querySelector("aside[role='region']")
        ?.getAttribute("data-collapsed")
    ).toBe("true");
  });

  it("controlled collapsed ignores internal clicks but fires onCollapseChange", async () => {
    const onCollapseChange = vi.fn();
    render(
      <UploadPanel
        items={[mk("1", "uploading")]}
        collapsed={false}
        onCollapseChange={onCollapseChange}
      />
    );
    const panel = document.body.querySelector(
      "aside[role='region']"
    ) as HTMLElement;
    expect(panel.getAttribute("data-collapsed")).toBe("false");

    await userEvent.click(
      screen.getByRole("button", { name: /collapse uploads/i })
    );
    expect(panel.getAttribute("data-collapsed")).toBe("false"); // parent owns state
    expect(onCollapseChange).toHaveBeenCalledWith(true);
  });
});

describe("UploadPanel — live region", () => {
  it("renders a polite live region mirroring derived title", () => {
    render(<UploadPanel items={[mk("1", "uploading")]} />);
    const live = document.body.querySelector("[aria-live='polite']");
    expect(live).not.toBeNull();
    expect(live!.textContent).toMatch(/uploading 1 file/i);
  });

  it("live region is a status role", () => {
    render(<UploadPanel items={[mk("1", "uploading")]} />);
    const statusNodes = document.body.querySelectorAll("[role='status']");
    expect(statusNodes.length).toBeGreaterThan(0);
  });
});
