import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
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
});
