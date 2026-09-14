'use client';

import dynamic from 'next/dynamic';
import { useCallback, useState, useSyncExternalStore, type ReactNode } from 'react';

import { cn } from '@/lib/cn';
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

import type { CatalogVariant } from '../types/catalog.types';

const CatalogCanvas = dynamic(
  () => import('../scene/CatalogCanvas').then((mod) => mod.CatalogCanvas),
  { ssr: false },
);

type Catalog3DProps = {
  /**
   * `lab` (default) is the diagnostic `/3d-lab` page: bordered viewport, full
   * controls, position diagnostics. `hero` is the transparent marketing
   * presentation: no visible frame, minimal controls, no diagnostics.
   */
  variant?: CatalogVariant;
};

/** True only after hydration, without calling setState from an effect. */
function useIsClient(): boolean {
  return useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
}

function ViewportFrame({ variant, children }: { variant: CatalogVariant; children: ReactNode }) {
  const isHero = variant === 'hero';

  return (
    <div
      className={cn(
        'w-full',
        isHero
          ? 'min-h-0 flex-1 overflow-visible'
          : 'h-[min(68vh,32rem)] min-h-72 overflow-hidden rounded-lg border border-border bg-surface-muted shadow-soft',
      )}
    >
      {children}
    </div>
  );
}

function FramePlaceholder({ label, variant }: { label: string; variant: CatalogVariant }) {
  return (
    <div className={cn('flex h-full items-center justify-center', variant === 'hero' && 'p-0')}>
      <Typography
        variant="body-sm"
        className={variant === 'hero' ? 'text-white/70' : 'text-foreground-muted'}
      >
        {label}
      </Typography>
    </div>
  );
}

export function Catalog3D({ variant = 'lab' }: Catalog3DProps) {
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
  const isHero = variant === 'hero';

  const fallbackFor = (reason: 'webgl' | 'scene') => (
    <CatalogFallback
      position={targetPosition}
      reason={reason}
      variant={variant}
      onPrevious={goToPrevious}
      onNext={goToNext}
    />
  );

  return (
    <div className={cn(isHero ? 'flex h-full w-full flex-col' : 'space-y-6')}>
      {showFallback ? (
        fallbackFor('webgl')
      ) : (
        <CatalogErrorBoundary fallback={fallbackFor('scene')}>
          <ViewportFrame variant={variant}>
            {mounted ? (
              <div className="relative h-full w-full">
                <CatalogCanvas
                  displayedPosition={displayedPosition}
                  direction={BOOK_DIRECTION}
                  reducedMotion={reducedMotion}
                  variant={variant}
                  onSelectSheet={handleSelectSheet}
                  onReady={handleSceneReady}
                />
                {sceneReady ? null : (
                  <div
                    className={cn(
                      'pointer-events-none absolute inset-0',
                      isHero ? 'bg-transparent' : 'bg-surface-muted',
                    )}
                  >
                    <FramePlaceholder label="در حال بارگذاری برگه‌ها" variant={variant} />
                  </div>
                )}
              </div>
            ) : (
              <FramePlaceholder label="در حال آماده‌سازی صحنه" variant={variant} />
            )}
          </ViewportFrame>
          <div className={isHero ? 'mt-4 shrink-0' : 'mt-6'}>
            <CatalogControls
              targetPosition={targetPosition}
              sheetCount={catalogSheetCount}
              direction={BOOK_DIRECTION}
              variant={variant}
              onPrevious={goToPrevious}
              onNext={goToNext}
              onSelectPosition={goToPosition}
            />
          </div>
        </CatalogErrorBoundary>
      )}

      {isHero ? null : (
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
      )}
    </div>
  );
}
