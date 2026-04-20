import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, it, expect } from "vitest";
import { Avatar } from "./Avatar";
import { AvatarGroup } from "./AvatarGroup";

describe("AvatarGroup — basic rendering", () => {
  it("renders all children when count <= max", () => {
    render(
      <AvatarGroup max={5}>
        <Avatar name="Alice" data-testid="a" />
        <Avatar name="Bob" data-testid="b" />
        <Avatar name="Charlie" data-testid="c" />
      </AvatarGroup>
    );
    expect(screen.getByTestId("a")).toBeInTheDocument();
    expect(screen.getByTestId("b")).toBeInTheDocument();
    expect(screen.getByTestId("c")).toBeInTheDocument();
    expect(screen.queryByText(/^\+/)).not.toBeInTheDocument();
  });

  it("default max=3 — renders first 3 + +2 chip for 5 children", () => {
    render(
      <AvatarGroup>
        <Avatar name="Alice" data-testid="a" />
        <Avatar name="Bob" data-testid="b" />
        <Avatar name="Charlie" data-testid="c" />
        <Avatar name="Dana" data-testid="d" />
        <Avatar name="Eve" data-testid="e" />
      </AvatarGroup>
    );
    expect(screen.getByTestId("a")).toBeInTheDocument();
    expect(screen.getByTestId("b")).toBeInTheDocument();
    expect(screen.getByTestId("c")).toBeInTheDocument();
    expect(screen.queryByTestId("d")).not.toBeInTheDocument();
    expect(screen.queryByTestId("e")).not.toBeInTheDocument();
    expect(screen.getByText("+2")).toBeInTheDocument();
  });

  it("chip has accessible name '2 more'", () => {
    render(
      <AvatarGroup max={1}>
        <Avatar name="A" />
        <Avatar name="B" />
        <Avatar name="C" />
      </AvatarGroup>
    );
    expect(screen.getByRole("img", { name: "2 more" })).toBeInTheDocument();
  });

  it("role=group with default aria-label", () => {
    render(
      <AvatarGroup>
        <Avatar name="A" />
        <Avatar name="B" />
      </AvatarGroup>
    );
    expect(screen.getByRole("group")).toHaveAccessibleName("Group of 2 users");
  });

  it("aria-label prop overrides default", () => {
    render(
      <AvatarGroup aria-label="Shared with">
        <Avatar name="A" />
      </AvatarGroup>
    );
    expect(screen.getByRole("group")).toHaveAccessibleName("Shared with");
  });

  it("forwards ref + merges className", () => {
    const ref = createRef<HTMLSpanElement>();
    render(
      <AvatarGroup ref={ref} className="mine">
        <Avatar name="A" />
      </AvatarGroup>
    );
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    expect(ref.current).toHaveClass("mine");
  });
});

describe("AvatarGroup — total + overflow clamp", () => {
  it("total override produces correct +N from fewer rendered children", () => {
    render(
      <AvatarGroup max={3} total={12}>
        <Avatar name="A" />
        <Avatar name="B" />
        <Avatar name="C" />
      </AvatarGroup>
    );
    expect(screen.getByText("+9")).toBeInTheDocument();
  });

  it("total greater than 99 overflow clamps chip to +99", () => {
    render(
      <AvatarGroup max={1} total={200}>
        <Avatar name="A" />
      </AvatarGroup>
    );
    expect(screen.getByText("+99")).toBeInTheDocument();
  });

  it("max=0 renders only the +N chip (no avatars)", () => {
    render(
      <AvatarGroup max={0}>
        <Avatar name="A" data-testid="a" />
        <Avatar name="B" data-testid="b" />
      </AvatarGroup>
    );
    expect(screen.queryByTestId("a")).not.toBeInTheDocument();
    expect(screen.queryByTestId("b")).not.toBeInTheDocument();
    expect(screen.getByText("+2")).toBeInTheDocument();
  });

  it("negative max is treated as 0", () => {
    render(
      <AvatarGroup max={-5}>
        <Avatar name="A" />
      </AvatarGroup>
    );
    expect(screen.getByText("+1")).toBeInTheDocument();
  });

  it("max > children.length → no chip", () => {
    render(
      <AvatarGroup max={10}>
        <Avatar name="A" />
        <Avatar name="B" />
      </AvatarGroup>
    );
    expect(screen.queryByText(/^\+/)).not.toBeInTheDocument();
  });

  it("total < visibleCount → no chip", () => {
    render(
      <AvatarGroup max={3} total={1}>
        <Avatar name="A" />
      </AvatarGroup>
    );
    expect(screen.queryByText(/^\+/)).not.toBeInTheDocument();
  });
});
