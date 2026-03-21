import type { Meta, StoryObj } from "@storybook/react";
import { ToastProvider } from "./ToastProvider";
import { toast } from "./toast";

const meta: Meta<typeof ToastProvider> = {
  title: "Components/Toast",
  component: ToastProvider,
  decorators: [
    (Story) => (
      <ToastProvider>
        <Story />
      </ToastProvider>
    ),
  ],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof ToastProvider>;

const buttonStyle = {
  padding: "8px 16px",
  border: "1px solid #ccc",
  borderRadius: 6,
  background: "#fff",
  cursor: "pointer",
  fontSize: 14,
};

export const Simple: Story = {
  render: () => (
    <button
      style={buttonStyle}
      onClick={() => toast("Message from the server")}
    >
      Show Simple Toast
    </button>
  ),
};

export const Success: Story = {
  render: () => (
    <button
      style={buttonStyle}
      onClick={() => toast.success("File uploaded successfully!")}
    >
      Show Success Toast
    </button>
  ),
};

export const Error: Story = {
  render: () => (
    <button
      style={buttonStyle}
      onClick={() => toast.error("Upload failed. Please try again.")}
    >
      Show Error Toast
    </button>
  ),
};

export const Warning: Story = {
  render: () => (
    <button
      style={buttonStyle}
      onClick={() => toast.warning("Storage is almost full.")}
    >
      Show Warning Toast
    </button>
  ),
};

export const Info: Story = {
  render: () => (
    <button
      style={buttonStyle}
      onClick={() => toast.info("A new version is available.")}
    >
      Show Info Toast
    </button>
  ),
};

export const WithTitle: Story = {
  render: () => (
    <button
      style={buttonStyle}
      onClick={() =>
        toast.success("Your file has been saved.", { title: "Success!" })
      }
    >
      Toast with Title
    </button>
  ),
};

export const WithAction: Story = {
  render: () => (
    <button
      style={buttonStyle}
      onClick={() =>
        toast.warning("Storage almost full.", {
          action: { label: "Upgrade", onClick: () => alert("Upgrade clicked!") },
        })
      }
    >
      Toast with Action
    </button>
  ),
};

export const Persistent: Story = {
  render: () => (
    <button
      style={buttonStyle}
      onClick={() =>
        toast.info("This won't auto-dismiss.", { duration: 0 })
      }
    >
      Persistent Toast
    </button>
  ),
};

export const Stacked: Story = {
  render: () => (
    <button
      style={buttonStyle}
      onClick={() => {
        toast.success("First toast");
        setTimeout(() => toast.info("Second toast"), 200);
        setTimeout(() => toast.warning("Third toast"), 400);
        setTimeout(() => toast.error("Fourth toast"), 600);
      }}
    >
      Show Multiple Toasts
    </button>
  ),
};

export const Updatable: Story = {
  render: () => (
    <button
      style={buttonStyle}
      onClick={() => {
        toast("Uploading...", { id: "upload", duration: 0 });
        setTimeout(() => {
          toast.update("upload", {
            message: "Upload complete!",
            type: "success",
            duration: 3000,
          });
        }, 2000);
      }}
    >
      Upload with Progress
    </button>
  ),
};
