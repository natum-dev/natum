import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { createRef } from "react";
import { Grid } from "./Grid";

describe("Grid", () => {
  // --- Renders ---
  it("renders children", () => {
    render(<Grid>Content</Grid>);
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("renders as a div by default", () => {
    render(<Grid data-testid="grid">x</Grid>);
    expect(screen.getByTestId("grid").tagName).toBe("DIV");
  });

  it("applies base grid class and default columns_1 when no props given", () => {
    render(<Grid data-testid="grid">x</Grid>);
    const el = screen.getByTestId("grid");
    expect(el).toHaveClass("grid", "columns_1", "gap_0");
  });

  // --- Columns ---
  it.each([1, 2, 3, 4, 6, 12] as const)(
    "applies columns_%i class when columns=%i",
    (cols) => {
      render(<Grid data-testid="grid" columns={cols}>x</Grid>);
      expect(screen.getByTestId("grid")).toHaveClass(`columns_${cols}`);
    }
  );

  // --- minChildWidth wins over columns ---
  it("uses inline grid-template-columns when minChildWidth is set", () => {
    render(
      <Grid data-testid="grid" minChildWidth="240px">
        x
      </Grid>
    );
    const el = screen.getByTestId("grid");
    expect(el.style.gridTemplateColumns).toBe(
      "repeat(auto-fit, minmax(240px, 1fr))"
    );
  });

  it("minChildWidth beats columns when both provided", () => {
    render(
      <Grid data-testid="grid" columns={3} minChildWidth="200px">
        x
      </Grid>
    );
    const el = screen.getByTestId("grid");
    expect(el.style.gridTemplateColumns).toBe(
      "repeat(auto-fit, minmax(200px, 1fr))"
    );
    expect(el).not.toHaveClass("columns_3");
  });

  // --- Gap ---
  it.each([0, 1, 2, 3, 4, 6, 8, 12, 16] as const)(
    "applies gap_%i class when gap=%i",
    (gap) => {
      render(<Grid data-testid="grid" gap={gap}>x</Grid>);
      expect(screen.getByTestId("grid")).toHaveClass(`gap_${gap}`);
    }
  );

  it("rowGap overrides gap on row axis", () => {
    render(
      <Grid data-testid="grid" gap={2} rowGap={8}>
        x
      </Grid>
    );
    const el = screen.getByTestId("grid");
    expect(el).toHaveClass("row_gap_8");
    expect(el).toHaveClass("gap_2");
  });

  it("columnGap overrides gap on column axis", () => {
    render(
      <Grid data-testid="grid" gap={2} columnGap={6}>
        x
      </Grid>
    );
    const el = screen.getByTestId("grid");
    expect(el).toHaveClass("column_gap_6");
    expect(el).toHaveClass("gap_2");
  });

  // --- Align / Justify ---
  it.each(["start", "center", "end", "stretch"] as const)(
    "applies align_%s class (align-items)",
    (align) => {
      render(<Grid data-testid="grid" align={align}>x</Grid>);
      expect(screen.getByTestId("grid")).toHaveClass(`align_${align}`);
    }
  );

  it.each(["start", "center", "end"] as const)(
    "applies justify_%s class (justify-items)",
    (justify) => {
      render(<Grid data-testid="grid" justify={justify}>x</Grid>);
      expect(screen.getByTestId("grid")).toHaveClass(`justify_${justify}`);
    }
  );

  // --- Polymorphic ---
  it.each(["section", "article", "ul", "ol", "main"] as const)(
    "renders as a %s element",
    (tag) => {
      render(<Grid data-testid="grid" as={tag}>x</Grid>);
      expect(screen.getByTestId("grid").tagName).toBe(tag.toUpperCase());
    }
  );

  // --- forwardRef ---
  it("forwards ref to the root element", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Grid ref={ref}>x</Grid>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  // --- className + rest ---
  it("merges custom className", () => {
    render(<Grid data-testid="grid" className="custom">x</Grid>);
    expect(screen.getByTestId("grid")).toHaveClass("grid", "custom");
  });

  it("spreads HTML attributes", () => {
    render(<Grid data-testid="grid" id="g" aria-label="grid">x</Grid>);
    const el = screen.getByTestId("grid");
    expect(el).toHaveAttribute("id", "g");
    expect(el).toHaveAttribute("aria-label", "grid");
  });
});
