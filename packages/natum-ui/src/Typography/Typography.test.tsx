import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import * as React from "react";
import { Typography } from "./Typography";

describe("Typography", () => {
  it("renders children as a p tag by default", () => {
    render(<Typography>hello</Typography>);
    const el = screen.getByText("hello");
    expect(el.tagName).toBe("P");
    expect(el).toHaveClass("typography", "body1");
  });

  it("renders heading variants with correct tags", () => {
    const { container } = render(
      <>
        <Typography variant="h1">H1</Typography>
        <Typography variant="h2">H2</Typography>
        <Typography variant="h3">H3</Typography>
      </>
    );
    expect(container.querySelector("h1")).toHaveTextContent("H1");
    expect(container.querySelector("h2")).toHaveTextContent("H2");
    expect(container.querySelector("h3")).toHaveTextContent("H3");
  });

  it("renders code variant with code tag", () => {
    render(<Typography variant="code">snippet</Typography>);
    const el = screen.getByText("snippet");
    expect(el.tagName).toBe("CODE");
    expect(el).toHaveClass("code");
  });

  it("renders body variants as p tags", () => {
    render(<Typography variant="body2">text</Typography>);
    const el = screen.getByText("text");
    expect(el.tagName).toBe("P");
    expect(el).toHaveClass("body2");
  });

  it("applies color class", () => {
    render(<Typography color="error">err</Typography>);
    expect(screen.getByText("err")).toHaveClass("error");
  });

  it("overrides tag with the tag prop", () => {
    render(<Typography variant="h1" tag="span">span heading</Typography>);
    expect(screen.getByText("span heading").tagName).toBe("SPAN");
  });

  it("sanitizes unknown variants to p", () => {
    render(<Typography variant="caption">cap</Typography>);
    const el = screen.getByText("cap");
    expect(el.tagName).toBe("P");
    expect(el).toHaveClass("caption");
  });

  it("applies custom className", () => {
    render(<Typography className="custom">text</Typography>);
    expect(screen.getByText("text")).toHaveClass("custom");
  });

  it("forwards ref to the rendered element", () => {
    const ref = { current: null } as React.MutableRefObject<HTMLElement | null>;
    render(<Typography ref={ref} tag="h1">heading</Typography>);
    expect(ref.current).toBeInstanceOf(HTMLHeadingElement);
    expect(ref.current?.tagName).toBe("H1");
  });
});
