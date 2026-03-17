"use client";

import { useEffect, useState } from "react";

export default function A2WIntermediary({ token }: { token: string }) {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (countdown <= 0) {
      window.location.href =
        "https://www.tiktok.com/coin?a2w_ct_success=1";
      return;
    }

    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        gap: "16px",
        padding: "24px",
      }}
    >
      <p style={{ fontSize: "16px", color: "#333" }}>
        <strong>X-A2W-Token:</strong> {token || "(none)"}
      </p>

      <p style={{ fontSize: "14px", color: "#666" }}>
        Redirecting in {countdown}s...
      </p>
    </main>
  );
}
