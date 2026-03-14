import type { Meta, StoryObj } from "@storybook/react";
import {
  IconAlertTriangle,
  IconBell,
  IconCheck,
  IconCheckCircle,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronUp,
  IconDownload,
  IconEye,
  IconEyeOff,
  IconFile,
  IconFolder,
  IconHeart,
  IconInfo,
  IconLoader,
  IconMinus,
  IconMoreHorizontal,
  IconMoreVertical,
  IconPlus,
  IconSearch,
  IconSettings,
  IconStar,
  IconTrash,
  IconUpload,
  IconX,
  IconXCircle,
} from "@natum/icons";
import type { IconProps } from "@natum/icons";
import type { ComponentType } from "react";

const allIcons: { name: string; component: ComponentType<IconProps> }[] = [
  { name: "IconAlertTriangle", component: IconAlertTriangle },
  { name: "IconBell", component: IconBell },
  { name: "IconCheck", component: IconCheck },
  { name: "IconCheckCircle", component: IconCheckCircle },
  { name: "IconChevronDown", component: IconChevronDown },
  { name: "IconChevronLeft", component: IconChevronLeft },
  { name: "IconChevronRight", component: IconChevronRight },
  { name: "IconChevronUp", component: IconChevronUp },
  { name: "IconDownload", component: IconDownload },
  { name: "IconEye", component: IconEye },
  { name: "IconEyeOff", component: IconEyeOff },
  { name: "IconFile", component: IconFile },
  { name: "IconFolder", component: IconFolder },
  { name: "IconHeart", component: IconHeart },
  { name: "IconInfo", component: IconInfo },
  { name: "IconLoader", component: IconLoader },
  { name: "IconMinus", component: IconMinus },
  { name: "IconMoreHorizontal", component: IconMoreHorizontal },
  { name: "IconMoreVertical", component: IconMoreVertical },
  { name: "IconPlus", component: IconPlus },
  { name: "IconSearch", component: IconSearch },
  { name: "IconSettings", component: IconSettings },
  { name: "IconStar", component: IconStar },
  { name: "IconTrash", component: IconTrash },
  { name: "IconUpload", component: IconUpload },
  { name: "IconX", component: IconX },
  { name: "IconXCircle", component: IconXCircle },
];

const meta: Meta = {
  title: "Icons/Gallery",
  argTypes: {
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg", "xl", "xxl"],
    },
    color: { control: "color" },
  },
  args: {
    size: "lg",
    color: "currentColor",
  },
  parameters: {
    layout: "padded",
  },
};

export default meta;

type GalleryArgs = { size: IconProps["size"]; color: string };

export const Gallery: StoryObj<GalleryArgs> = {
  render: (args) => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
        gap: 8,
      }}
    >
      {allIcons.map(({ name, component: Icon }) => (
        <div
          key={name}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            padding: 12,
            borderRadius: 8,
            border: "1px solid var(--border-color-subtle)",
          }}
        >
          <Icon size={args.size} color={args.color} />
          <span
            style={{
              fontSize: 11,
              color: "var(--typography-secondary)",
              textAlign: "center",
              wordBreak: "break-all",
            }}
          >
            {name}
          </span>
        </div>
      ))}
    </div>
  ),
};