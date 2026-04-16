"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * PostMessage bridge page opened by Android app in a Chrome Custom Tab.
 *
 * Communication flows through a local HTTP relay on the Android device:
 *   App → Web:  GET  http://localhost:8234/api/toWeb  (polled every 500ms)
 *   Web → App:  POST http://localhost:8234/api/toApp
 *
 * Chrome allows localhost connections from HTTPS pages (secure context exception).
 *
 * Security:
 *  - CORS on the relay restricts to this origin
 *  - Each message requires a unique `id`; the relay rejects duplicates
 *  - Origin header sent with every request
 */

const RELAY_BASE = "http://localhost:8234";
const POLL_INTERVAL = 500;
const MAX_TRACKED_IDS = 500;

interface BridgeMessage {
  id: string;
  type: string;
  payload?: string;
  replyTo?: string;
  origin?: string;
  timestamp: number;
}

interface LogEntry {
  time: string;
  direction: "in" | "out" | "err" | "sys";
  text: string;
}

export default function PostMessageBridge() {
  const [connected, setConnected] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [sentCount, setSentCount] = useState(0);
  const [receivedCount, setReceivedCount] = useState(0);

  const processedIds = useRef(new Set<string>());
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const log = useCallback((direction: LogEntry["direction"], text: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [{ time, direction, text }, ...prev].slice(0, 100));
  }, []);

  const generateId = useCallback(
    () => `web_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    []
  );

  // --- Send message to app via relay ---
  const sendToApp = useCallback(
    async (msg: BridgeMessage) => {
      try {
        const res = await fetch(`${RELAY_BASE}/api/toApp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(msg),
        });
        if (!res.ok) {
          const err = await res.text();
          log("err", `Send failed (${res.status}): ${err}`);
        }
      } catch (e) {
        log("err", `Relay unreachable: ${(e as Error).message}`);
      }
    },
    [log]
  );

  // --- Poll relay for messages from app ---
  useEffect(() => {
    let active = true;

    const poll = async () => {
      try {
        const res = await fetch(`${RELAY_BASE}/api/toWeb`);
        if (!res.ok) return;

        const messages: BridgeMessage[] = await res.json();
        if (!active) return;

        if (messages.length > 0 && !connected) {
          setConnected(true);
        }

        for (const msg of messages) {
          // Idempotency check
          if (!msg.id || processedIds.current.has(msg.id)) continue;
          processedIds.current.add(msg.id);
          if (processedIds.current.size > MAX_TRACKED_IDS) {
            const first = processedIds.current.values().next().value;
            if (first) processedIds.current.delete(first);
          }

          setReceivedCount((c) => c + 1);
          log("in", `[${msg.type}] ${msg.payload ?? JSON.stringify(msg)}`);

          // Send ACK
          sendToApp({
            id: generateId(),
            type: "ack",
            replyTo: msg.id,
            payload: "Acknowledged by web",
            timestamp: Date.now(),
          });
        }
      } catch {
        // Relay not available — will retry next poll
      }
    };

    // Health check first
    fetch(`${RELAY_BASE}/api/health`)
      .then((r) => {
        if (r.ok) {
          setConnected(true);
          log("sys", "Connected to app relay");
        }
      })
      .catch(() => log("sys", "Waiting for app relay..."));

    pollingRef.current = setInterval(poll, POLL_INTERVAL);
    log("sys", `Bridge loaded, polling ${RELAY_BASE} every ${POLL_INTERVAL}ms`);

    return () => {
      active = false;
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [connected, generateId, log, sendToApp]);

  const handleSendGreeting = () => {
    const msg: BridgeMessage = {
      id: generateId(),
      type: "greeting",
      payload: "Hello from the web page!",
      timestamp: Date.now(),
    };
    sendToApp(msg);
    setSentCount((c) => c + 1);
    log("out", `[greeting] ${msg.payload}`);
  };

  const handleSendPing = () => {
    const msg: BridgeMessage = {
      id: generateId(),
      type: "ping",
      payload: `ping @ ${new Date().toLocaleTimeString()}`,
      timestamp: Date.now(),
    };
    sendToApp(msg);
    setSentCount((c) => c + 1);
    log("out", `[ping] ${msg.payload}`);
  };

  return (
    <main
      style={{
        fontFamily: "-apple-system, sans-serif",
        padding: 16,
        background: "#fafafa",
        minHeight: "100vh",
      }}
    >
      <div style={cardStyle}>
        <h2 style={{ fontSize: 20, margin: 0 }}>PostMessage Bridge</h2>
        <p style={{ color: "#888", fontSize: 13, margin: "4px 0 12px" }}>
          Custom Tab &harr; App via local relay
        </p>
        <div
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 500,
            background: connected ? "#E8F5E9" : "#FFF3E0",
            color: connected ? "#2E7D32" : "#E65100",
          }}
        >
          {connected ? "Connected to app relay" : "Waiting for app relay..."}
        </div>
      </div>

      <div style={cardStyle}>
        <button style={btnStyle} onClick={handleSendGreeting}>
          Send Greeting to App
        </button>
        <button
          style={{ ...btnStyle, background: "#78909C", marginTop: 8 }}
          onClick={handleSendPing}
        >
          Ping App
        </button>
        <p style={{ fontSize: 12, color: "#999", marginTop: 10 }}>
          Sent: {sentCount} | Received: {receivedCount}
        </p>
      </div>

      <div style={cardStyle}>
        <h3 style={{ fontSize: 15, margin: "0 0 8px" }}>Messages</h3>
        <div style={{ maxHeight: "40vh", overflowY: "auto" }}>
          {logs.map((entry, i) => (
            <div
              key={i}
              style={{
                padding: "8px 10px",
                margin: "4px 0",
                borderLeft: "3px solid",
                borderRadius: 4,
                fontSize: 12,
                fontFamily: "monospace",
                wordBreak: "break-all",
                borderColor:
                  entry.direction === "in"
                    ? "#4CAF50"
                    : entry.direction === "out"
                      ? "#1976D2"
                      : entry.direction === "sys"
                        ? "#9E9E9E"
                        : "#F44336",
                background:
                  entry.direction === "in"
                    ? "#E8F5E9"
                    : entry.direction === "out"
                      ? "#E3F2FD"
                      : entry.direction === "sys"
                        ? "#F5F5F5"
                        : "#FFEBEE",
              }}
            >
              <span style={{ color: "#999", marginRight: 6 }}>
                {entry.time}
              </span>
              {entry.text}
            </div>
          ))}
        </div>
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

const btnStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  background: "#1976D2",
  color: "#fff",
  border: "none",
  padding: "12px 20px",
  borderRadius: 8,
  fontSize: 15,
  cursor: "pointer",
};
