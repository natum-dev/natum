import type { Meta, StoryObj } from "@storybook/react";

const colors: Record<string, Record<string, string>> = {
  blue: {
    50: "#eaedf1",
    100: "#c9d1dc",
    200: "#a5b2c4",
    300: "#8193ac",
    400: "#667c9b",
    500: "#4b658a",
    600: "#435b7d",
    700: "#384e6c",
    800: "#2e415c",
    900: "#1e2e44",
  },
  orange: {
    50: "#f9ece4",
    100: "#f0ccb5",
    200: "#e4a983",
    300: "#d88753",
    400: "#cf6f30",
    500: "#c65a12",
    600: "#b74f10",
    700: "#a2420d",
    800: "#8b360a",
    900: "#652506",
  },
  red: {
    50: "#f3e4e5",
    100: "#e1b9be",
    200: "#cd8b93",
    300: "#b95d68",
    400: "#aa3a47",
    500: "#9b1726",
    600: "#8e1422",
    700: "#7d101c",
    800: "#6c0c17",
    900: "#4e060e",
  },
  green: {
    50: "#e4ebe7",
    100: "#bbcec3",
    200: "#8ead9b",
    300: "#618c73",
    400: "#407455",
    500: "#1f5c37",
    600: "#1b5331",
    700: "#174829",
    800: "#123d22",
    900: "#0b2b16",
  },
  yellow: {
    50: "#fbf4e1",
    100: "#f5e2b5",
    200: "#eecf84",
    300: "#e7bc53",
    400: "#e2ad2e",
    500: "#dd9e09",
    600: "#ca9008",
    700: "#b27e07",
    800: "#9a6d06",
    900: "#734f04",
  },
  purple: {
    50: "#ebe4f0",
    100: "#cdbbda",
    200: "#ac8ec1",
    300: "#8b61a8",
    400: "#724095",
    500: "#591f82",
    600: "#511b77",
    700: "#461769",
    800: "#3c125b",
    900: "#2a0b41",
  },
  pink: {
    50: "#f2e7ed",
    100: "#ddc4d3",
    200: "#c69db6",
    300: "#ae7699",
    400: "#9c5a83",
    500: "#8a3f6e",
    600: "#7d3764",
    700: "#6c2d56",
    800: "#5b2448",
    900: "#3f1732",
  },
  teal: {
    50: "#e2ecec",
    100: "#b7d0d1",
    200: "#87b0b3",
    300: "#579095",
    400: "#33797e",
    500: "#0f6267",
    600: "#0d595e",
    700: "#0b4d52",
    800: "#094146",
    900: "#062f33",
  },
  brown: {
    50: "#eeeae3",
    100: "#d6cab9",
    200: "#bba88b",
    300: "#a0865d",
    400: "#8c6d3b",
    500: "#785419",
    600: "#6e4c16",
    700: "#5f4213",
    800: "#51380f",
    900: "#3b280a",
  },
  grey: {
    50: "#f0eeef",
    100: "#d9d6d7",
    200: "#bfbbbd",
    300: "#a5a1a3",
    400: "#918d8f",
    500: "#7d797b",
    600: "#716d6f",
    700: "#615d5f",
    800: "#514d4f",
    900: "#383436",
  },
};

const shades = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"];

function ColorPalette() {
  return (
    <div style={{ fontFamily: "Montserrat, sans-serif", maxWidth: 900 }}>
      <h2 style={{ margin: "0 0 24px", fontSize: 24, fontWeight: 600 }}>
        Color Palette
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {Object.entries(colors).map(([name, swatches]) => (
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
                      backgroundColor: swatches[shade],
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
                    {swatches[shade]}
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
