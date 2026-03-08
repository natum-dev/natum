import type { Meta, StoryObj } from "@storybook/react";

const presets: Record<
  string,
  {
    fontSize: number;
    fontWeight: number;
    lineHeight: number;
    letterSpacing: string;
  }
> = {
  h1: { fontSize: 48, fontWeight: 700, lineHeight: 1.2, letterSpacing: "-0.02em" },
  h2: { fontSize: 40, fontWeight: 700, lineHeight: 1.3, letterSpacing: "-0.015em" },
  h3: { fontSize: 32, fontWeight: 600, lineHeight: 1.4, letterSpacing: "-0.01em" },
  h4: { fontSize: 24, fontWeight: 600, lineHeight: 1.5, letterSpacing: "-0.005em" },
  h5: { fontSize: 20, fontWeight: 500, lineHeight: 1.5, letterSpacing: "0em" },
  h6: { fontSize: 18, fontWeight: 500, lineHeight: 1.6, letterSpacing: "0em" },
  body1: { fontSize: 16, fontWeight: 400, lineHeight: 1.6, letterSpacing: "0em" },
  body2: { fontSize: 14, fontWeight: 400, lineHeight: 1.6, letterSpacing: "0.01em" },
  body3: { fontSize: 12, fontWeight: 400, lineHeight: 1.5, letterSpacing: "0.02em" },
  caption: { fontSize: 12, fontWeight: 400, lineHeight: 1.4, letterSpacing: "0.02em" },
  code: { fontSize: 14, fontWeight: 400, lineHeight: 1.5, letterSpacing: "0em" },
};

function TypographyPresets() {
  return (
    <div style={{ fontFamily: "Montserrat, sans-serif", maxWidth: 1000 }}>
      <h2 style={{ margin: "0 0 32px", fontSize: 24, fontWeight: 600 }}>
        Typography Presets
      </h2>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: 13,
        }}
      >
        <thead>
          <tr
            style={{
              textAlign: "left",
              borderBottom: "2px solid #d8d4d0",
              color: "#555047",
            }}
          >
            <th style={{ padding: "8px 12px" }}>Preset</th>
            <th style={{ padding: "8px 12px" }}>Preview</th>
            <th style={{ padding: "8px 12px" }}>Size</th>
            <th style={{ padding: "8px 12px" }}>Weight</th>
            <th style={{ padding: "8px 12px" }}>Line Height</th>
            <th style={{ padding: "8px 12px" }}>Spacing</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(presets).map(([name, style]) => (
            <tr
              key={name}
              style={{ borderBottom: "1px solid #efedeb" }}
            >
              <td
                style={{
                  padding: "12px",
                  fontFamily: "monospace",
                  fontWeight: 600,
                  color: "#384e6c",
                  whiteSpace: "nowrap",
                }}
              >
                {name}
              </td>
              <td style={{ padding: "12px" }}>
                <span
                  style={{
                    fontFamily: name === "code" ? "monospace" : "Montserrat, sans-serif",
                    fontSize: style.fontSize,
                    fontWeight: style.fontWeight,
                    lineHeight: style.lineHeight,
                    letterSpacing: style.letterSpacing,
                    color: "#3a3632",
                  }}
                >
                  The quick brown fox jumps over the lazy dog
                </span>
              </td>
              <td
                style={{
                  padding: "12px",
                  whiteSpace: "nowrap",
                  color: "#736c5f",
                }}
              >
                {style.fontSize}px
              </td>
              <td
                style={{
                  padding: "12px",
                  color: "#736c5f",
                }}
              >
                {style.fontWeight}
              </td>
              <td
                style={{
                  padding: "12px",
                  color: "#736c5f",
                }}
              >
                {style.lineHeight}
              </td>
              <td
                style={{
                  padding: "12px",
                  fontFamily: "monospace",
                  color: "#736c5f",
                }}
              >
                {style.letterSpacing}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const meta: Meta = {
  title: "Design Tokens/Typography",
  component: TypographyPresets,
  parameters: {
    layout: "padded",
    controls: { disable: true },
    actions: { disable: true },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {};
