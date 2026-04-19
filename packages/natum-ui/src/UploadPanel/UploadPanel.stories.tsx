import type { Meta, StoryObj } from "@storybook/react";
import { useCallback } from "react";
import { UploadPanel } from "./UploadPanel";
import { DropZone } from "../DropZone";
import { DropZoneOverlay } from "../DropZoneOverlay";
import {
  useUploadQueue,
  type UploadFn,
  type UploadItem,
} from "../hooks/use-upload-queue";

const meta: Meta<typeof UploadPanel> = {
  title: "Feedback/UploadPanel",
  component: UploadPanel,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof UploadPanel>;

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
  progress: status === "success" ? 1 : status === "pending" ? 0 : 0.42,
  ...overrides,
});

export const Default: Story = {
  args: {
    items: [
      mk("a", "uploading", { name: "photo.png", size: 1024 * 1024 * 2 }),
      mk("b", "pending", { name: "video.mp4", size: 1024 * 1024 * 50 }),
      mk("c", "success", { name: "resume.pdf", size: 512 * 1024 }),
    ],
  },
};

export const AllStates: Story = {
  args: {
    items: [
      mk("a", "uploading", { progress: 0.77 }),
      mk("b", "pending"),
      mk("c", "uploading", { progress: undefined }),
      mk("d", "success"),
      mk("e", "error", { error: "Network failure" }),
    ],
    onCancel: (id) => console.log("cancel", id),
    onRetry: (id) => console.log("retry", id),
    onClearCompleted: () => console.log("clear"),
    onClose: () => console.log("close"),
  },
};

export const Collapsed: Story = {
  args: {
    items: [mk("a", "uploading"), mk("b", "pending")],
    defaultCollapsed: true,
  },
};

export const BottomLeft: Story = {
  args: {
    ...Default.args,
    position: "bottom-left",
  },
};

const fakeUploadFn =
  (shouldFail: boolean): UploadFn =>
  (_file, { onProgress, signal }) =>
    new Promise<void>((resolve, reject) => {
      let pct = 0;
      const tick = () => {
        if (signal.aborted) {
          const err = new Error("aborted");
          err.name = "AbortError";
          reject(err);
          return;
        }
        pct += 0.12;
        onProgress(Math.min(1, pct));
        if (pct >= 1) {
          if (shouldFail) reject(new Error("Simulated failure"));
          else resolve();
          return;
        }
        window.setTimeout(tick, 180);
      };
      window.setTimeout(tick, 180);
    });

const IntegrationDemo = () => {
  const queue = useUploadQueue();

  const handleFiles = useCallback(
    (files: File[]) => {
      files.forEach((file) => {
        const shouldFail = /fail/i.test(file.name);
        queue.add(file, fakeUploadFn(shouldFail));
      });
    },
    [queue]
  );

  return (
    <div style={{ minHeight: "100vh", padding: 32 }}>
      <h2 style={{ marginBottom: 16 }}>Upload anywhere</h2>
      <p>
        Drop files anywhere on the page, or click the region below. Rename a
        file to include &quot;fail&quot; to simulate an error.
      </p>
      <div style={{ maxWidth: 520, marginBlockStart: 24 }}>
        <DropZone onFilesSelected={handleFiles} />
      </div>
      <DropZoneOverlay onFilesDropped={handleFiles} />
      <UploadPanel
        items={queue.items}
        onCancel={queue.cancel}
        onRetry={(id) => {
          const shouldFail = Math.random() < 0.5;
          queue.retry(id, fakeUploadFn(shouldFail));
        }}
        onClearCompleted={() => queue.clear()}
        onClose={() => queue.clear(() => true)}
      />
    </div>
  );
};

export const Integration: Story = {
  render: () => <IntegrationDemo />,
};
