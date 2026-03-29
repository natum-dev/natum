import type { Meta, StoryObj } from "@storybook/react";
import { Breadcrumb, BreadcrumbItem } from "./Breadcrumb";

const meta: Meta<typeof Breadcrumb> = {
  title: "Components/Breadcrumb",
  component: Breadcrumb,
  argTypes: {
    maxVisible: { control: "number" },
  },
};

export default meta;
type Story = StoryObj<typeof Breadcrumb>;

export const Default: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem href="/documents">Documents</BreadcrumbItem>
      <BreadcrumbItem>Reports</BreadcrumbItem>
    </Breadcrumb>
  ),
};

export const SingleItem: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbItem>Home</BreadcrumbItem>
    </Breadcrumb>
  ),
};

export const CustomSeparator: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Breadcrumb separator="/">
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/docs">Documents</BreadcrumbItem>
        <BreadcrumbItem>Reports</BreadcrumbItem>
      </Breadcrumb>
      <Breadcrumb separator="→">
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/docs">Documents</BreadcrumbItem>
        <BreadcrumbItem>Reports</BreadcrumbItem>
      </Breadcrumb>
    </div>
  ),
};

export const Overflow: Story = {
  render: () => (
    <Breadcrumb maxVisible={4}>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem href="/projects">Projects</BreadcrumbItem>
      <BreadcrumbItem href="/projects/vault">Vault</BreadcrumbItem>
      <BreadcrumbItem href="/projects/vault/docs">Documents</BreadcrumbItem>
      <BreadcrumbItem href="/projects/vault/docs/reports">Reports</BreadcrumbItem>
      <BreadcrumbItem>Q1 Summary</BreadcrumbItem>
    </Breadcrumb>
  ),
};

export const DeepNesting: Story = {
  render: () => (
    <Breadcrumb maxVisible={4}>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem href="/a">Level 1</BreadcrumbItem>
      <BreadcrumbItem href="/b">Level 2</BreadcrumbItem>
      <BreadcrumbItem href="/c">Level 3</BreadcrumbItem>
      <BreadcrumbItem href="/d">Level 4</BreadcrumbItem>
      <BreadcrumbItem href="/e">Level 5</BreadcrumbItem>
      <BreadcrumbItem href="/f">Level 6</BreadcrumbItem>
      <BreadcrumbItem href="/g">Level 7</BreadcrumbItem>
      <BreadcrumbItem>Current Page</BreadcrumbItem>
    </Breadcrumb>
  ),
};

export const WithOnClick: Story = {
  name: "SPA Navigation (onClick)",
  render: () => (
    <Breadcrumb>
      <BreadcrumbItem href="/" onClick={(e) => { e.preventDefault(); alert("Navigate to Home"); }}>
        Home
      </BreadcrumbItem>
      <BreadcrumbItem href="/docs" onClick={(e) => { e.preventDefault(); alert("Navigate to Documents"); }}>
        Documents
      </BreadcrumbItem>
      <BreadcrumbItem>Current</BreadcrumbItem>
    </Breadcrumb>
  ),
};

export const RealWorldFileBrowser: Story = {
  name: "Real-World: File Browser",
  render: () => (
    <div style={{ padding: 16, borderBottom: "1px solid var(--border-color-subtle)" }}>
      <Breadcrumb>
        <BreadcrumbItem href="/">My Files</BreadcrumbItem>
        <BreadcrumbItem href="/work">Work</BreadcrumbItem>
        <BreadcrumbItem href="/work/projects">Projects</BreadcrumbItem>
        <BreadcrumbItem>Vault Design Spec</BreadcrumbItem>
      </Breadcrumb>
    </div>
  ),
};

export const DarkMode: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem href="/docs">Documents</BreadcrumbItem>
      <BreadcrumbItem>Reports</BreadcrumbItem>
    </Breadcrumb>
  ),
  globals: { theme: "dark" },
};

export const RTL: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbItem href="/">الرئيسية</BreadcrumbItem>
      <BreadcrumbItem href="/docs">المستندات</BreadcrumbItem>
      <BreadcrumbItem>التقارير</BreadcrumbItem>
    </Breadcrumb>
  ),
  globals: { direction: "rtl" },
};
