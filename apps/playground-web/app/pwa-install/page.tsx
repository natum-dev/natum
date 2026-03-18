"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface Toast {
  id: number;
  message: string;
  type: "info" | "success" | "error";
}

let toastIdCounter = 0;

export default function PWAInstallPage() {
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);
  const installedAppRef = useRef<{ platform: string; url?: string; id?: string } | null>(null);
  const [promptCaptured, setPromptCaptured] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = ++toastIdCounter;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  useEffect(() => {
    addToast("Checking if app is already installed...", "info");

    // Check if PWA is already installed via getInstalledRelatedApps
    const checkInstalled = async () => {
      try {
        const nav = navigator as Navigator & {
          getInstalledRelatedApps?: () => Promise<{ platform: string; url?: string; id?: string }[]>;
        };
        if (nav.getInstalledRelatedApps) {
          const relatedApps = await nav.getInstalledRelatedApps();
          const pwaApp = relatedApps.find((app) => app.platform === "webapp");
          if (pwaApp) {
            setIsInstalled(true);
            installedAppRef.current = pwaApp;
            addToast("App is already installed!", "success");
          } else {
            addToast("App not installed yet", "info");
          }
        } else {
          addToast("Install check API not available", "info");
        }
      } catch {
        addToast("Could not check install status", "error");
      }
    };
    checkInstalled();

    const handler = (e: Event) => {
      e.preventDefault();
      deferredPromptRef.current = e as BeforeInstallPromptEvent;
      setPromptCaptured(true);
      addToast("Install prompt ready!", "success");
    };

    window.addEventListener("beforeinstallprompt", handler);

    // On appinstalled, poll getInstalledRelatedApps every 1s until confirmed
    let pollTimer: ReturnType<typeof setInterval> | null = null;
    let pollCount = 0;

    const onInstalled = () => {
      deferredPromptRef.current = null;
      setPromptCaptured(false);
      addToast("App installed! Verifying...", "success");
      pollCount = 0;

      const pollRelatedApps = async () => {
        pollCount++;
        addToast(`Checking installation... (attempt ${pollCount})`, "info");
        try {
          const nav = navigator as Navigator & {
            getInstalledRelatedApps?: () => Promise<{ platform: string; url?: string; id?: string }[]>;
          };
          if (nav.getInstalledRelatedApps) {
            const relatedApps = await nav.getInstalledRelatedApps();
            const installedApp = relatedApps.find((app) => app.platform === "webapp");
            if (installedApp) {
              setIsInstalled(true);
              installedAppRef.current = installedApp;
              if (pollTimer) clearInterval(pollTimer);
              addToast("Installation confirmed!", "success");
            }
          } else {
            // API not available, just mark as installed
            setIsInstalled(true);
            if (pollTimer) clearInterval(pollTimer);
            addToast("Installation assumed complete", "info");
          }
        } catch {
          // Fallback: mark installed anyway
          setIsInstalled(true);
          if (pollTimer) clearInterval(pollTimer);
          addToast("Installation assumed complete", "info");
        }
      };

      // Check immediately, then poll every 1s
      pollRelatedApps();
      pollTimer = setInterval(pollRelatedApps, 1000);
    };
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", onInstalled);
      if (pollTimer) clearInterval(pollTimer);
    };
  }, [addToast]);

  const handleInstall = async () => {
    const prompt = deferredPromptRef.current;
    if (!prompt) return;

    addToast("Opening install dialog...", "info");
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") {
      deferredPromptRef.current = null;
      setPromptCaptured(false);
      addToast("Installing app...", "info");
    } else {
      addToast("Installation cancelled", "info");
    }
  };

  const handleContinueToPWA = () => {
    // Open the installed PWA — use the app's URL/id if available, fallback to start_url
    const app = installedAppRef.current;
    const pwaUrl = app?.id || app?.url || "/";
    window.open(pwaUrl, "_blank");
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

      {/* Toast container */}
      <div
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          zIndex: 9999,
          maxWidth: "360px",
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              padding: "12px 16px",
              borderRadius: "8px",
              fontSize: "14px",
              color: "#fff",
              backgroundColor:
                toast.type === "success"
                  ? "#16a34a"
                  : toast.type === "error"
                    ? "#dc2626"
                    : "#0070f3",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              animation: "toast-in 0.3s ease-out",
            }}
          >
            {toast.message}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}
