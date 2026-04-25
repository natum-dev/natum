import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ImagePreview } from "./ImagePreview";

describe("ImagePreview", () => {
  describe("rendering", () => {
    it("renders an img with correct src and alt", () => {
      render(<ImagePreview src="/photo.jpg" alt="Test photo" />);
      const img = screen.getByRole("img", { name: "Test photo" });
      expect(img).toHaveAttribute("src", "/photo.jpg");
    });

    it("reflects data-status on the wrapper", () => {
      const { container } = render(
        <ImagePreview src="/photo.jpg" alt="Test photo" />
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveAttribute("data-status", "loading");
    });
  });

  describe("loading state", () => {
    it("shows Spinner while image is loading", () => {
      render(<ImagePreview src="/photo.jpg" alt="Test" />);
      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("fires onLoad callback when image loads", () => {
      const onLoad = vi.fn();
      render(<ImagePreview src="/photo.jpg" alt="Test" onLoad={onLoad} />);
      const img = screen.getByRole("img", { name: "Test" });
      fireEvent.load(img);
      expect(onLoad).toHaveBeenCalledOnce();
    });
  });

  describe("error state", () => {
    it("shows error Figure when image fails to load", () => {
      render(<ImagePreview src="/broken.jpg" alt="Test" />);
      const img = screen.getByRole("img", { name: "Test" });
      fireEvent.error(img);
      expect(screen.getByText("Preview unavailable")).toBeInTheDocument();
    });

    it("fires onError callback on error", () => {
      const onError = vi.fn();
      render(<ImagePreview src="/broken.jpg" alt="Test" onError={onError} />);
      const img = screen.getByRole("img", { name: "Test" });
      fireEvent.error(img);
      expect(onError).toHaveBeenCalledOnce();
    });

    it("removes img from DOM on error", () => {
      render(<ImagePreview src="/broken.jpg" alt="Test" />);
      const img = screen.getByRole("img", { name: "Test" });
      fireEvent.error(img);
      expect(screen.queryByRole("img")).not.toBeInTheDocument();
    });
  });

  describe("src change", () => {
    it("resets to loading state when src changes", () => {
      const { container, rerender } = render(
        <ImagePreview src="/a.jpg" alt="Test" />
      );
      const img = screen.getByRole("img", { name: "Test" });
      fireEvent.load(img);
      expect(container.firstChild).toHaveAttribute("data-status", "loaded");

      rerender(<ImagePreview src="/b.jpg" alt="Test" />);
      expect(container.firstChild).toHaveAttribute("data-status", "loading");
    });

    it("clears previous error on new src", () => {
      const { container, rerender } = render(
        <ImagePreview src="/broken.jpg" alt="Test" />
      );
      const img = screen.getByRole("img", { name: "Test" });
      fireEvent.error(img);
      expect(container.firstChild).toHaveAttribute("data-status", "error");

      rerender(<ImagePreview src="/good.jpg" alt="Test" />);
      expect(container.firstChild).toHaveAttribute("data-status", "loading");
    });
  });

  describe("rest-spread", () => {
    it("passes rest props to wrapper div", () => {
      const { container } = render(
        <ImagePreview src="/photo.jpg" alt="Test" data-testid="custom" />
      );
      expect(container.firstChild).toHaveAttribute("data-testid", "custom");
    });

    it("merges className with base class", () => {
      const { container } = render(
        <ImagePreview src="/photo.jpg" alt="Test" className="extra" />
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain("extra");
      expect(wrapper.className).toContain("image_preview");
    });
  });
});
