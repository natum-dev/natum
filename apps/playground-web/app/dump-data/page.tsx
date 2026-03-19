"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function DumpDataContent() {
  const searchParams = useSearchParams();
  const data = searchParams.get("data") ?? "";

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
