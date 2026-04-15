"use client";

import { useEffect } from "react";

/**
 * SessionKeeper — Silent background component that:
 * 1. Refreshes the Discord token if it's about to expire
 * 2. Runs once on page load (not on every render)
 */
export function SessionKeeper() {
  useEffect(() => {
    // Only run if user has a session cookie
    const hasSession = document.cookie.includes("phoenix_session");
    if (!hasSession) return;

    // Silent refresh in background
    fetch("/api/auth/refresh").catch(() => {});
  }, []);

  return null; // invisible component
}
