"use client";

import { Component, useEffect, useState, type ComponentType, type ReactNode } from "react";
import { usePathname } from "next/navigation";

/** If WebGL or the scene fails for any reason, render nothing instead of crashing the page. */
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.warn("3D background disabled:", error);
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function CosmicBackground() {
  const [Scene, setScene] = useState<ComponentType | null>(null);
  // The admin app is a work tool: no 3D scene there (saves battery on phones).
  const isAdmin = usePathname()?.startsWith("/admin");

  // Load the 3D scene only on the client, after first paint, so it never blocks content.
  useEffect(() => {
    let cancelled = false;
    const load = () =>
      import("./CosmicScene")
        .then((mod) => {
          if (!cancelled && mod.default) setScene(() => mod.default);
        })
        .catch((e) => console.warn("3D background failed to load:", e));

    const w = window as Window & { requestIdleCallback?: (cb: () => void) => number };
    if (w.requestIdleCallback) w.requestIdleCallback(load);
    else setTimeout(load, 200);

    return () => {
      cancelled = true;
    };
  }, []);

  if (!Scene || isAdmin) return null;
  return (
    <div aria-hidden="true" className="pointer-events-none">
      <SceneBoundary>
        <Scene />
      </SceneBoundary>
    </div>
  );
}
