import { render, screen } from "@testing-library/react";
import { forwardRef, type AnchorHTMLAttributes } from "react";
import { describe, it, expect } from "vitest";
import { Tabs } from "./Tabs";
import { TabsList } from "./TabsList";
import { TabsTrigger } from "./TabsTrigger";

describe("TabsTrigger — polymorphic", () => {
  it("renders as anchor when as='a' is passed", () => {
    render(
      <Tabs defaultValue="a">
        <TabsList aria-label="m">
          <TabsTrigger as="a" value="a" href="#a">
            A
          </TabsTrigger>
        </TabsList>
      </Tabs>
    );
    const el = screen.getByRole("tab", { name: "A" });
    expect(el.tagName).toBe("A");
    expect(el).toHaveAttribute("href", "#a");
    expect(el).not.toHaveAttribute("type");
  });

  it("applies type='button' automatically when as is omitted (default button)", () => {
    render(
      <Tabs defaultValue="a">
        <TabsList aria-label="m">
          <TabsTrigger value="a">A</TabsTrigger>
        </TabsList>
      </Tabs>
    );
    expect(screen.getByRole("tab", { name: "A" })).toHaveAttribute("type", "button");
  });

  it("forwards ref to the rendered element (anchor case)", () => {
    const ref = { current: null as HTMLAnchorElement | null };
    render(
      <Tabs defaultValue="a">
        <TabsList aria-label="m">
          <TabsTrigger
            as="a"
            ref={ref as unknown as React.Ref<HTMLElement>}
            value="a"
            href="#a"
          >
            A
          </TabsTrigger>
        </TabsList>
      </Tabs>
    );
    expect(ref.current?.tagName).toBe("A");
  });

  it("works with a custom component via as", async () => {
    type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement>;
    const MyLink = forwardRef<HTMLAnchorElement, LinkProps>(function MyLink(
      props,
      ref
    ) {
      return <a ref={ref} data-mylink="true" {...props} />;
    });
    render(
      <Tabs defaultValue="a">
        <TabsList aria-label="m">
          <TabsTrigger as={MyLink} value="a" href="#a">
            A
          </TabsTrigger>
        </TabsList>
      </Tabs>
    );
    const el = screen.getByRole("tab", { name: "A" });
    expect(el).toHaveAttribute("data-mylink", "true");
  });
});
