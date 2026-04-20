"use client";

import { useEffect, useRef, useState } from "react";

interface Event {
  time: string;
  source: "resize" | "mutation" | "visibility" | "pageshow" | "system";
  detail: string;
}

export default function ObserverTestPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [viewport, setViewport] = useState({
    width: 0,
    height: 0,
    docWidth: 0,
    docHeight: 0,
    visualWidth: 0,
    visualHeight: 0,
  });
  const initialViewport = useRef<typeof viewport | null>(null);
  const lastResize = useRef<number>(0);

  const log = (source: Event["source"], detail: string) => {
    setEvents((prev) =>
      [
        { time: new Date().toLocaleTimeString(), source, detail },
        ...prev,
      ].slice(0, 100)
    );
  };

  const measure = () => {
    const vp = {
      width: window.innerWidth,
      height: window.innerHeight,
      docWidth: document.documentElement.clientWidth,
      docHeight: document.documentElement.clientHeight,
      visualWidth: window.visualViewport?.width ?? 0,
      visualHeight: window.visualViewport?.height ?? 0,
    };
    setViewport(vp);
    return vp;
  };

  useEffect(() => {
    const vp = measure();
    initialViewport.current = vp;
    log("system", `Initial viewport: ${vp.width}x${vp.height} (visual: ${vp.visualWidth}x${vp.visualHeight})`);

    // ResizeObserver on documentElement
    const resizeObserver = new ResizeObserver((entries) => {
      const now = Date.now();
      if (now - lastResize.current < 50) return; // debounce
      lastResize.current = now;

      const entry = entries[0];
      const vp = measure();
      const initial = initialViewport.current!;
      const heightDelta = vp.height - initial.height;
      const widthDelta = vp.width - initial.width;

      const sizeStr = `${Math.round(entry.contentRect.width)}x${Math.round(entry.contentRect.height)}`;
      const deltaStr = `Δ ${widthDelta > 0 ? "+" : ""}${widthDelta}w ${heightDelta > 0 ? "+" : ""}${heightDelta}h`;

      log("resize", `${sizeStr} | ${deltaStr}`);

      // Heuristic: significant height increase suggests Custom Tab → Chrome
      if (heightDelta > 50) {
        log("system", `*** Height grew by ${heightDelta}px — likely Custom Tab → Chrome (URL bar/UI took less space) ***`);
      } else if (heightDelta < -50) {
        log("system", `*** Height shrank by ${Math.abs(heightDelta)}px — likely Chrome → Custom Tab ***`);
      }
    });
    resizeObserver.observe(document.documentElement);

    // MutationObserver on entire document
    let mutationCount = 0;
    const mutationObserver = new MutationObserver((mutations) => {
      mutationCount += mutations.length;
      const types = new Set(mutations.map((m) => m.type));
      const targets = new Set(
        mutations
          .map((m) => (m.target as Element).tagName?.toLowerCase())
          .filter(Boolean)
      );
      log("mutation", `${mutations.length} mutation(s) types=[${[...types].join(",")}] targets=[${[...targets].slice(0, 5).join(",")}]`);
    });
    mutationObserver.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: false,
    });

    // visibilitychange — fires when tab is hidden/shown
    const onVisibility = () => {
      log("visibility", `state=${document.visibilityState} hidden=${document.hidden}`);
    };
    document.addEventListener("visibilitychange", onVisibility);

    // pageshow / pagehide — bfcache
    const onPageShow = (e: PageTransitionEvent) => {
      log("pageshow", `persisted=${e.persisted}`);
    };
    const onPageHide = (e: PageTransitionEvent) => {
      log("pageshow", `pagehide persisted=${e.persisted}`);
    };
    window.addEventListener("pageshow", onPageShow);
    window.addEventListener("pagehide", onPageHide);

    // window.resize event — for comparison
    const onWindowResize = () => {
      const vp = measure();
      // Don't double-log, ResizeObserver should catch this
    };
    window.addEventListener("resize", onWindowResize);

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("resize", onWindowResize);
    };
  }, []);

  return (
    <main style={{ fontFamily: "-apple-system, sans-serif", padding: 16, background: "#fafafa", minHeight: "100vh" }}>
      <div style={cardStyle}>
        <h2 style={{ fontSize: 20, margin: 0 }}>Observer Test (Custom Tab → Chrome Detection)</h2>
        <p style={{ color: "#888", fontSize: 13, margin: "4px 0 12px" }}>
          Uses ResizeObserver + MutationObserver to detect viewport/DOM changes when transitioning from Custom Tab to external Chrome
        </p>
      </div>

      <div style={cardStyle}>
        <h3 style={{ fontSize: 15, margin: "0 0 8px" }}>Current Viewport</h3>
        <table style={{ fontSize: 12, fontFamily: "monospace" }}>
          <tbody>
            <tr><td style={tdLabel}>window.innerWidth/Height</td><td>{viewport.width} x {viewport.height}</td></tr>
            <tr><td style={tdLabel}>documentElement.clientWidth/Height</td><td>{viewport.docWidth} x {viewport.docHeight}</td></tr>
            <tr><td style={tdLabel}>visualViewport.width/height</td><td>{viewport.visualWidth} x {viewport.visualHeight}</td></tr>
            {initialViewport.current && (
              <tr style={{ color: "#888" }}>
                <td style={tdLabel}>Initial</td>
                <td>{initialViewport.current.width} x {initialViewport.current.height}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={cardStyle}>
        <h3 style={{ fontSize: 15, margin: "0 0 8px" }}>How to Test</h3>
        <ol style={{ fontSize: 13, color: "#555", paddingLeft: 20, margin: 0 }}>
          <li>Open this page from the Android app (Custom Tab)</li>
          <li>Note the initial viewport size</li>
          <li>Tap three-dot menu → &quot;Open in Chrome&quot;</li>
          <li>Watch the events log for viewport changes</li>
        </ol>
      </div>

      <div style={cardStyle}>
        <h3 style={{ fontSize: 15, margin: "0 0 8px" }}>Events ({events.length})</h3>
        <div style={{ maxHeight: "50vh", overflowY: "auto" }}>
          {events.map((e, i) => (
            <div
              key={i}
              style={{
                padding: "6px 10px",
                margin: "3px 0",
                borderLeft: "3px solid",
                borderRadius: 4,
                fontSize: 11,
                fontFamily: "monospace",
                wordBreak: "break-word",
                ...colorFor(e.source),
              }}
            >
              <span style={{ color: "#999", marginRight: 6 }}>{e.time}</span>
              <span style={{ fontWeight: 600, marginRight: 6 }}>[{e.source}]</span>
              {e.detail}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

function colorFor(source: Event["source"]): React.CSSProperties {
  switch (source) {
    case "resize":
      return { borderColor: "#1976D2", background: "#E3F2FD" };
    case "mutation":
      return { borderColor: "#FFA000", background: "#FFF8E1" };
    case "visibility":
      return { borderColor: "#7B1FA2", background: "#F3E5F5" };
    case "pageshow":
      return { borderColor: "#388E3C", background: "#E8F5E9" };
    case "system":
      return { borderColor: "#C62828", background: "#FFEBEE" };
  }
}

const cardStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: 12,
  padding: 16,
  marginBottom: 12,
  boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
};

const tdLabel: React.CSSProperties = {
  paddingRight: 16,
  color: "#666",
};
