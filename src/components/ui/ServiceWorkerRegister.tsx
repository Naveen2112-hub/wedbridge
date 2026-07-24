"use client";
import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((registration) => {
        // Reload once when a new SW takes over (avoids stale bundles)
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (!newWorker) return;
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "activated" && navigator.serviceWorker.controller) {
              // Post a message so the SW skips waiting, then reload
              newWorker.postMessage({ type: "SKIP_WAITING" });
              window.location.reload();
            }
          });
        });
      })
      .catch(() => {
        // Registration failure is non-fatal — app works without SW
      });
  }, []);

  return null;
}
