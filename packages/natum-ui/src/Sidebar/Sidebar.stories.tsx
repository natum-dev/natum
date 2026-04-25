import { useState, type MouseEventHandler, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  IconFile,
  IconFolder,
  IconSettings,
  IconEye,
  IconStar,
  IconChevronLeft,
  IconChevronRight,
  IconMoreVertical,
} from "@natum/icons";
import { Sidebar } from "./Sidebar";
import { SidebarHeader } from "./SidebarHeader";
import { SidebarBody } from "./SidebarBody";
import { SidebarFooter } from "./SidebarFooter";
import { SidebarSection } from "./SidebarSection";
import { SidebarItem } from "./SidebarItem";
import { useSidebarCollapsed } from "./context";
import { IconButton } from "../IconButton";
import { Badge } from "../Badge";
import { Button } from "../Button";
import { Modal } from "../Modal";

const meta = {
  title: "Navigation/Sidebar",
  component: Sidebar,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  argTypes: {
    collapsed: { control: "boolean" },
    defaultCollapsed: { control: "boolean" },
  },
  decorators: [
    (Story) => (
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <Story />
        <main style={{ flex: 1, padding: 24 }}>Main content area</main>
      </div>
    ),
  ],
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

const BASE_ITEMS = (
  <>
    <SidebarSection label="Main">
      <SidebarItem icon={IconFile} href="#" active>Files</SidebarItem>
      <SidebarItem icon={IconFolder} href="#">Folders</SidebarItem>
      <SidebarItem icon={IconStar} href="#">Starred</SidebarItem>
    </SidebarSection>
    <SidebarSection label="Account">
      <SidebarItem icon={IconEye} href="#">Profile</SidebarItem>
      <SidebarItem icon={IconSettings} href="#">Settings</SidebarItem>
    </SidebarSection>
  </>
);

export const Default: Story = {
  args: { collapsed: false },
  render: (args) => (
    <Sidebar {...args}>
      <SidebarHeader>Natum</SidebarHeader>
      <SidebarBody>{BASE_ITEMS}</SidebarBody>
      <SidebarFooter>jon.ramlie@gmail.com</SidebarFooter>
    </Sidebar>
  ),
};

export const Collapsed: Story = {
  args: { collapsed: true },
  render: (args) => (
    <Sidebar {...args}>
      <SidebarHeader>N</SidebarHeader>
      <SidebarBody>{BASE_ITEMS}</SidebarBody>
      <SidebarFooter>
        <IconButton aria-label="More"><IconMoreVertical /></IconButton>
      </SidebarFooter>
    </Sidebar>
  ),
};

const CollapseToggle = () => {
  const { collapsed, setCollapsed } = useSidebarCollapsed();
  return (
    <IconButton
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      onClick={() => setCollapsed(!collapsed)}
    >
      {collapsed ? <IconChevronRight /> : <IconChevronLeft />}
    </IconButton>
  );
};

const ControlledDemo = () => {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <Sidebar collapsed={collapsed} onCollapseChange={setCollapsed}>
      <SidebarHeader style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {collapsed ? "N" : "Natum"}
        <CollapseToggle />
      </SidebarHeader>
      <SidebarBody>{BASE_ITEMS}</SidebarBody>
      <SidebarFooter>
        <IconButton aria-label="More"><IconMoreVertical /></IconButton>
      </SidebarFooter>
    </Sidebar>
  );
};

export const ControlledToggle: Story = {
  render: () => <ControlledDemo />,
};

export const WithBadges: Story = {
  render: () => (
    <Sidebar>
      <SidebarHeader>Natum</SidebarHeader>
      <SidebarBody>
        <SidebarSection label="Inbox">
          <SidebarItem icon={IconFile} href="#" rightSection={<Badge color="primary" size="sm">12</Badge>}>
            Unread
          </SidebarItem>
          <SidebarItem icon={IconFolder} href="#" rightSection={<Badge color="neutral" size="sm">3</Badge>}>
            Drafts
          </SidebarItem>
        </SidebarSection>
      </SidebarBody>
    </Sidebar>
  ),
};

export const ActiveState: Story = {
  render: () => (
    <Sidebar>
      <SidebarHeader>Natum</SidebarHeader>
      <SidebarBody>
        <SidebarSection label="Main">
          <SidebarItem icon={IconFile} href="#">Files</SidebarItem>
          <SidebarItem icon={IconFolder} href="#" active>Folders</SidebarItem>
          <SidebarItem icon={IconStar} href="#">Starred</SidebarItem>
        </SidebarSection>
      </SidebarBody>
    </Sidebar>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Sidebar>
      <SidebarHeader>Natum</SidebarHeader>
      <SidebarBody>
        <SidebarSection label="Main">
          <SidebarItem icon={IconFile} href="#">Files</SidebarItem>
          <SidebarItem icon={IconFolder} href="#" disabled>Folders (disabled)</SidebarItem>
          <SidebarItem as="button" icon={IconStar} disabled>Starred (disabled)</SidebarItem>
        </SidebarSection>
      </SidebarBody>
    </Sidebar>
  ),
};

type LinkStubProps = { to: string; children?: ReactNode; className?: string; onClick?: MouseEventHandler };
const NextLinkStub = ({ to, children, className, onClick }: LinkStubProps) => (
  <a href={to} className={className} onClick={onClick}>{children}</a>
);

export const AsLink: Story = {
  render: () => (
    <Sidebar>
      <SidebarHeader>Natum</SidebarHeader>
      <SidebarBody>
        <SidebarSection label="Main">
          <SidebarItem as={NextLinkStub} to="/home" icon={IconFile}>Home</SidebarItem>
          <SidebarItem as={NextLinkStub} to="/files" icon={IconFolder} active>Files</SidebarItem>
        </SidebarSection>
      </SidebarBody>
    </Sidebar>
  ),
};

const InModalDemo = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open menu</Button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <Sidebar>
          <SidebarHeader>Natum</SidebarHeader>
          <SidebarBody>{BASE_ITEMS}</SidebarBody>
          <SidebarFooter>jon.ramlie@gmail.com</SidebarFooter>
        </Sidebar>
      </Modal>
    </>
  );
};

export const InModal: Story = {
  render: () => <InModalDemo />,
};
