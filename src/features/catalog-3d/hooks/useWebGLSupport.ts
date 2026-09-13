'use client';

import { useSyncExternalStore } from 'react';

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
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
