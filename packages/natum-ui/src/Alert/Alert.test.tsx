import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { createRef } from "react";
import userEvent from "@testing-library/user-event";
import { Alert } from "./Alert";

describe("Alert", () => {
  // --- Renders ---
  it("renders as a div with base class + default info type class", () => {
    render(<Alert data-testid="alert">hello</Alert>);
    const el = screen.getByTestId("alert");
    expect(el.tagName).toBe("DIV");
    expect(el).toHaveClass("alert", "info");
  });

  it("renders children as message body", () => {
    render(<Alert>hello world</Alert>);
    expect(screen.getByText("hello world")).toBeInTheDocument();
  });

  it("renders title when provided", () => {
    render(
      <Alert title="Heads up">
        details
      </Alert>
    );
    expect(screen.getByText("Heads up")).toHaveClass("title");
    expect(screen.getByText("details")).toBeInTheDocument();
  });

  // --- Type → class ---
  it.each(["success", "error", "warning", "info"] as const)(
    "applies %s type class",
    (type) => {
      render(
        <Alert data-testid="alert" type={type}>
          x
        </Alert>
      );
      expect(screen.getByTestId("alert")).toHaveClass(type);
    }
  );

  // --- Icons ---
  it("renders default icon per type", () => {
    const { container } = render(<Alert type="success">x</Alert>);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders a custom icon component when icon prop is a component", () => {
    const Custom = () => <svg data-testid="custom-icon" />;
    render(<Alert icon={Custom}>x</Alert>);
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });

  it("omits the icon when icon={false}", () => {
    const { container } = render(<Alert icon={false}>x</Alert>);
    expect(container.querySelector("svg")).not.toBeInTheDocument();
  });

  // --- role / aria-live ---
  it("sets role=alert + aria-live=assertive for type=error", () => {
    render(
      <Alert data-testid="alert" type="error">
        oops
      </Alert>
    );
    const el = screen.getByTestId("alert");
    expect(el).toHaveAttribute("role", "alert");
    expect(el).toHaveAttribute("aria-live", "assertive");
  });

  it.each(["success", "warning", "info"] as const)(
    "sets role=status + aria-live=polite for type=%s",
    (type) => {
      render(
        <Alert data-testid="alert" type={type}>
          x
        </Alert>
      );
      const el = screen.getByTestId("alert");
      expect(el).toHaveAttribute("role", "status");
      expect(el).toHaveAttribute("aria-live", "polite");
    }
  );

  // --- Dismiss ---
  it("does not render a close button by default", () => {
    render(<Alert>x</Alert>);
    expect(screen.queryByLabelText("Dismiss")).not.toBeInTheDocument();
  });

  it("renders a close button when dismissible", () => {
    render(<Alert dismissible>x</Alert>);
    expect(screen.getByLabelText("Dismiss")).toBeInTheDocument();
  });

  it("uncontrolled dismiss removes the alert from the DOM on close click", async () => {
    const user = userEvent.setup();
    render(
      <Alert data-testid="alert" dismissible>
        x
      </Alert>
    );
    expect(screen.getByTestId("alert")).toBeInTheDocument();
    await user.click(screen.getByLabelText("Dismiss"));
    expect(screen.queryByTestId("alert")).not.toBeInTheDocument();
  });

  it("controlled dismiss fires onDismiss and does NOT hide the alert", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(
      <Alert data-testid="alert" dismissible onDismiss={onDismiss}>
        x
      </Alert>
    );
    await user.click(screen.getByLabelText("Dismiss"));
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("alert")).toBeInTheDocument();
  });

  // --- className + ref + rest ---
  it("merges custom className", () => {
    render(
      <Alert data-testid="alert" className="custom">
        x
      </Alert>
    );
    expect(screen.getByTestId("alert")).toHaveClass("alert", "info", "custom");
  });

  it("forwards ref to the root div", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Alert ref={ref}>x</Alert>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("spreads HTML attributes", () => {
    render(
      <Alert data-testid="alert" id="a1" aria-label="banner">
        x
      </Alert>
    );
    const el = screen.getByTestId("alert");
    expect(el).toHaveAttribute("id", "a1");
    expect(el).toHaveAttribute("aria-label", "banner");
  });
});
