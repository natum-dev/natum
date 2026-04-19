/**
 * Formats a byte count as a human-readable size string.
 *
 * Rendering rules (preserved from UploadPanel's original `formatSize`):
 * - Bytes below 1024 render as "N B" with no decimal.
 * - KB/MB render with 1 decimal below 10, 0 decimals at or above 10.
 * - GB (1024**3 and above) render with 2 decimals below 10, 1 decimal otherwise.
 *
 * Edge cases:
 * - Negative input is clamped to 0.
 * - NaN and ±Infinity throw RangeError.
 *
 * @throws {RangeError} When `bytes` is NaN or ±Infinity.
 */
export const formatFileSize = (bytes: number): string => {
  if (!Number.isFinite(bytes)) {
    throw new RangeError("formatFileSize: expected a finite number");
  }
  const b = bytes < 0 ? 0 : bytes;
  if (b < 1024) return `${b} B`;
  const kb = b / 1024;
  if (kb < 1024) return `${kb.toFixed(kb < 10 ? 1 : 0)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(mb < 10 ? 1 : 0)} MB`;
  const gb = mb / 1024;
  return `${gb.toFixed(gb < 10 ? 2 : 1)} GB`;
};
