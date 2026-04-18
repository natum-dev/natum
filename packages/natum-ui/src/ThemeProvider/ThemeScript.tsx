const SCRIPT =
  '(function(){try{var m=document.cookie.match(/(?:^|; )natum-theme=(light|dark|system)/);var t=m?m[1]:"system";if(t==="system")t=matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light";document.documentElement.dataset.theme=t;}catch(e){}}());';

/**
 * Blocking inline script that sets `<html data-theme>` before first paint.
 * Drop inside `<head>` of the root document:
 *
 * ```tsx
 * <html>
 *   <head><ThemeScript /></head>
 *   <body>{children}</body>
 * </html>
 * ```
 *
 * Must be paired with `<ThemeProvider>` in the React tree. Without this
 * script, the app still works but flashes on first paint before the
 * provider's effect runs.
 */
export const ThemeScript = () => (
  <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />
);
