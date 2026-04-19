import { describe, expect, it } from "vitest";
import { formatFileSize } from "./format-size";

describe("formatFileSize", () => {
  it("renders bytes under 1024 with B suffix", () => {
    expect(formatFileSize(0)).toBe("0 B");
    expect(formatFileSize(1)).toBe("1 B");
    expect(formatFileSize(500)).toBe("500 B");
    expect(formatFileSize(1023)).toBe("1023 B");
  });

  it("renders KB with 1 decimal under 10 KB, no decimal otherwise", () => {
    expect(formatFileSize(1024)).toBe("1.0 KB");
    expect(formatFileSize(1536)).toBe("1.5 KB");
    expect(formatFileSize(10 * 1024)).toBe("10 KB");
    expect(formatFileSize(100 * 1024)).toBe("100 KB");
  });

  it("renders MB with 1 decimal under 10 MB, no decimal otherwise", () => {
    expect(formatFileSize(1024 * 1024)).toBe("1.0 MB");
    expect(formatFileSize(1.5 * 1024 * 1024)).toBe("1.5 MB");
    expect(formatFileSize(10 * 1024 * 1024)).toBe("10 MB");
    expect(formatFileSize(500 * 1024 * 1024)).toBe("500 MB");
  });

  it("renders GB with 2 decimals under 10 GB, 1 decimal otherwise", () => {
    expect(formatFileSize(1024 ** 3)).toBe("1.00 GB");
    expect(formatFileSize(1.5 * 1024 ** 3)).toBe("1.50 GB");
    expect(formatFileSize(10 * 1024 ** 3)).toBe("10.0 GB");
    expect(formatFileSize(100 * 1024 ** 3)).toBe("100.0 GB");
  });

  it("clamps negative input to 0 B", () => {
    expect(formatFileSize(-1)).toBe("0 B");
    expect(formatFileSize(-1024)).toBe("0 B");
  });

  it("throws RangeError on NaN", () => {
    expect(() => formatFileSize(NaN)).toThrow(RangeError);
  });

  it("throws RangeError on Infinity", () => {
    expect(() => formatFileSize(Infinity)).toThrow(RangeError);
    expect(() => formatFileSize(-Infinity)).toThrow(RangeError);
  });
});
