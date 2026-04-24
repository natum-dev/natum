import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PermissionBadge } from "./PermissionBadge";

describe("PermissionBadge", () => {
  describe("level rendering", () => {
    it("renders Owner with primary color and star icon for level=owner", () => {
      render(<PermissionBadge level="owner" data-testid="badge" />);
      const badge = screen.getByTestId("badge");
      expect(badge).toHaveTextContent("Owner");
      expect(badge).toHaveClass("primary");
      expect(badge).toHaveClass("soft");
      expect(badge.querySelector("[aria-hidden='true']")).toBeInTheDocument();
    });

    it("renders Editor with secondary color and pencil icon for level=editor", () => {
      render(<PermissionBadge level="editor" data-testid="badge" />);
      const badge = screen.getByTestId("badge");
      expect(badge).toHaveTextContent("Editor");
      expect(badge).toHaveClass("secondary");
      expect(badge).toHaveClass("soft");
    });

    it("renders Viewer with neutral color and eye icon for level=viewer", () => {
      render(<PermissionBadge level="viewer" data-testid="badge" />);
      const badge = screen.getByTestId("badge");
      expect(badge).toHaveTextContent("Viewer");
      expect(badge).toHaveClass("neutral");
      expect(badge).toHaveClass("soft");
    });
  });

  describe("size", () => {
    it("defaults to sm", () => {
      render(<PermissionBadge level="owner" data-testid="badge" />);
      expect(screen.getByTestId("badge")).toHaveClass("sm");
    });

    it("accepts size=md", () => {
      render(<PermissionBadge level="owner" size="md" data-testid="badge" />);
      expect(screen.getByTestId("badge")).toHaveClass("md");
    });
  });

  describe("rest-spread", () => {
    it("passes rest props through to Badge", () => {
      render(<PermissionBadge level="owner" data-testid="custom" />);
      expect(screen.getByTestId("custom")).toBeInTheDocument();
    });

    it("merges className", () => {
      render(<PermissionBadge level="owner" className="extra" data-testid="badge" />);
      const badge = screen.getByTestId("badge");
      expect(badge.className).toContain("extra");
      expect(badge.className).toContain("badge");
    });
  });

  describe("ref forwarding", () => {
    it("forwards ref to Badge span", () => {
      const ref = createRef<HTMLSpanElement>();
      render(<PermissionBadge level="owner" ref={ref} />);
      expect(ref.current?.tagName).toBe("SPAN");
    });
  });
});
