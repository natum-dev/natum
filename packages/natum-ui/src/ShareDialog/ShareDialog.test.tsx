import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { ShareDialog } from "./ShareDialog";
import type { ShareDialogProps } from "./ShareDialog";

const mockShares: ShareDialogProps["shares"] = [];

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
});
