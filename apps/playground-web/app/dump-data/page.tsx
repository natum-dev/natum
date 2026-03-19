"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function getCookie(name: string): string | null {
  const match = document.cookie.match(
    new RegExp("(?:^|; )" + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "=([^;]*)")
  );
  return match ? decodeURIComponent(match[1]) : null;
}

function DumpDataContent() {
  const searchParams = useSearchParams();
  const data = searchParams.get("data") ?? "";
  const redirectTimestamp = getCookie("Redirect-Timestamp");

  let parsed: unknown;
  try {
    parsed = JSON.parse(data);
  } catch {
    parsed = null;
  }

  if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
    const entries = Object.entries(parsed as Record<string, unknown>);
    return (
      <main className="p-8">
        <h1 className="text-xl font-bold mb-4">Dump Data</h1>
        {redirectTimestamp && (
          <p className="mb-4 font-mono text-sm">
            Redirect-Timestamp: {redirectTimestamp}
          </p>
        )}
        <table className="border-collapse border border-gray-300 w-full">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2 text-left bg-gray-100">
                Key
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left bg-gray-100">
                Value
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map(([key, value]) => (
              <tr key={key}>
                <td className="border border-gray-300 px-4 py-2 font-mono">
                  {key}
                </td>
                <td className="border border-gray-300 px-4 py-2 font-mono break-all">
                  {typeof value === "object"
                    ? JSON.stringify(value)
                    : String(value)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    );
  }

  return (
    <main className="p-8">
      <h1 className="text-xl font-bold mb-4">Dump Data</h1>
      {redirectTimestamp && (
        <p className="mb-4 font-mono text-sm">
          Redirect-Timestamp: {redirectTimestamp}
        </p>
      )}
      <pre className="whitespace-pre-wrap break-all bg-gray-50 p-4 rounded border">
        {data || "(empty)"}
      </pre>
    </main>
  );
}

export default function DumpDataPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <DumpDataContent />
    </Suspense>
  );
}
