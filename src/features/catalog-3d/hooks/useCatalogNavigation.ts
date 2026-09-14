'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { clampPosition, sequentialStepDelayMs, stepTowardPosition } from '../lib/navigation';

import type { CatalogPosition } from '../types/catalog.types';

type CatalogNavigationOptions = {
  sheetCount: number;
  /** Delay between sheets for a one or two position move. */
  nearStepMs: number;
  /** Shorter delay used for longer jumps. */
  farStepMs: number;
};

export type CatalogNavigation = {
  /** Where the user asked to go. Changes immediately on interaction. */
  targetPosition: CatalogPosition;
  /** Where the physical book currently is. Walks toward the target. */
  displayedPosition: CatalogPosition;
  isNavigating: boolean;
  goToPosition: (position: CatalogPosition) => void;
  goToNext: () => void;
  goToPrevious: () => void;
};

/**
 * Splits navigation into a requested target and the position the book has
 * actually reached. A jump of several positions is walked one sheet at a time,
 * so sheets flip in sequence instead of all at once.
 *
 * The walk is driven by a single timer that is recreated after every step, which
 * keeps it correct when the target changes mid-sequence: the pending step is
 * cancelled and the next one is recomputed against the new target.
 */
export function useCatalogNavigation({
  sheetCount,
  nearStepMs,
  farStepMs,
}: CatalogNavigationOptions): CatalogNavigation {
  const [targetPosition, setTargetPosition] = useState<CatalogPosition>(0);
  const [displayedPosition, setDisplayedPosition] = useState<CatalogPosition>(0);
  const lastStepAtRef = useRef(0);

  useEffect(() => {
    if (displayedPosition === targetPosition) {
      return;
    }

    // Throttle relative to the previous step, so an idle click reacts instantly
    // while a long sequence still paces itself.
    const sinceLastStep = performance.now() - lastStepAtRef.current;
    const delay = sequentialStepDelayMs(displayedPosition, targetPosition, nearStepMs, farStepMs);
    const timer = window.setTimeout(
      () => {
        lastStepAtRef.current = performance.now();
        setDisplayedPosition((current) => stepTowardPosition(current, targetPosition));
      },
      Math.max(0, delay - sinceLastStep),
    );

    return () => window.clearTimeout(timer);
  }, [displayedPosition, targetPosition, nearStepMs, farStepMs]);

  const goToPosition = useCallback(
    (position: CatalogPosition) => {
      setTargetPosition(clampPosition(position, sheetCount));
    },
    [sheetCount],
  );

  const goToNext = useCallback(() => {
    setTargetPosition((current) => clampPosition(current + 1, sheetCount));
  }, [sheetCount]);

  const goToPrevious = useCallback(() => {
    setTargetPosition((current) => clampPosition(current - 1, sheetCount));
  }, [sheetCount]);

  return {
    targetPosition,
    displayedPosition,
    isNavigating: targetPosition !== displayedPosition,
    goToPosition,
    goToNext,
    goToPrevious,
  };
}
