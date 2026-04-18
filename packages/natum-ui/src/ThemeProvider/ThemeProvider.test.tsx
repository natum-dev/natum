import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToString } from "react-dom/server";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { ThemeProvider } from "./ThemeProvider";
import { useTheme } from "./useTheme";
import { THEME_COOKIE_NAME } from "./cookie";

type MatchMediaListener = (event: { matches: boolean }) => void;

const createMatchMediaMock = (matches: boolean) => {
  const listeners = new Set<MatchMediaListener>();
  const mql = {
    matches,
    media: "(prefers-color-scheme: dark)",
    addEventListener: (_: string, cb: MatchMediaListener) => {
      listeners.add(cb);
    },
    removeEventListener: (_: string, cb: MatchMediaListener) => {
      listeners.delete(cb);
    },
    dispatchChange: (next: boolean) => {
      mql.matches = next;
      listeners.forEach((cb) => cb({ matches: next }));
    },
  };
  return mql;
};

const installMatchMedia = (initialMatches: boolean) => {
  const mql = createMatchMediaMock(initialMatches);
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => mql)
  );
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: vi.fn(() => mql),
  });
  return mql;
};

const clearThemeCookie = () => {
  document.cookie = `${THEME_COOKIE_NAME}=; path=/; max-age=0`;
};

const ThemeConsumer = () => {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="resolved">{resolvedTheme ?? "null"}</span>
      <button onClick={toggleTheme}>toggle</button>
      <button onClick={() => setTheme("dark")}>set dark</button>
      <button onClick={() => setTheme("light")}>set light</button>
      <button onClick={() => setTheme("system")}>set system</button>
    </div>
  );
};

describe("ThemeProvider", () => {
  beforeEach(() => {
    clearThemeCookie();
    document.documentElement.removeAttribute("data-theme");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("resolves to dark when system prefers dark and no cookie is set", () => {
    installMatchMedia(true);
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );
    expect(screen.getByTestId("theme")).toHaveTextContent("system");
    expect(screen.getByTestId("resolved")).toHaveTextContent("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
  });

  it("resolves to light when system prefers light and no cookie is set", () => {
    installMatchMedia(false);
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );
    expect(screen.getByTestId("theme")).toHaveTextContent("system");
    expect(screen.getByTestId("resolved")).toHaveTextContent("light");
    expect(document.documentElement.dataset.theme).toBe("light");
  });

  it("tracks live prefers-color-scheme changes while in system mode", () => {
    const mql = installMatchMedia(false);
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );
    expect(screen.getByTestId("resolved")).toHaveTextContent("light");
    act(() => {
      mql.dispatchChange(true);
    });
    expect(screen.getByTestId("resolved")).toHaveTextContent("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
  });

  it("reads the cookie on mount and uses its value over system preference", () => {
    installMatchMedia(true); // system dark
    document.cookie = `${THEME_COOKIE_NAME}=light; path=/`;
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );
    expect(screen.getByTestId("theme")).toHaveTextContent("light");
    expect(screen.getByTestId("resolved")).toHaveTextContent("light");
  });

  it("does not write a cookie on mount when the user has not interacted", () => {
    installMatchMedia(false);
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );
    expect(document.cookie).not.toContain(THEME_COOKIE_NAME);
  });

  it("writes the cookie when setTheme is called", async () => {
    installMatchMedia(false);
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );
    await user.click(screen.getByText("set dark"));
    expect(document.cookie).toContain(`${THEME_COOKIE_NAME}=dark`);
    expect(screen.getByTestId("resolved")).toHaveTextContent("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
  });

  it("writes 'system' to cookie when setTheme('system') is called", async () => {
    installMatchMedia(true);
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );
    await user.click(screen.getByText("set light"));
    expect(document.cookie).toContain(`${THEME_COOKIE_NAME}=light`);
    await user.click(screen.getByText("set system"));
    expect(document.cookie).toContain(`${THEME_COOKIE_NAME}=system`);
    expect(screen.getByTestId("resolved")).toHaveTextContent("dark");
  });

  it("toggleTheme flips resolvedTheme and writes an explicit choice", async () => {
    installMatchMedia(true); // system dark
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );
    expect(screen.getByTestId("theme")).toHaveTextContent("system");
    await user.click(screen.getByText("toggle"));
    expect(screen.getByTestId("theme")).toHaveTextContent("light");
    expect(screen.getByTestId("resolved")).toHaveTextContent("light");
    expect(document.cookie).toContain(`${THEME_COOKIE_NAME}=light`);
  });

  it("toggleTheme from explicit dark goes to light", async () => {
    installMatchMedia(false);
    document.cookie = `${THEME_COOKIE_NAME}=dark; path=/`;
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );
    expect(screen.getByTestId("resolved")).toHaveTextContent("dark");
    await user.click(screen.getByText("toggle"));
    expect(screen.getByTestId("theme")).toHaveTextContent("light");
    expect(screen.getByTestId("resolved")).toHaveTextContent("light");
  });

  it("renders safely in a server environment", () => {
    // renderToString must not throw; resolvedTheme should be null on the server.
    const html = renderToString(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );
    expect(html).toContain('data-testid="theme"');
    expect(html).toContain("system");
    expect(html).toContain('data-testid="resolved"');
    // The resolved span renders "null" because resolvedTheme is null during SSR.
    expect(html).toContain(">null<");
  });
});

describe("useTheme", () => {
  it("throws a helpful error when used outside ThemeProvider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<ThemeConsumer />)).toThrow(
      "useTheme must be used within a <ThemeProvider> component. Wrap your app at the root level."
    );
    spy.mockRestore();
  });
});
