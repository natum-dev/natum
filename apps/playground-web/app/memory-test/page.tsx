"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Tests whether in-memory JS state survives the "Open in Chrome" transition.
 *
 * On mount, generates a random token and stores it in:
 *   - React state (in-memory)
 *   - A module-level variable (in-memory)
 *   - A ref (in-memory)
 *   - sessionStorage (for comparison)
 *
 * If the page reloads (Open in Chrome), all in-memory values are regenerated
 * but sessionStorage should retain the original value.
 */

let moduleVar: string | null = null;
let moduleTimestamp: number | null = null;

function generateToken() {
  return Math.random().toString(36).substring(2, 10);
}

interface Snapshot {
  token: string;
  timestamp: number;
}

export default function MemoryTestPage() {
  const [stateToken] = useState(() => generateToken());
  const [stateTimestamp] = useState(() => Date.now());
  const refToken = useRef(generateToken());
  const refTimestamp = useRef(Date.now());

  const [sessionSnapshot, setSessionSnapshot] = useState<Snapshot | null>(null);
  const [isRevisit, setIsRevisit] = useState(false);
  const [renderCount, setRenderCount] = useState(0);

  // Set module-level var on first load of this module
  if (moduleVar === null) {
    moduleVar = generateToken();
    moduleTimestamp = Date.now();
  }

  useEffect(() => {
    setRenderCount((c) => c + 1);

    const existing = sessionStorage.getItem("memory_test_snapshot");
    if (existing) {
      setIsRevisit(true);
      setSessionSnapshot(JSON.parse(existing));
    } else {
      const snapshot: Snapshot = { token: stateToken, timestamp: stateTimestamp };
      sessionStorage.setItem("memory_test_snapshot", JSON.stringify(snapshot));
      setSessionSnapshot(snapshot);
    }
  }, [stateToken, stateTimestamp]);

  const handleClear = () => {
    sessionStorage.removeItem("memory_test_snapshot");
    moduleVar = null;
    moduleTimestamp = null;
    window.location.reload();
  };

  const rows = [
    {
      label: "React useState",
      currentToken: stateToken,
      currentTime: stateTimestamp,
      type: "in-memory",
    },
    {
      label: "React useRef",
      currentToken: refToken.current,
      currentTime: refTimestamp.current,
      type: "in-memory",
    },
    {
      label: "Module variable",
      currentToken: moduleVar,
      currentTime: moduleTimestamp,
      type: "in-memory",
    },
    {
      label: "sessionStorage",
      currentToken: sessionSnapshot?.token ?? "—",
      currentTime: sessionSnapshot?.timestamp ?? null,
      type: "persisted",
    },
  ];

  const originalToken = sessionSnapshot?.token;

  return (
    <main style={{ fontFamily: "-apple-system, sans-serif", padding: 16, background: "#fafafa", minHeight: "100vh" }}>
      <div style={cardStyle}>
        <h2 style={{ fontSize: 20, margin: 0 }}>In-Memory State Test</h2>
        <p style={{ color: "#888", fontSize: 13, margin: "4px 0 12px" }}>
          Tests if JS in-memory state survives &quot;Open in Chrome&quot;
        </p>
        <div
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 500,
            background: isRevisit ? "#E8F5E9" : "#E3F2FD",
            color: isRevisit ? "#2E7D32" : "#1565C0",
          }}
        >
          {isRevisit
            ? "Revisit detected — comparing in-memory vs persisted values"
            : "First visit — baseline values generated"}
        </div>
        <p style={{ fontSize: 11, color: "#999", marginTop: 8 }}>
          Render count: {renderCount}
        </p>
        <button
          style={{ ...rerenderBtnStyle, marginTop: 8 }}
          onClick={() => setRenderCount((c) => c + 1)}
        >
          Force Re-render
        </button>
      </div>

      <div style={cardStyle}>
        <h3 style={{ fontSize: 15, margin: "0 0 12px" }}>Comparison</h3>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr>
              <th style={thStyle}>Storage</th>
              <th style={thStyle}>Type</th>
              <th style={thStyle}>Token</th>
              <th style={thStyle}>Survived</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const survived = originalToken ? row.currentToken === originalToken : null;
              return (
                <tr key={row.label}>
                  <td style={tdStyle}>{row.label}</td>
                  <td style={{ ...tdStyle, fontSize: 11, color: "#888" }}>{row.type}</td>
                  <td style={{ ...tdStyle, fontFamily: "monospace", fontSize: 11 }}>
                    {row.currentToken}
                  </td>
                  <td
                    style={{
                      ...tdStyle,
                      fontWeight: 600,
                      color: survived === null ? "#999" : survived ? "#2E7D32" : "#C62828",
                    }}
                  >
                    {survived === null
                      ? "—"
                      : survived
                        ? "Yes (same)"
                        : "No (new value)"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isRevisit && (
        <div style={cardStyle}>
          <h3 style={{ fontSize: 15, margin: "0 0 8px" }}>Detail</h3>
          <p style={{ fontSize: 12, fontFamily: "monospace", color: "#555" }}>
            Original token (from sessionStorage): <strong>{originalToken}</strong>
          </p>
          <p style={{ fontSize: 12, fontFamily: "monospace", color: "#555" }}>
            Current useState token: <strong>{stateToken}</strong>
          </p>
          <p style={{ fontSize: 12, color: "#888", marginTop: 8 }}>
            If the tokens differ, JS state was destroyed and regenerated (page reloaded).
          </p>
        </div>
      )}

      <div style={cardStyle}>
        <h3 style={{ fontSize: 15, margin: "0 0 8px" }}>How to test</h3>
        <ol style={{ fontSize: 13, color: "#555", paddingLeft: 20, margin: 0 }}>
          <li>Open this page from the Android app (Custom Tab)</li>
          <li>Note the tokens — all four should match</li>
          <li>Tap three-dot menu &rarr; &quot;Open in Chrome&quot;</li>
          <li>Check which tokens changed (in-memory) vs stayed (sessionStorage)</li>
        </ol>
      </div>

      <div style={cardStyle}>
        <button style={btnStyle} onClick={handleClear}>
          Clear & Reset
        </button>
      </div>
    </main>
  );
}

const cardStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: 12,
  padding: 16,
  marginBottom: 12,
  boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
};

const rerenderBtnStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  background: "#F5F5F5",
  color: "#333",
  border: "1px solid #DDD",
  padding: "8px 16px",
  borderRadius: 8,
  fontSize: 13,
  cursor: "pointer",
};

const btnStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  background: "#C62828",
  color: "#fff",
  border: "none",
  padding: "12px 20px",
  borderRadius: 8,
  fontSize: 15,
  cursor: "pointer",
};

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "6px 8px",
  borderBottom: "2px solid #ddd",
  fontSize: 12,
  color: "#666",
};

const tdStyle: React.CSSProperties = {
  padding: "8px",
  borderBottom: "1px solid #eee",
};
