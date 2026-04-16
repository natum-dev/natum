"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * PostMessage bridge page for Chrome Custom Tabs ↔ App communication.
 *
 * Security:
 *  - Origin verification on every incoming message
 *  - Each message must carry a unique `id` — duplicates are silently dropped
 *
 * Opened by the Android app via CustomTabsIntent.
 * Communication uses the Custom Tabs postMessage API:
 *  - App → Web: messages arrive via `window.addEventListener("message", ...)`
 *  - Web → App: messages sent via `window.postMessage(...)` which Chrome
 *    relays back to the CustomTabsSession callback
 */

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

const ALLOWED_ORIGINS = [
  "android-app://com.playground.android",
  "https://playground.natum.dev",
];

const MAX_TRACKED_IDS = 500;

export default function PostMessageBridge() {
  const [connected, setConnected] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [sentCount, setSentCount] = useState(0);
  const [receivedCount, setReceivedCount] = useState(0);

  const processedIds = useRef(new Set<string>());
  const messagePort = useRef<MessagePort | null>(null);

  const log = useCallback(
    (direction: LogEntry["direction"], text: string) => {
      const time = new Date().toLocaleTimeString();
      setLogs((prev) => [{ time, direction, text }, ...prev].slice(0, 100));
    },
    []
  );

  const generateId = useCallback(() => {
    return `web_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }, []);

  const isOriginAllowed = useCallback((origin: string) => {
    if (!origin || origin === "" || origin === "null") return true;
    return ALLOWED_ORIGINS.some(
      (o) => origin === o || origin.startsWith(o)
    );
  }, []);

  const isDuplicate = useCallback((id: string) => {
    if (!id) return true;
    if (processedIds.current.has(id)) return true;
    processedIds.current.add(id);
    if (processedIds.current.size > MAX_TRACKED_IDS) {
      const first = processedIds.current.values().next().value;
      if (first) processedIds.current.delete(first);
    }
    return false;
  }, []);

  const sendToApp = useCallback(
    (msg: BridgeMessage) => {
      const json = JSON.stringify(msg);
      if (messagePort.current) {
        messagePort.current.postMessage(json);
      } else {
        // Chrome Custom Tabs relays window.postMessage back to the app session
        window.postMessage(json, "*");
      }
    },
    []
  );

  const processIncoming = useCallback(
    (rawData: unknown, source: string) => {
      try {
        const data: BridgeMessage =
          typeof rawData === "string" ? JSON.parse(rawData) : (rawData as BridgeMessage);

        if (!data.id) {
          log("err", "Rejected: no message ID");
          return;
        }

        if (isDuplicate(data.id)) {
          log("err", `Duplicate ignored: ${data.id.slice(-12)}`);
          return;
        }

        if (
          data.origin &&
          !data.origin.includes("com.playground.android") &&
          !isOriginAllowed(data.origin)
        ) {
          log("err", `Rejected origin: ${data.origin}`);
          return;
        }

        setReceivedCount((c) => c + 1);
        setConnected(true);
        log("in", `[${data.type}] ${data.payload ?? JSON.stringify(data)}`);

        sendToApp({
          id: generateId(),
          type: "ack",
          replyTo: data.id,
          payload: "Acknowledged by web",
          timestamp: Date.now(),
        });
      } catch (e) {
        log("err", `Parse error: ${(e as Error).message}`);
      }
    },
    [isDuplicate, isOriginAllowed, log, sendToApp, generateId]
  );

  // Listen for postMessage events from the Custom Tab session
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (!isOriginAllowed(event.origin)) {
        log("err", `Blocked origin: ${event.origin}`);
        return;
      }

      // If Chrome sends a MessagePort, store it for bidirectional comms
      if (event.ports?.length) {
        messagePort.current = event.ports[0];
        messagePort.current.onmessage = (e) =>
          processIncoming(e.data, "port");
        setConnected(true);
        log("sys", "MessagePort channel established");
        return;
      }

      if (event.data) {
        // Ignore our own messages (self-posted fallback)
        try {
          const d =
            typeof event.data === "string"
              ? JSON.parse(event.data)
              : event.data;
          if (d.id?.startsWith("web_")) return;
        } catch {
          /* not JSON, process normally */
        }
        processIncoming(event.data, event.origin);
      }
    };

    window.addEventListener("message", handler);
    log("sys", "Bridge loaded, listening for messages");
    return () => window.removeEventListener("message", handler);
  }, [isOriginAllowed, log, processIncoming]);

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
    <main style={{ fontFamily: "-apple-system, sans-serif", padding: 16, background: "#fafafa", minHeight: "100vh" }}>
      {/* Status */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: 20, margin: 0 }}>PostMessage Bridge</h2>
        <p style={{ color: "#888", fontSize: 13, margin: "4px 0 12px" }}>
          Custom Tab ↔ App communication
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
          {connected ? "Connected to app" : "Waiting for connection..."}
        </div>
      </div>

      {/* Actions */}
      <div style={cardStyle}>
        <button style={btnStyle} onClick={handleSendGreeting}>
          Send Greeting to App
        </button>
        <button style={{ ...btnStyle, background: "#78909C", marginTop: 8 }} onClick={handleSendPing}>
          Ping App
        </button>
        <p style={{ fontSize: 12, color: "#999", marginTop: 10 }}>
          Sent: {sentCount} | Received: {receivedCount}
        </p>
      </div>

      {/* Logs */}
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
                  entry.direction === "in" ? "#4CAF50"
                  : entry.direction === "out" ? "#1976D2"
                  : entry.direction === "sys" ? "#9E9E9E"
                  : "#F44336",
                background:
                  entry.direction === "in" ? "#E8F5E9"
                  : entry.direction === "out" ? "#E3F2FD"
                  : entry.direction === "sys" ? "#F5F5F5"
                  : "#FFEBEE",
              }}
            >
              <span style={{ color: "#999", marginRight: 6 }}>{entry.time}</span>
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
