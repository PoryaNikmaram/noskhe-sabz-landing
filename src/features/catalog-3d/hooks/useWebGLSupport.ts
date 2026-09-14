'use client';

import { useSyncExternalStore } from 'react';

/**
 * Cached after the first probe. `getSnapshot` must be a cheap, stable read
 * for `useSyncExternalStore` — React calls it on every render (and after
 * every commit) to check for tearing. Probing WebGL support creates a real
 * GPU context, and browsers cap the number of live WebGL contexts (commonly
 * ~16). Re-probing on every render — e.g. every page-turn re-render while
 * navigating the catalog — leaked one context per call and eventually
 * exhausted that budget, which could evict the book's own rendering
 * context and intermittently flip this hook to `false` mid-interaction.
 */
let cachedSupport: boolean | null = null;

function detectWebGL(): boolean {
  if (cachedSupport !== null) {
    return cachedSupport;
  }

  let supported = false;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    supported = Boolean(gl);
    // Release the probe context immediately so it never counts against the
    // browser's live WebGL context limit, even before the result is cached.
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    supported = false;
  }

  cachedSupport = supported;
  return supported;
}

function subscribe() {
  return () => undefined;
}

function getSnapshot() {
  return detectWebGL();
}

function getServerSnapshot() {
  return true;
}

/** No-op subscription: WebGL support cannot change during a session, only the initial read matters. */
export function useWebGLSupport(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
