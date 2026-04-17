"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "cct_storage_test";
const TIMESTAMP_KEY = "cct_storage_timestamp";

interface StorageStatus {
  label: string;
  written: boolean;
  readValue: string | null;
  carriedOver: boolean | null; // null = not yet determined
}

export default function StorageTestPage() {
  const [storageStatuses, setStorageStatuses] = useState<StorageStatus[]>([]);
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const [writeTimestamp, setWriteTimestamp] = useState<string | null>(null);

  useEffect(() => {
    const now = new Date().toISOString();
    const results: StorageStatus[] = [];

    // Check if values already exist (= carried over from CCT)
    const existingSession = sessionStorage.getItem(STORAGE_KEY);
    const existingLocal = localStorage.getItem(STORAGE_KEY);
    const existingCookie = getCookie(STORAGE_KEY);
    const existingTimestamp =
      sessionStorage.getItem(TIMESTAMP_KEY) ??
      localStorage.getItem(TIMESTAMP_KEY);

    const alreadyWritten = !!(existingSession || existingLocal || existingCookie);

    if (alreadyWritten) {
      setIsFirstVisit(false);
      setWriteTimestamp(existingTimestamp);

      results.push({
        label: "sessionStorage",
        written: true,
        readValue: existingSession,
        carriedOver: existingSession !== null,
      });
      results.push({
        label: "localStorage",
        written: true,
        readValue: existingLocal,
        carriedOver: existingLocal !== null,
      });
      results.push({
        label: "cookie",
        written: true,
        readValue: existingCookie,
        carriedOver: existingCookie !== null,
      });

      // Check IndexedDB
      checkIndexedDB().then((val) => {
        setStorageStatuses((prev) =>
          prev.map((s) =>
            s.label === "IndexedDB"
              ? { ...s, readValue: val, carriedOver: val !== null }
              : s
          )
        );
      });

      results.push({
        label: "IndexedDB",
        written: true,
        readValue: null,
        carriedOver: null,
      });
    } else {
      // First visit — write to all storage types
      setIsFirstVisit(true);
      setWriteTimestamp(now);

      const testValue = `written_at_${now}`;

      // sessionStorage
      try {
        sessionStorage.setItem(STORAGE_KEY, testValue);
        sessionStorage.setItem(TIMESTAMP_KEY, now);
        results.push({
          label: "sessionStorage",
          written: true,
          readValue: testValue,
          carriedOver: null,
        });
      } catch {
        results.push({
          label: "sessionStorage",
          written: false,
          readValue: null,
          carriedOver: null,
        });
      }

      // localStorage
      try {
        localStorage.setItem(STORAGE_KEY, testValue);
        localStorage.setItem(TIMESTAMP_KEY, now);
        results.push({
          label: "localStorage",
          written: true,
          readValue: testValue,
          carriedOver: null,
        });
      } catch {
        results.push({
          label: "localStorage",
          written: false,
          readValue: null,
          carriedOver: null,
        });
      }

      // Cookie
      try {
        document.cookie = `${STORAGE_KEY}=${encodeURIComponent(testValue)}; path=/; max-age=300; SameSite=Lax`;
        results.push({
          label: "cookie",
          written: true,
          readValue: testValue,
          carriedOver: null,
        });
      } catch {
        results.push({
          label: "cookie",
          written: false,
          readValue: null,
          carriedOver: null,
        });
      }

      // IndexedDB
      writeIndexedDB(testValue).then((ok) => {
        setStorageStatuses((prev) =>
          prev.map((s) =>
            s.label === "IndexedDB" ? { ...s, written: ok } : s
          )
        );
      });

      results.push({
        label: "IndexedDB",
        written: false, // updated async
        readValue: testValue,
        carriedOver: null,
      });
    }

    setStorageStatuses(results);
  }, []);

  const handleClear = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(TIMESTAMP_KEY);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TIMESTAMP_KEY);
    document.cookie = `${STORAGE_KEY}=; path=/; max-age=0`;
    clearIndexedDB();
    window.location.reload();
  };

  return (
    <main style={{ fontFamily: "-apple-system, sans-serif", padding: 16, background: "#fafafa", minHeight: "100vh" }}>
      <div style={cardStyle}>
        <h2 style={{ fontSize: 20, margin: 0 }}>Storage Carry-Over Test</h2>
        <p style={{ color: "#888", fontSize: 13, margin: "4px 0 12px" }}>
          Open in Custom Tab first, then click &quot;Open in Chrome&quot; to see what persists
        </p>
        <div
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 500,
            background: isFirstVisit ? "#E3F2FD" : "#E8F5E9",
            color: isFirstVisit ? "#1565C0" : "#2E7D32",
          }}
        >
          {isFirstVisit
            ? "First visit — values written to all storage types"
            : "Return visit — checking what carried over"}
        </div>
        {writeTimestamp && (
          <p style={{ fontSize: 11, color: "#999", marginTop: 8 }}>
            Originally written: {writeTimestamp}
          </p>
        )}
      </div>

      <div style={cardStyle}>
        <h3 style={{ fontSize: 15, margin: "0 0 12px" }}>Results</h3>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr>
              <th style={thStyle}>Storage</th>
              <th style={thStyle}>Written</th>
              <th style={thStyle}>Carried Over</th>
              <th style={thStyle}>Value</th>
            </tr>
          </thead>
          <tbody>
            {storageStatuses.map((s) => (
              <tr key={s.label}>
                <td style={tdStyle}>{s.label}</td>
                <td style={tdStyle}>{s.written ? "Yes" : "No"}</td>
                <td style={{
                  ...tdStyle,
                  fontWeight: 600,
                  color: s.carriedOver === null ? "#999" : s.carriedOver ? "#2E7D32" : "#C62828",
                }}>
                  {s.carriedOver === null ? (isFirstVisit ? "—" : "...") : s.carriedOver ? "Yes" : "No"}
                </td>
                <td style={{ ...tdStyle, fontSize: 11, wordBreak: "break-all" }}>
                  {s.readValue ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={cardStyle}>
        <button style={btnStyle} onClick={handleClear}>
          Clear All & Reset
        </button>
      </div>
    </main>
  );
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

async function writeIndexedDB(value: string): Promise<boolean> {
  return new Promise((resolve) => {
    const req = indexedDB.open("cct_test_db", 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore("store");
    };
    req.onsuccess = () => {
      const tx = req.result.transaction("store", "readwrite");
      tx.objectStore("store").put(value, STORAGE_KEY);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    };
    req.onerror = () => resolve(false);
  });
}

async function checkIndexedDB(): Promise<string | null> {
  return new Promise((resolve) => {
    const req = indexedDB.open("cct_test_db", 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore("store");
    };
    req.onsuccess = () => {
      const tx = req.result.transaction("store", "readonly");
      const get = tx.objectStore("store").get(STORAGE_KEY);
      get.onsuccess = () => resolve(get.result ?? null);
      get.onerror = () => resolve(null);
    };
    req.onerror = () => resolve(null);
  });
}

async function clearIndexedDB() {
  const req = indexedDB.open("cct_test_db", 1);
  req.onsuccess = () => {
    const tx = req.result.transaction("store", "readwrite");
    tx.objectStore("store").delete(STORAGE_KEY);
  };
}

const STORAGE_KEY_CONST = "cct_storage_test";

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
