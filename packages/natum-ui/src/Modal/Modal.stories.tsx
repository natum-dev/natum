"use client";

import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Modal } from "./Modal";
import { Typography } from "../Typography";
import { Button } from "../Button";
import { TextField } from "../TextField";
import { Divider } from "../Divider";

const meta: Meta<typeof Modal> = {
  title: "Components/Modal",
  component: Modal,
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    closeOnOverlayClick: { control: "boolean" },
    closeOnEsc: { control: "boolean" },
    hideCloseButton: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Modal>;

const headingStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  color: "var(--neutral-text)",
  margin: "16px 0 8px",
  textTransform: "uppercase",
  letterSpacing: 1,
};

// --- 1. Default ---
export const Default: Story = {
  render: function DefaultStory() {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Confirm Action"
          footer={
            <>
              <Button variant="text" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button onClick={() => setIsOpen(false)}>Confirm</Button>
            </>
          }
        >
          <Typography variant="body1">
            Are you sure you want to proceed? This action can be undone later.
          </Typography>
        </Modal>
      </>
    );
  },
};

// --- 2. Sizes ---
export const Sizes: Story = {
  render: function SizesStory() {
    const [open, setOpen] = useState<"sm" | "md" | "lg" | null>(null);
    return (
      <div style={{ display: "flex", gap: 8 }}>
        {(["sm", "md", "lg"] as const).map((size) => (
          <div key={size}>
            <Button variant="soft" onClick={() => setOpen(size)}>
              {size.toUpperCase()}
            </Button>
            <Modal
              isOpen={open === size}
              onClose={() => setOpen(null)}
              title={`Size: ${size}`}
              size={size}
              footer={<Button onClick={() => setOpen(null)}>Close</Button>}
            >
              <Typography variant="body1">
                This modal uses the <strong>{size}</strong> size. Max-width:{" "}
                {size === "sm" ? "400px" : size === "md" ? "560px" : "720px"}.
              </Typography>
            </Modal>
          </div>
        ))}
      </div>
    );
  },
};

// --- 3. Scrollable Content ---
export const ScrollableContent: Story = {
  render: function ScrollableStory() {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Scrollable</Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Scrollable Content"
          footer={<Button onClick={() => setIsOpen(false)}>Done</Button>}
        >
          {Array.from({ length: 20 }, (_, i) => (
            <Typography key={i} variant="body1" tag="p">
              Paragraph {i + 1}: Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </Typography>
          ))}
        </Modal>
      </>
    );
  },
};

// --- 4. No Footer ---
export const NoFooter: Story = {
  render: function NoFooterStory() {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Info Modal</Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Information"
        >
          <Typography variant="body1">
            This modal has no footer. Use the close button or press Escape to dismiss.
          </Typography>
        </Modal>
      </>
    );
  },
};

// --- 5. No Close Button ---
export const NoCloseButton: Story = {
  render: function NoCloseStory() {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Forced Action</Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Required Action"
          hideCloseButton
          closeOnOverlayClick={false}
          closeOnEsc={false}
          footer={<Button onClick={() => setIsOpen(false)}>I Understand</Button>}
        >
          <Typography variant="body1">
            This modal cannot be dismissed with Escape or by clicking the overlay.
            You must click the button below to proceed.
          </Typography>
        </Modal>
      </>
    );
  },
};

// --- 6. Dark Mode ---
export const DarkMode: Story = {
  render: function DarkModeStory() {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Dark Mode"
          footer={<Button onClick={() => setIsOpen(false)}>Close</Button>}
        >
          <Typography variant="body1">
            Toggle the theme in the Storybook toolbar. The overlay darkens in dark mode
            (0.7 vs 0.5 opacity), and all panel colors adapt via CSS custom properties.
          </Typography>
        </Modal>
      </>
    );
  },
};

// --- 7. RTL ---
export const RTL: Story = {
  render: function RTLStory() {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <div dir="rtl">
        <Button onClick={() => setIsOpen(true)}>افتح النافذة</Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="تأكيد الحذف"
          footer={
            <>
              <Button variant="text" onClick={() => setIsOpen(false)}>إلغاء</Button>
              <Button onClick={() => setIsOpen(false)}>حذف</Button>
            </>
          }
        >
          <Typography variant="body1">
            هل أنت متأكد أنك تريد حذف هذا الملف؟ لا يمكن التراجع عن هذا الإجراء.
          </Typography>
        </Modal>
      </div>
    );
  },
};

// --- 8. Real-World: Delete Confirmation ---
export const DeleteConfirmation: Story = {
  name: "Real-World: Delete Confirmation",
  render: function DeleteStory() {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Delete File</Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Delete File?"
          size="sm"
          footer={
            <>
              <Button variant="text" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button
                onClick={() => setIsOpen(false)}
                style={{ backgroundColor: "var(--error-bg)", color: "white" }}
              >
                Delete
              </Button>
            </>
          }
        >
          <Typography variant="body1" tag="p" style={{ margin: 0 }}>
            Are you sure you want to delete <strong>Q4-Report.pdf</strong>?
          </Typography>
          <Typography variant="body2" color="secondary" tag="p" style={{ margin: "8px 0 0" }}>
            This action cannot be undone. The file will be permanently removed from Vault.
          </Typography>
        </Modal>
      </>
    );
  },
};

// --- 9. Real-World: Create Folder ---
export const CreateFolder: Story = {
  name: "Real-World: Create Folder",
  render: function CreateFolderStory() {
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState("");
    return (
      <>
        <Button onClick={() => setIsOpen(true)}>New Folder</Button>
        <Modal
          isOpen={isOpen}
          onClose={() => { setIsOpen(false); setName(""); }}
          title="Create Folder"
          size="sm"
          footer={
            <>
              <Button variant="text" onClick={() => { setIsOpen(false); setName(""); }}>
                Cancel
              </Button>
              <Button disabled={!name.trim()} onClick={() => { setIsOpen(false); setName(""); }}>
                Create
              </Button>
            </>
          }
        >
          <TextField
            label="Folder name"
            placeholder="Enter folder name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            clearable
            onClear={() => setName("")}
          />
        </Modal>
      </>
    );
  },
};

// --- 10. Real-World: Share File ---
export const ShareFile: Story = {
  name: "Real-World: Share File",
  render: function ShareFileStory() {
    const [isOpen, setIsOpen] = useState(false);
    const [email, setEmail] = useState("");
    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Share</Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Share File"
          size="lg"
          footer={
            <>
              <Button variant="text" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button onClick={() => setIsOpen(false)}>Send Invite</Button>
            </>
          }
        >
          <Typography variant="h6" tag="p" style={{ margin: "0 0 8px" }}>
            Invite people
          </Typography>
          <TextField
            label="Email address"
            placeholder="colleague@company.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            clearable
            onClear={() => setEmail("")}
            helperText="They will receive an email with a link to this file"
          />
          <Divider spacing="md" />
          <Typography variant="h6" tag="p" style={{ margin: "0 0 8px" }}>
            People with access
          </Typography>
          {["Jonathan (Owner)", "Alice (Editor)", "Bob (Viewer)"].map((person) => (
            <div key={person} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0" }}>
              <Typography variant="body2">{person}</Typography>
              <Typography variant="caption" color="secondary">
                {person.includes("Owner") ? "Owner" : "Remove"}
              </Typography>
            </div>
          ))}
        </Modal>
      </>
    );
  },
};

// --- 11. Real-World: Terms & Conditions ---
export const TermsAndConditions: Story = {
  name: "Real-World: Terms & Conditions",
  render: function TermsStory() {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setIsOpen(true)}>View Terms</Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Terms & Conditions"
          size="md"
          hideCloseButton
          closeOnOverlayClick={false}
          closeOnEsc={false}
          footer={
            <>
              <Button variant="text" onClick={() => setIsOpen(false)}>Decline</Button>
              <Button onClick={() => setIsOpen(false)}>Accept</Button>
            </>
          }
        >
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i}>
              <Typography variant="h6" tag="p" style={{ margin: "16px 0 4px" }}>
                Section {i + 1}
              </Typography>
              <Typography variant="body2" color="secondary" tag="p" style={{ margin: 0 }}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod,
                nisi vel consectetur interdum, nisl nunc egestas nisi, vitae tincidunt nisl
                nunc euismod nisi. Sed euismod, nisi vel consectetur interdum, nisl nunc
                egestas nisi, vitae tincidunt nisl nunc euismod nisi.
              </Typography>
            </div>
          ))}
        </Modal>
      </>
    );
  },
};

// --- 12. Responsive ---
export const Responsive: Story = {
  render: function ResponsiveStory() {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <h3 style={{ ...headingStyle, margin: "0 0 8px" }}>Responsive</h3>
        <Typography variant="body2" color="secondary" tag="p" style={{ margin: "0 0 12px" }}>
          Resize your browser below 600px to see the modal transform into a bottom sheet
          with slide-up animation and rounded top corners.
        </Typography>
        <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Responsive Modal"
          footer={<Button onClick={() => setIsOpen(false)}>Done</Button>}
        >
          <Typography variant="body1">
            On desktop (600px+), this modal appears centered with a scale+fade animation.
            On mobile (&lt;600px), it snaps to the bottom as a sheet with a slide-up animation.
          </Typography>
        </Modal>
      </>
    );
  },
};
