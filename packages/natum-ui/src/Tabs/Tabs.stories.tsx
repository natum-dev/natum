import type { Meta, StoryObj } from "@storybook/react";
import { forwardRef, useState, type AnchorHTMLAttributes } from "react";
import { Tabs } from "./Tabs";
import { TabsList } from "./TabsList";
import { TabsTrigger } from "./TabsTrigger";
import { TabsPanel } from "./TabsPanel";

const meta: Meta<typeof Tabs> = {
  title: "Navigation/Tabs",
  component: Tabs,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "radio", options: ["underline", "pill"] },
    size: { control: "radio", options: ["sm", "md"] },
    activationMode: { control: "radio", options: ["automatic", "manual"] },
  },
};

export default meta;
type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  render: (args) => (
    <Tabs defaultValue="files" {...args}>
      <TabsList aria-label="Main">
        <TabsTrigger value="files">My Files</TabsTrigger>
        <TabsTrigger value="shared">Shared</TabsTrigger>
        <TabsTrigger value="trash">Trash</TabsTrigger>
      </TabsList>
      <TabsPanel value="files">Your files live here.</TabsPanel>
      <TabsPanel value="shared">Files shared with you.</TabsPanel>
      <TabsPanel value="trash">Recently deleted files.</TabsPanel>
    </Tabs>
  ),
};

export const PillVariant: Story = {
  ...Default,
  args: { variant: "pill" },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <Tabs defaultValue="a" size="sm">
        <TabsList aria-label="sm">
          <TabsTrigger value="a">Account</TabsTrigger>
          <TabsTrigger value="b">Billing</TabsTrigger>
          <TabsTrigger value="c">Team</TabsTrigger>
        </TabsList>
        <TabsPanel value="a">small tabs</TabsPanel>
        <TabsPanel value="b">b</TabsPanel>
        <TabsPanel value="c">c</TabsPanel>
      </Tabs>
      <Tabs defaultValue="a" size="md">
        <TabsList aria-label="md">
          <TabsTrigger value="a">Account</TabsTrigger>
          <TabsTrigger value="b">Billing</TabsTrigger>
          <TabsTrigger value="c">Team</TabsTrigger>
        </TabsList>
        <TabsPanel value="a">medium tabs</TabsPanel>
        <TabsPanel value="b">b</TabsPanel>
        <TabsPanel value="c">c</TabsPanel>
      </Tabs>
      <Tabs defaultValue="a" size="sm" variant="pill">
        <TabsList aria-label="pill sm">
          <TabsTrigger value="a">Account</TabsTrigger>
          <TabsTrigger value="b">Billing</TabsTrigger>
        </TabsList>
        <TabsPanel value="a">pill sm</TabsPanel>
        <TabsPanel value="b">b</TabsPanel>
      </Tabs>
    </div>
  ),
};

export const ManualActivation: Story = {
  render: () => (
    <Tabs defaultValue="a" activationMode="manual">
      <TabsList aria-label="Settings sections">
        <TabsTrigger value="a">Profile</TabsTrigger>
        <TabsTrigger value="b">Security</TabsTrigger>
        <TabsTrigger value="c">Notifications</TabsTrigger>
      </TabsList>
      <TabsPanel value="a">
        Arrow keys move focus; press Enter or Space to activate.
      </TabsPanel>
      <TabsPanel value="b">Security panel.</TabsPanel>
      <TabsPanel value="c">Notifications panel.</TabsPanel>
    </Tabs>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Tabs defaultValue="a">
      <TabsList aria-label="m">
        <TabsTrigger value="a">Active</TabsTrigger>
        <TabsTrigger value="b" disabled>
          Disabled
        </TabsTrigger>
        <TabsTrigger value="c">Also active</TabsTrigger>
      </TabsList>
      <TabsPanel value="a">a</TabsPanel>
      <TabsPanel value="b">b</TabsPanel>
      <TabsPanel value="c">c</TabsPanel>
    </Tabs>
  ),
};

type MockLinkProps = AnchorHTMLAttributes<HTMLAnchorElement>;
const MockLink = forwardRef<HTMLAnchorElement, MockLinkProps>(function MockLink(
  props,
  ref
) {
  return <a ref={ref} {...props} />;
});

export const AsLinks: Story = {
  render: () => {
    const [value, setValue] = useState("files");
    return (
      <Tabs value={value} onValueChange={setValue}>
        <TabsList aria-label="Routed">
          <TabsTrigger as={MockLink} href="#/files" value="files">
            Files
          </TabsTrigger>
          <TabsTrigger as={MockLink} href="#/shared" value="shared">
            Shared
          </TabsTrigger>
        </TabsList>
        <TabsPanel value="files">/files panel</TabsPanel>
        <TabsPanel value="shared">/shared panel</TabsPanel>
      </Tabs>
    );
  },
};

export const Overflow: Story = {
  render: () => (
    <div style={{ inlineSize: 360 }}>
      <Tabs defaultValue="month-1">
        <TabsList aria-label="Months">
          {Array.from({ length: 12 }, (_, i) => (
            <TabsTrigger key={i} value={`month-${i + 1}`}>
              Month {i + 1}
            </TabsTrigger>
          ))}
        </TabsList>
        {Array.from({ length: 12 }, (_, i) => (
          <TabsPanel key={i} value={`month-${i + 1}`}>
            Content for month {i + 1}.
          </TabsPanel>
        ))}
      </Tabs>
    </div>
  ),
};
