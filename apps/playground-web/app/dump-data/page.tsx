import { cookies, headers } from "next/headers";
import NavigateButton from "./navigate-button";

export default async function DumpDataPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const data = typeof params.data === "string" ? params.data : "";
  const cookieStore = await cookies();
  const redirectTimestamp = cookieStore.get("Redirect-Timestamp")?.value ?? null;
  const headerStore = await headers();
  const requestedWith = headerStore.get("x-requested-with");
  const allHeaders = Object.fromEntries(
    [...headerStore.entries()].sort(([a], [b]) => a.localeCompare(b))
  );

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
        {requestedWith && (
          <p className="mb-4 font-mono text-sm bg-green-50 border border-green-200 p-2 rounded">
            X-Requested-With: {requestedWith}
          </p>
        )}
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

        <h2 className="text-lg font-bold mt-8 mb-2">Request Headers</h2>
        <table className="border-collapse border border-gray-300 w-full">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2 text-left bg-gray-100">
                Header
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left bg-gray-100">
                Value
              </th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(allHeaders).map(([key, value]) => (
              <tr key={key} className={key === "x-requested-with" ? "bg-green-50" : ""}>
                <td className="border border-gray-300 px-4 py-2 font-mono text-sm">
                  {key}
                </td>
                <td className="border border-gray-300 px-4 py-2 font-mono text-sm break-all">
                  {value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <NavigateButton />
      </main>
    );
  }

  return (
    <main className="p-8">
      <h1 className="text-xl font-bold mb-4">Dump Data</h1>
      {requestedWith && (
        <p className="mb-4 font-mono text-sm bg-green-50 border border-green-200 p-2 rounded">
          X-Requested-With: {requestedWith}
        </p>
      )}
      {redirectTimestamp && (
        <p className="mb-4 font-mono text-sm">
          Redirect-Timestamp: {redirectTimestamp}
        </p>
      )}
      <pre className="whitespace-pre-wrap break-all bg-gray-50 p-4 rounded border">
        {data || "(empty)"}
      </pre>

      <h2 className="text-lg font-bold mt-8 mb-2">Request Headers</h2>
      <table className="border-collapse border border-gray-300 w-full">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2 text-left bg-gray-100">
              Header
            </th>
            <th className="border border-gray-300 px-4 py-2 text-left bg-gray-100">
              Value
            </th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(allHeaders).map(([key, value]) => (
            <tr key={key} className={key === "x-requested-with" ? "bg-green-50" : ""}>
              <td className="border border-gray-300 px-4 py-2 font-mono text-sm">
                {key}
              </td>
              <td className="border border-gray-300 px-4 py-2 font-mono text-sm break-all">
                {value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <NavigateButton />
    </main>
  );
}
