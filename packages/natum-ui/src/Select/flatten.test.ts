import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Fragment, createElement } from "react";
import { flatten } from "./flatten";
import { SelectItem } from "./SelectItem";
import { SelectGroup } from "./SelectGroup";

const h = createElement;

describe("flatten", () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  });
  afterEach(() => {
    warnSpy.mockRestore();
  });

  it("empty children → empty items + tree", () => {
    const { items, tree } = flatten(null);
    expect(items).toEqual([]);
    expect(tree).toEqual([]);
  });

  it("single SelectItem → one flat entry + one tree entry", () => {
    const el = h(SelectItem, { value: "a", key: "a" }, "Apple");
    const { items, tree } = flatten(el);
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      index: 0,
      value: "a",
      disabled: false,
      textValue: "apple",
    });
    expect(tree).toHaveLength(1);
    expect(tree[0]).toMatchObject({ kind: "item" });
  });

  it("multiple SelectItems assign incrementing indices", () => {
    const { items } = flatten([
      h(SelectItem, { value: "a", key: "a" }, "Apple"),
      h(SelectItem, { value: "b", key: "b" }, "Banana"),
      h(SelectItem, { value: "c", key: "c" }, "Cherry"),
    ]);
    expect(items.map((i) => i.index)).toEqual([0, 1, 2]);
    expect(items.map((i) => i.value)).toEqual(["a", "b", "c"]);
  });

  it("SelectGroup with items emits a group tree node; global indices continue across groups", () => {
    const children = [
      h(
        SelectGroup,
        { label: "Fruit", key: "g1" },
        h(SelectItem, { value: "a", key: "a" }, "Apple"),
        h(SelectItem, { value: "b", key: "b" }, "Banana")
      ),
      h(SelectItem, { value: "c", key: "c" }, "Carrot"),
    ];
    const { items, tree } = flatten(children);

    expect(items.map((i) => [i.index, i.value])).toEqual([
      [0, "a"],
      [1, "b"],
      [2, "c"],
    ]);
    expect(tree).toHaveLength(2);
    expect(tree[0]).toMatchObject({
      kind: "group",
      label: "Fruit",
    });
    expect((tree[0] as { kind: "group"; items: unknown[] }).items).toHaveLength(
      2
    );
    expect(tree[1]).toMatchObject({ kind: "item" });
  });

  it("mixed flat + grouped ordering is preserved in tree", () => {
    const children = [
      h(SelectItem, { value: "z", key: "z" }, "Zzz"),
      h(
        SelectGroup,
        { label: "Letters", key: "g" },
        h(SelectItem, { value: "a", key: "a" }, "A")
      ),
    ];
    const { tree } = flatten(children);
    expect(tree[0]).toMatchObject({ kind: "item" });
    expect(tree[1]).toMatchObject({ kind: "group", label: "Letters" });
  });

  it("non-SelectItem child of SelectGroup warns and is skipped", () => {
    const children = h(
      SelectGroup,
      { label: "G", key: "g" },
      h(SelectItem, { value: "a", key: "a" }, "A"),
      h("div", { key: "bad" }, "I am a div")
    );
    const { items } = flatten(children);
    expect(items).toHaveLength(1);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("SelectGroup")
    );
  });

  it("non-SelectItem/non-SelectGroup top-level child warns and is skipped", () => {
    const children = [
      h(SelectItem, { value: "a", key: "a" }, "A"),
      h("div", { key: "bad" }, "bad"),
    ];
    const { items } = flatten(children);
    expect(items).toHaveLength(1);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("Select")
    );
  });

  it("nested SelectGroup warns and inner items are flattened into the outer group", () => {
    const children = h(
      SelectGroup,
      { label: "Outer", key: "outer" },
      h(SelectItem, { value: "a", key: "a" }, "A"),
      h(
        SelectGroup,
        { label: "Inner", key: "inner" },
        h(SelectItem, { value: "b", key: "b" }, "B")
      )
    );
    const { items, tree } = flatten(children);
    expect(items).toHaveLength(2);
    expect(items.map((i) => i.value)).toEqual(["a", "b"]);
    expect(tree).toHaveLength(1);
    expect((tree[0] as { kind: "group"; items: unknown[] }).items).toHaveLength(
      2
    );
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("nested")
    );
  });

  it("textValue falls back to props.textValue when children is not a plain string", () => {
    const el = h(
      SelectItem,
      { value: "a", key: "a", textValue: "Apple Pie" },
      h("span", null, "Apple"),
      h("span", null, " 🍎")
    );
    const { items } = flatten(el);
    expect(items[0].textValue).toBe("apple pie");
  });

  it("Fragment children at top level are traversed transparently", () => {
    const children = h(
      Fragment,
      null,
      h(SelectItem, { value: "a", key: "a" }, "A"),
      h(SelectItem, { value: "b", key: "b" }, "B")
    );
    const { items } = flatten(children);
    expect(items).toHaveLength(2);
  });

  it("disabled flag passes through to the FlatItem", () => {
    const el = h(SelectItem, { value: "a", disabled: true, key: "a" }, "A");
    const { items } = flatten(el);
    expect(items[0].disabled).toBe(true);
  });
});
