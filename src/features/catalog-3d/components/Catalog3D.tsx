'use client';

import dynamic from 'next/dynamic';
import { useCallback, useState, useSyncExternalStore, type ReactNode } from 'react';

import { Typography } from '@/components/ui/typography/Typography';
import { catalogPages } from '../config/catalog-pages';
import { REDUCED_MOTION_DURATION_MS, TURN_DURATION_MS } from '../config/catalog-scene';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useWebGLSupport } from '../hooks/useWebGLSupport';
import { CatalogControls } from './CatalogControls';
import { CatalogErrorBoundary } from './CatalogErrorBoundary';
import { CatalogFallback } from './CatalogFallback';

import type { TurnDirection } from '../types/catalog.types';

const CatalogCanvas = dynamic(
  () => import('../scene/CatalogCanvas').then((mod) => mod.CatalogCanvas),
  { ssr: false },
);

/** True only after hydration, without calling setState from an effect. */
function useIsClient(): boolean {
  return useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
}

function ViewportFrame({ children }: { children: ReactNode }) {
  return (
    <div className="h-[min(68vh,32rem)] min-h-72 w-full overflow-hidden rounded-lg border border-border bg-surface-muted shadow-soft">
      {children}
    </div>
  );
}

export function Catalog3D() {
  const mounted = useIsClient();
  const [turnedCount, setTurnedCount] = useState(0);
  const [pendingTurn, setPendingTurn] = useState<TurnDirection | null>(null);
  const webglSupported = useWebGLSupport();
  const reducedMotion = useReducedMotion();

  const requestTurn = useCallback(
    (direction: TurnDirection) => {
      if (pendingTurn) {
        return;
      }
      if (direction === 'next' && turnedCount >= catalogPages.length) {
        return;
      }
      if (direction === 'prev' && turnedCount <= 0) {
        return;
      }
      setPendingTurn(direction);
    },
    [pendingTurn, turnedCount],
  );

  const handleTurnSettled = useCallback((nextCount: number) => {
    setTurnedCount(nextCount);
    setPendingTurn(null);
  }, []);

  const handleFallbackPrevious = useCallback(() => {
    setTurnedCount((count) => Math.max(0, count - 1));
  }, []);

  const handleFallbackNext = useCallback(() => {
    setTurnedCount((count) => Math.min(catalogPages.length - 1, count + 1));
  }, []);

  const currentSheet = Math.min(turnedCount + 1, catalogPages.length);
  const showFallback = mounted && !webglSupported;
  const turnDurationMs = reducedMotion ? REDUCED_MOTION_DURATION_MS : TURN_DURATION_MS;

  const webglFallback = (
    <CatalogFallback
      turnedCount={turnedCount}
      reason="webgl"
      onPrevious={handleFallbackPrevious}
      onNext={handleFallbackNext}
    />
  );

  const sceneFallback = (
    <CatalogFallback
      turnedCount={turnedCount}
      reason="scene"
      onPrevious={handleFallbackPrevious}
      onNext={handleFallbackNext}
    />
  );

  return (
    <div className="space-y-6">
      {showFallback ? (
        webglFallback
      ) : (
        <CatalogErrorBoundary fallback={sceneFallback}>
          <ViewportFrame>
            {mounted ? (
              <CatalogCanvas
                turnedCount={turnedCount}
                pendingTurn={pendingTurn}
                reducedMotion={reducedMotion}
                turnDurationMs={turnDurationMs}
                onTurnSettled={handleTurnSettled}
                onRequestTurn={requestTurn}
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Typography variant="body-sm" className="text-foreground-muted">
                  در حال آماده‌سازی صحنه
                </Typography>
              </div>
            )}
          </ViewportFrame>
          <div className="mt-6">
            <CatalogControls
              turnedCount={turnedCount}
              isTurning={pendingTurn !== null}
              onPrevious={() => requestTurn('prev')}
              onNext={() => requestTurn('next')}
            />
          </div>
        </CatalogErrorBoundary>
      )}

      <section
        aria-label="اطلاعات تشخیصی"
        className="rounded-md border border-border bg-surface px-4 py-3"
      >
        <Typography variant="caption" className="block">
          برگه جاری: {currentSheet} از {catalogPages.length}
        </Typography>
        <Typography variant="caption" className="mt-1 block">
          پشتیبانی WebGL: {mounted ? (webglSupported ? 'بله' : 'خیر') : 'در حال بررسی'}
        </Typography>
        <Typography variant="caption" className="mt-1 block">
          حرکت کاهش‌یافته: {reducedMotion ? 'بله' : 'خیر'}
        </Typography>
      </section>
    </div>
  );
}
