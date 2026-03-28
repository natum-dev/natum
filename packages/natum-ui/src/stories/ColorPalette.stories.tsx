import type { Meta, StoryObj } from "@storybook/react";
import { useState, useEffect } from "react";
import "./color-palette.scss";

const colorFamilies = [
  "blue",
  "red",
  "green",
  "yellow",
  "purple",
  "grey",
  "orange",
  "teal",
  "pink",
];

const shades = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"];

function getTokenVar(family: string, shade: string) {
  return `--palette-${family}-${shade}`;
}

function resolveColors() {
  const computed = getComputedStyle(document.documentElement);
  const resolved: Record<string, Record<string, string>> = {};
  for (const family of colorFamilies) {
    resolved[family] = {};
    for (const shade of shades) {
      const value = computed.getPropertyValue(getTokenVar(family, shade)).trim();
      if (value) {
        resolved[family][shade] = value;
      }
    }
  }
  return resolved;
}

function ColorPalette() {
  const [colors, setColors] = useState<Record<string, Record<string, string>>>({});

  useEffect(() => {
    setColors(resolveColors());
  }, []);

  if (Object.keys(colors).length === 0) return null;

  return (
    <div style={{ fontFamily: "Montserrat, sans-serif", maxWidth: 900 }}>
      <h2 style={{ margin: "0 0 24px", fontSize: 24, fontWeight: 600 }}>
        Color Palette
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {colorFamilies.map((name) => (
          <div key={name}>
            <h3
              style={{
                margin: "0 0 8px",
                fontSize: 14,
                fontWeight: 600,
                textTransform: "capitalize",
              }}
            >
              {name}
            </h3>
            <div style={{ display: "flex", gap: 0 }}>
              {shades.map((shade) => (
                <div
                  key={shade}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: 48,
                      backgroundColor: `var(${getTokenVar(name, shade)})`,
                      borderRadius: shade === "50" ? "6px 0 0 6px" : shade === "900" ? "0 6px 6px 0" : 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 10,
                      color: "#555",
                      fontWeight: 500,
                    }}
                  >
                    {shade}
                  </span>
                  <span
                    style={{
                      fontSize: 9,
                      color: "#999",
                      fontFamily: "monospace",
                    }}
                  >
                    {colors[name]?.[shade] ?? ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const meta: Meta = {
  title: "Design Tokens/Color Palette",
  component: ColorPalette,
  parameters: {
    layout: "padded",
    controls: { disable: true },
    actions: { disable: true },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {};

function SemanticTokens() {
  const semantics = ["primary", "secondary", "error", "success", "warning", "info", "neutral"];
  const roles = ["bg", "surface", "text", "contrast", "border"];
  const neutralExtras = [
    "neutral-text-secondary",
    "neutral-text-disabled",
    "neutral-text-link",
    "neutral-text-inverse",
    "neutral-bg-elevated",
    "neutral-bg-overlay",
    "neutral-bg-inset",
  ];

  return (
    <div style={{ fontFamily: "Montserrat, sans-serif", maxWidth: 900 }}>
      <h2 style={{ margin: "0 0 24px", fontSize: 24, fontWeight: 600 }}>
        Semantic Color Tokens
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {semantics.map((name) => (
          <div key={name}>
            <h3
              style={{
                margin: "0 0 8px",
                fontSize: 14,
                fontWeight: 600,
                textTransform: "capitalize",
              }}
            >
              {name}
            </h3>
            <div style={{ display: "flex", gap: 0 }}>
              {roles.map((role) => (
                <div
                  key={role}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: 48,
                      backgroundColor: `var(--${name}-${role})`,
                      borderRadius:
                        role === "bg"
                          ? "6px 0 0 6px"
                          : role === "border"
                            ? "0 6px 6px 0"
                            : 0,
                      border: role === "contrast" ? "1px solid #ccc" : "none",
                    }}
                  />
                  <span style={{ fontSize: 10, color: "#555", fontWeight: 500 }}>
                    {role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <h3 style={{ margin: "32px 0 12px", fontSize: 16, fontWeight: 600 }}>
        Neutral Extras
      </h3>
      <div style={{ display: "flex", gap: 0 }}>
        {neutralExtras.map((token, i) => (
          <div
            key={token}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
            }}
          >
            <div
              style={{
                width: "100%",
                height: 48,
                backgroundColor: `var(--${token})`,
                borderRadius:
                  i === 0
                    ? "6px 0 0 6px"
                    : i === neutralExtras.length - 1
                      ? "0 6px 6px 0"
                      : 0,
                border: "1px solid #eee",
              }}
            />
            <span style={{ fontSize: 8, color: "#555", fontWeight: 500 }}>
              {token.replace("neutral-", "")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export const Semantic: Story = {
  render: () => <SemanticTokens />,
};
