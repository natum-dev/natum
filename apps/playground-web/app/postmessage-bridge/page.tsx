"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * PostMessage bridge page for Chrome Custom Tabs.
 *
 * The inline script in layout.tsx registers a message listener immediately
 * (before React hydrates) and captures the MessagePort + queued messages
 * in window.__postMessageBridge. On mount, this component checks if the
 * port was already captured and drains queued messages. If not, it falls
 * back to registering its own listener.
 */

const MAX_TRACKED_IDS = 500;

interface LogEntry {
  time: string;
  direction: "in" | "out" | "err" | "sys";
  text: string;
}

interface QueuedMessage {
  type: "initial" | "port" | "window";
  data: unknown;
  origin: string;
  timestamp: number;
}

interface PostMessageBridge {
  port: MessagePort | null;
  queue: QueuedMessage[];
  ready: boolean;
  observedOrigin: string | null;
}

declare global {
  interface Window {
    __postMessageBridge?: PostMessageBridge;
  }
}

export default function PostMessageBridge() {
  const [connected, setConnected] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [sentCount, setSentCount] = useState(0);
  const [receivedCount, setReceivedCount] = useState(0);

  const processedIds = useRef(new Set<string>());
  const pendingPings = useRef(new Map<string, number>());
  const portRef = useRef<MessagePort | null>(null);
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const log = useCallback((direction: LogEntry["direction"], text: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [{ time, direction, text }, ...prev].slice(0, 100));
  }, []);

  const generateId = useCallback(
    () => `web_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    []
  );

  const isDuplicate = useCallback((id: string) => {
    if (!id) return false;
    if (processedIds.current.has(id)) return true;
    processedIds.current.add(id);
    if (processedIds.current.size > MAX_TRACKED_IDS) {
      const first = processedIds.current.values().next().value;
      if (first) processedIds.current.delete(first);
    }
    return false;
  }, []);

  const sendToApp = useCallback((data: string) => {
    if (portRef.current) {
      portRef.current.postMessage(data);
    }
  }, []);

  // Process a single incoming message (from port or queued)
  const processMessage = useCallback(
    (raw: unknown) => {
      try {
        const data = typeof raw === "string" ? JSON.parse(raw) : raw;
        if (data.id && isDuplicate(data.id)) return;
        setReceivedCount((c) => c + 1);

        if (data.type === "pong") {
          const requestId = data.requestId;
          if (!requestId || !pendingPings.current.has(requestId)) {
            log("err", `[pong] unknown requestId: ${requestId ?? "missing"}`);
            return;
          }
          const sentAt = pendingPings.current.get(requestId)!;
          const rtt = Date.now() - sentAt;
          pendingPings.current.delete(requestId);
          log("in", `[pong] requestId=${requestId.slice(-12)} rtt=${rtt}ms`);
          return;
        }

        log(
          "in",
          `[${data.type ?? "?"}] ${data.payload ?? JSON.stringify(data).slice(0, 120)}`
        );

        // Send ACK
        sendToApp(
          JSON.stringify({
            id: generateId(),
            type: "ack",
            replyTo: data.id,
            payload: "Acknowledged by web",
            observedOrigin: window.__postMessageBridge?.observedOrigin ?? null,
            timestamp: Date.now(),
          })
        );
      } catch {
        setReceivedCount((c) => c + 1);
        log("in", `${typeof raw === "string" ? raw.slice(0, 120) : JSON.stringify(raw)?.slice(0, 120)}`);
      }
    },
    [isDuplicate, log, sendToApp, generateId]
  );

  const doPing = useCallback(() => {
    const id = generateId();
    const msg = JSON.stringify({
      id,
      type: "ping",
      payload: `connection check @ ${new Date().toLocaleTimeString()}`,
      timestamp: Date.now(),
    });
    pendingPings.current.set(id, Date.now());
    sendToApp(msg);
    setSentCount((c) => c + 1);
    log("out", `[ping] id=${id.slice(-12)} — connection check`);
  }, [generateId, sendToApp, log]);

  // Handle messages arriving through the MessagePort (after React takes over)
  const handlePortMessage = useCallback(
    (event: MessageEvent) => {
      log("in", `[port] ${typeof event.data === "string" ? event.data.slice(0, 120) : JSON.stringify(event.data).slice(0, 120)}`);
      processMessage(event.data);
    },
    [log, processMessage]
  );

  useEffect(() => {
    const bridge = window.__postMessageBridge;

    if (bridge?.ready && bridge.port) {
      // Inline script already captured the port before React hydrated
      log("sys", "Port captured by inline script (pre-hydration)");
      portRef.current = bridge.port;
      bridge.port.onmessage = handlePortMessage;
      setConnected(true);
      log("sys", `MessagePort established — draining ${bridge.queue.length} queued message(s)`);

      // Drain queued messages
      for (const msg of bridge.queue) {
        log("sys", `[queued:${msg.type}] processing buffered message`);
        processMessage(msg.data);
      }
      bridge.queue.length = 0;

      // Connection check interval
      pingIntervalRef.current = setInterval(doPing, 5000);
      doPing();

      return;
    }

    // Inline script hasn't captured a port yet — register our own listener
    log("sys", "Bridge loaded, listening for postMessage from app");

    const handler = (event: MessageEvent) => {
      log(
        "sys",
        `message event: origin="${event.origin}" ports=${event.ports?.length ?? 0} data=${
          typeof event.data === "string"
            ? event.data.slice(0, 80)
            : JSON.stringify(event.data)?.slice(0, 80) ?? "null"
        }`
      );

      const port = event.ports?.[0];
      if (port) {
        portRef.current = port;
        port.onmessage = handlePortMessage;
        setConnected(true);
        log("sys", "MessagePort established — bidirectional channel ready");

        // Also update the bridge object so it's consistent
        if (bridge) {
          bridge.port = port;
          bridge.ready = true;
          bridge.observedOrigin = event.origin;
        }

        if (event.data) {
          processMessage(event.data);
        }

        // Connection check interval
        pingIntervalRef.current = setInterval(doPing, 5000);
        doPing();
      }

      if (event.data) {
        try {
          const d = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
          if (d.id?.startsWith("web_")) return;
          if (d.id && isDuplicate(d.id)) return;
          setReceivedCount((c) => c + 1);
          log("in", `[window] ${d.type ?? "?"}: ${d.payload ?? JSON.stringify(d)}`);
        } catch {
          setReceivedCount((c) => c + 1);
          log("in", `[window] ${event.data}`);
        }
      }
    };

    window.addEventListener("message", handler);
    return () => {
      window.removeEventListener("message", handler);
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }
    };
  }, [handlePortMessage, processMessage, isDuplicate, log, doPing]);

  const handleSendGreeting = () => {
    const msg = JSON.stringify({
      id: generateId(),
      type: "greeting",
      payload: "Hello from the web page!",
      timestamp: Date.now(),
    });
    sendToApp(msg);
    setSentCount((c) => c + 1);
    log("out", `[greeting] Hello from the web page!`);
  };

  const handleSendPing = () => doPing();

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
          Custom Tab &harr; App via Chrome postMessage API
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
          {connected
            ? "Connected — MessagePort active"
            : "Waiting for app to send first message..."}
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
