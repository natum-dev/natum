"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";

function ProtocolRedirect() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const rawUrl = searchParams.get("url") || "";
    let target = "/";

    try {
      // Parse protocol URL: web+natumcoins://open?target=/some-page
      const parsed = new URL(rawUrl);
      target = parsed.searchParams.get("target") || "/";
    } catch {
      // If URL parsing fails, just redirect to home
    }

    router.replace(target);
  }, [searchParams, router]);

  return null;
}

export default function ProtocolHandlerPage() {
  return (
    <Suspense>
      <ProtocolRedirect />
    </Suspense>
  );
}
