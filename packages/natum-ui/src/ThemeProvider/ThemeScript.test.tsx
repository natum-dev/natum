import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ThemeScript } from "./ThemeScript";

describe("ThemeScript", () => {
  it("renders a <script> element", () => {
    const { container } = render(<ThemeScript />);
    const script = container.querySelector("script");
    expect(script).not.toBeNull();
  });

  it("references the natum-theme cookie name", () => {
    const { container } = render(<ThemeScript />);
    const script = container.querySelector("script");
    expect(script?.innerHTML).toContain("natum-theme");
  });

  it("references prefers-color-scheme", () => {
    const { container } = render(<ThemeScript />);
    const script = container.querySelector("script");
    expect(script?.innerHTML).toContain("prefers-color-scheme");
  });

  it("sets data-theme on documentElement", () => {
    const { container } = render(<ThemeScript />);
    const script = container.querySelector("script");
    expect(script?.innerHTML).toContain("documentElement");
    expect(script?.innerHTML).toContain("dataset.theme");
  });

  it("emits the exact expected script body (locks inline content)", () => {
    const { container } = render(<ThemeScript />);
    const script = container.querySelector("script");
    expect(script?.innerHTML).toBe(
      '(function(){try{var m=document.cookie.match(/(?:^|;\\s*)natum-theme=(light|dark|system)(?:;|$)/);var t=m?m[1]:"system";if(t==="system")t=matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light";document.documentElement.dataset.theme=t;}catch(e){}}());'
    );
  });
});
