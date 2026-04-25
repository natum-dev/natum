export const HASH_PALETTE = [
  "red",
  "orange",
  "yellow",
  "green",
  "teal",
  "blue",
  "purple",
  "pink",
] as const;

export type HashPaletteColor = (typeof HASH_PALETTE)[number];

export function deriveInitials(name: string | undefined): string {
  if (!name) return "";
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  return words
    .slice(0, 2)
    .map((w) => w.charAt(0))
    .join("")
    .toUpperCase();
}

function djb2(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function pickColor(
  name: string | undefined
): HashPaletteColor | "neutral" {
  if (!name) return "neutral";
  return HASH_PALETTE[djb2(name) % HASH_PALETTE.length];
}
