import { describe, expect, it } from "vitest";
import { formatSize } from "./format-size";

describe("formatSize", () => {
  it("renders bytes under 1024 with B suffix", () => {
    expect(formatSize(0)).toBe("0 B");
    expect(formatSize(1)).toBe("1 B");
    expect(formatSize(500)).toBe("500 B");
    expect(formatSize(1023)).toBe("1023 B");
  });

  it("renders KB with 1 decimal under 10 KB, no decimal otherwise", () => {
    expect(formatSize(1024)).toBe("1.0 KB");
    expect(formatSize(1536)).toBe("1.5 KB");
    expect(formatSize(10 * 1024)).toBe("10 KB");
    expect(formatSize(100 * 1024)).toBe("100 KB");
  });

  it("renders MB with 1 decimal under 10 MB, no decimal otherwise", () => {
    expect(formatSize(1024 * 1024)).toBe("1.0 MB");
    expect(formatSize(1.5 * 1024 * 1024)).toBe("1.5 MB");
    expect(formatSize(10 * 1024 * 1024)).toBe("10 MB");
    expect(formatSize(500 * 1024 * 1024)).toBe("500 MB");
  });

  it("renders GB with 2 decimals under 10 GB, 1 decimal otherwise", () => {
    expect(formatSize(1024 * 1024 * 1024)).toBe("1.00 GB");
    expect(formatSize(1.5 * 1024 * 1024 * 1024)).toBe("1.50 GB");
    expect(formatSize(10 * 1024 * 1024 * 1024)).toBe("10.0 GB");
    expect(formatSize(100 * 1024 * 1024 * 1024)).toBe("100.0 GB");
  });
});
