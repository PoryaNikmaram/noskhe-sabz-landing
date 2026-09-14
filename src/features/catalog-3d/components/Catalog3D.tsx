'use client';

import dynamic from 'next/dynamic';
import { useCallback, useState, useSyncExternalStore, type ReactNode } from 'react';

import { Typography } from '@/components/ui/typography/Typography';
import { BOOK_DIRECTION, resolveBookMotion } from '../config/book-engine';
import { catalogSheetCount } from '../config/catalog-sheets';
import { useCatalogNavigation } from '../hooks/useCatalogNavigation';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useWebGLSupport } from '../hooks/useWebGLSupport';
import { describePosition, positionForSheetClick } from '../lib/navigation';
import { CatalogControls } from './CatalogControls';
import { CatalogErrorBoundary } from './CatalogErrorBoundary';
import { CatalogFallback } from './CatalogFallback';

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

function FramePlaceholder({ label }: { label: string }) {
  return (
    <div className="flex h-full items-center justify-center">
      <Typography variant="body-sm" className="text-foreground-muted">
        {label}
      </Typography>
    </div>
  );
}

export function Catalog3D() {
  const mounted = useIsClient();
  const webglSupported = useWebGLSupport();
  const reducedMotion = useReducedMotion();
  const [sceneReady, setSceneReady] = useState(false);

  const motion = resolveBookMotion(reducedMotion);
  const navigation = useCatalogNavigation({
    sheetCount: catalogSheetCount,
    nearStepMs: motion.sequentialStepNearMs,
    farStepMs: motion.sequentialStepFarMs,
  });
  const { targetPosition, displayedPosition, goToPosition, goToNext, goToPrevious } = navigation;

  const handleSceneReady = useCallback(() => setSceneReady(true), []);

  const handleSelectSheet = useCallback(
    (sheetIndex: number) => {
      goToPosition(positionForSheetClick(sheetIndex, displayedPosition, catalogSheetCount));
    },
    [displayedPosition, goToPosition],
  );

  const showFallback = mounted && !webglSupported;

  const fallbackFor = (reason: 'webgl' | 'scene') => (
    <CatalogFallback
      position={targetPosition}
      reason={reason}
      onPrevious={goToPrevious}
      onNext={goToNext}
    />
  );

  return (
    <div className="space-y-6">
      {showFallback ? (
        fallbackFor('webgl')
      ) : (
        <CatalogErrorBoundary fallback={fallbackFor('scene')}>
          <ViewportFrame>
            {mounted ? (
              <div className="relative h-full w-full">
                <CatalogCanvas
                  displayedPosition={displayedPosition}
                  direction={BOOK_DIRECTION}
                  reducedMotion={reducedMotion}
                  onSelectSheet={handleSelectSheet}
                  onReady={handleSceneReady}
                />
                {sceneReady ? null : (
                  <div className="pointer-events-none absolute inset-0 bg-surface-muted">
                    <FramePlaceholder label="در حال بارگذاری برگه‌ها" />
                  </div>
                )}
              </div>
            ) : (
              <FramePlaceholder label="در حال آماده‌سازی صحنه" />
            )}
          </ViewportFrame>
          <div className="mt-6">
            <CatalogControls
              targetPosition={targetPosition}
              sheetCount={catalogSheetCount}
              direction={BOOK_DIRECTION}
              onPrevious={goToPrevious}
              onNext={goToNext}
              onSelectPosition={goToPosition}
            />
          </div>
        </CatalogErrorBoundary>
      )}

      <section
        aria-label="اطلاعات تشخیصی"
        className="rounded-md border border-border bg-surface px-4 py-3"
      >
        <Typography variant="caption" className="block">
          موقعیت درخواست‌شده: {targetPosition} (
          {describePosition(targetPosition, catalogSheetCount)})
        </Typography>
        <Typography variant="caption" className="mt-1 block">
          موقعیت نمایش‌داده‌شده: {displayedPosition}
        </Typography>
        <Typography variant="caption" className="mt-1 block">
          جهت ورق‌زدن: {BOOK_DIRECTION === 'rtl' ? 'راست‌به‌چپ' : 'چپ‌به‌راست'}
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
