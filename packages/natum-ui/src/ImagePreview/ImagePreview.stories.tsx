import { useState, useEffect } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ImagePreview } from "./ImagePreview";

const meta: Meta<typeof ImagePreview> = {
  title: "Data/ImagePreview",
  component: ImagePreview,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ width: 400, height: 300, border: "1px dashed #444" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ImagePreview>;

export const Default: Story = {
  args: {
    src: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800",
    alt: "Mountain landscape",
  },
};

function DelayedImage() {
  const [src, setSrc] = useState("");
  useEffect(() => {
    const t = setTimeout(
      () =>
        setSrc(
          "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800"
        ),
      3000
    );
    return () => clearTimeout(t);
  }, []);
  return <ImagePreview src={src || "data:,"} alt="Delayed load demo" />;
}

export const Loading: Story = {
  render: () => <DelayedImage />,
};

export const Error: Story = {
  args: {
    src: "https://invalid-url.example/broken.jpg",
    alt: "Broken image",
  },
};

export const LargeImage: Story = {
  args: {
    src: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=2400",
    alt: "Large landscape photo",
  },
};
