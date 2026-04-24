import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { ShareDialog } from "./ShareDialog";
import type { ShareDialogProps } from "./ShareDialog";

const mockShares: ShareDialogProps["shares"] = [];

const ownerEntry: ShareDialogProps["shares"][number] = {
  id: "owner-1",
  name: "Jonathan Ramlie",
  email: "jon@example.com",
  level: "owner",
};

const editorEntry: ShareDialogProps["shares"][number] = {
  id: "editor-1",
  name: "Alice Smith",
  email: "alice@example.com",
  level: "editor",
};

const viewerEntry: ShareDialogProps["shares"][number] = {
  id: "viewer-1",
  name: "Bob Jones",
  email: "bob@example.com",
  level: "viewer",
};

const defaultProps: ShareDialogProps = {
  open: true,
  onClose: vi.fn(),
  title: "test-file.jpg",
  shares: mockShares,
  onSearch: vi.fn().mockResolvedValue([]),
  onAdd: vi.fn(),
  onPermissionChange: vi.fn(),
  onRemove: vi.fn(),
};

describe("ShareDialog", () => {
  describe("rendering", () => {
    it("does not render when open={false}", () => {
      render(<ShareDialog {...defaultProps} open={false} />);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("renders dialog when open={true}", () => {
      render(<ShareDialog {...defaultProps} />);
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("shows title with Share prefix", () => {
      render(<ShareDialog {...defaultProps} />);
      expect(
        screen.getByText('Share "test-file.jpg"')
      ).toBeInTheDocument();
    });

    it("close button fires onClose", async () => {
      const onClose = vi.fn();
      render(<ShareDialog {...defaultProps} onClose={onClose} />);
      await userEvent.click(screen.getByLabelText("Close dialog"));
      expect(onClose).toHaveBeenCalledOnce();
    });

    it("renders search input with placeholder", () => {
      render(<ShareDialog {...defaultProps} />);
      expect(
        screen.getByPlaceholderText("Search by name or email...")
      ).toBeInTheDocument();
    });

    it("renders Share button (disabled when no user staged)", () => {
      render(<ShareDialog {...defaultProps} />);
      const shareBtn = screen.getByRole("button", { name: "Share" });
      expect(shareBtn).toBeDisabled();
    });
  });

  describe("share list", () => {
    it("shows People with access label", () => {
      render(
        <ShareDialog {...defaultProps} shares={[ownerEntry]} />
      );
      expect(screen.getByText("People with access")).toBeInTheDocument();
    });

    it("does not show share list when shares is empty", () => {
      render(<ShareDialog {...defaultProps} shares={[]} />);
      expect(
        screen.queryByText("People with access")
      ).not.toBeInTheDocument();
    });

    it("renders owner row with PermissionBadge and no remove button", () => {
      render(
        <ShareDialog {...defaultProps} shares={[ownerEntry]} />
      );
      expect(screen.getByText("Jonathan Ramlie")).toBeInTheDocument();
      expect(screen.getByText("jon@example.com")).toBeInTheDocument();
      expect(screen.getByText("Owner")).toBeInTheDocument();
      expect(
        screen.queryByLabelText("Remove access for Jonathan Ramlie")
      ).not.toBeInTheDocument();
    });

    it("renders editor row with permission trigger and remove button", () => {
      render(
        <ShareDialog
          {...defaultProps}
          shares={[ownerEntry, editorEntry]}
        />
      );
      expect(screen.getByText("Alice Smith")).toBeInTheDocument();
      expect(
        screen.getByLabelText("Remove access for Alice Smith")
      ).toBeInTheDocument();
    });

    it("renders viewer row with permission trigger and remove button", () => {
      render(
        <ShareDialog
          {...defaultProps}
          shares={[ownerEntry, viewerEntry]}
        />
      );
      expect(screen.getByText("Bob Jones")).toBeInTheDocument();
      expect(
        screen.getByLabelText("Remove access for Bob Jones")
      ).toBeInTheDocument();
    });
  });

  describe("share list callbacks", () => {
    it("fires onRemove when remove button clicked", async () => {
      const onRemove = vi.fn();
      render(
        <ShareDialog
          {...defaultProps}
          shares={[ownerEntry, editorEntry]}
          onRemove={onRemove}
        />
      );
      await userEvent.click(
        screen.getByLabelText("Remove access for Alice Smith")
      );
      expect(onRemove).toHaveBeenCalledWith("editor-1");
    });

    it("fires onPermissionChange when dropdown item selected", async () => {
      const onPermissionChange = vi.fn();
      render(
        <ShareDialog
          {...defaultProps}
          shares={[ownerEntry, editorEntry]}
          onPermissionChange={onPermissionChange}
        />
      );
      const triggers = screen.getAllByText("Editor");
      const permissionTrigger = triggers.find(
        (el) => el.closest("button")?.getAttribute("aria-haspopup") === "menu"
      )!;
      await userEvent.click(permissionTrigger.closest("button")!);
      const viewerItem = await screen.findByRole("menuitem", {
        name: "Viewer",
      });
      await userEvent.click(viewerItem);
      expect(onPermissionChange).toHaveBeenCalledWith("editor-1", "viewer");
    });
  });
});
