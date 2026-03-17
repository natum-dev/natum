"use client";

import { useEffect, useRef, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallPage() {
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);
  const [promptCaptured, setPromptCaptured] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if PWA is already installed via getInstalledRelatedApps
    const checkInstalled = async () => {
      try {
        const nav = navigator as Navigator & {
          getInstalledRelatedApps?: () => Promise<{ platform: string; url?: string; id?: string }[]>;
        };
        if (nav.getInstalledRelatedApps) {
          const relatedApps = await nav.getInstalledRelatedApps();
          const hasPWA = relatedApps.some((app) => app.platform === "webapp");
          if (hasPWA) {
            setIsInstalled(true);
          }
        }
      } catch {
        // API not supported or failed, fall through to install flow
      }
    };
    checkInstalled();

    const handler = (e: Event) => {
      e.preventDefault();
      deferredPromptRef.current = e as BeforeInstallPromptEvent;
      setPromptCaptured(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Listen for successful installation
    const onInstalled = () => {
      setIsInstalled(true);
      deferredPromptRef.current = null;
      setPromptCaptured(false);
    };
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const handleInstall = async () => {
    const prompt = deferredPromptRef.current;
    if (!prompt) return;

    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") {
      deferredPromptRef.current = null;
      setPromptCaptured(false);
    }
  };

  const handleContinueToPWA = () => {
    window.location.href = "/";
  };

  const handleContinueInBrowser = () => {
    window.location.href =
      "https://www.tiktok.com/coin?a2w_ct_flow=continue_browser";
  };

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
      {isInstalled ? (
        <button
          onClick={handleContinueToPWA}
          style={{
            padding: "12px 32px",
            fontSize: "16px",
            fontWeight: 600,
            color: "#fff",
            backgroundColor: "#0070f3",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Continue to PWA
        </button>
      ) : (
        <button
          onClick={handleInstall}
          disabled={!promptCaptured}
          style={{
            padding: "12px 32px",
            fontSize: "16px",
            fontWeight: 600,
            color: "#fff",
            backgroundColor: promptCaptured ? "#0070f3" : "#999",
            border: "none",
            borderRadius: "8px",
            cursor: promptCaptured ? "pointer" : "not-allowed",
          }}
        >
          Install App
        </button>
      )}

      <button
        onClick={handleContinueInBrowser}
        style={{
          padding: "12px 32px",
          fontSize: "16px",
          color: "#666",
          backgroundColor: "transparent",
          border: "none",
          cursor: "pointer",
          textDecoration: "underline",
        }}
      >
        Continue in Browser
      </button>
    </main>
  );
}
