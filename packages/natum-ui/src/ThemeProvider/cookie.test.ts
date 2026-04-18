import { describe, it, expect } from "vitest";
import { parseThemeCookie, serializeThemeCookie, THEME_COOKIE_NAME } from "./cookie";

describe("parseThemeCookie", () => {
  it("returns the theme from a single-cookie header", () => {
    expect(parseThemeCookie("natum-theme=light")).toBe("light");
    expect(parseThemeCookie("natum-theme=dark")).toBe("dark");
    expect(parseThemeCookie("natum-theme=system")).toBe("system");
  });

  it("returns null for an invalid value", () => {
    expect(parseThemeCookie("natum-theme=bogus")).toBeNull();
  });

  it("returns null for an empty header", () => {
    expect(parseThemeCookie("")).toBeNull();
  });

  it("extracts the theme when surrounded by other cookies", () => {
    expect(parseThemeCookie("foo=bar; natum-theme=dark; baz=qux")).toBe("dark");
  });

  it("returns null when the cookie is absent", () => {
    expect(parseThemeCookie("foo=bar; baz=qux")).toBeNull();
  });
});

describe("serializeThemeCookie", () => {
  it("produces a cookie string with standard attributes", () => {
    const result = serializeThemeCookie("dark");
    expect(result).toBe("natum-theme=dark; path=/; max-age=31536000; samesite=lax");
  });

  it("works for each valid value", () => {
    expect(serializeThemeCookie("light")).toContain("natum-theme=light");
    expect(serializeThemeCookie("system")).toContain("natum-theme=system");
  });
});

describe("THEME_COOKIE_NAME", () => {
  it("is the expected constant", () => {
    expect(THEME_COOKIE_NAME).toBe("natum-theme");
  });
});
