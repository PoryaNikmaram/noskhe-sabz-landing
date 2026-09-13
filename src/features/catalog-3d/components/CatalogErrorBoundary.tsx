'use client';

import { Component, type ReactNode } from 'react';

type CatalogErrorBoundaryProps = {
  children: ReactNode;
  fallback: ReactNode;
};

type CatalogErrorBoundaryState = {
  hasError: boolean;
};

/**
 * Minimal boundary so an unexpected Three.js/WebGL runtime error falls back to
 * the static catalog preview instead of breaking the whole `/3d-lab` page.
 * Not a general-purpose error boundary framework — intentionally scoped to this spike.
 */
export class CatalogErrorBoundary extends Component<
  CatalogErrorBoundaryProps,
  CatalogErrorBoundaryState
> {
  state: CatalogErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): CatalogErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}
