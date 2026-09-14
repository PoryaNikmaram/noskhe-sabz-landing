import type { CatalogPosition } from '../types/catalog.types';

/**
 * Pure navigation rules for the position domain documented in
 * `catalog.types.ts`: `0` is the closed front cover, `sheetCount` is the closed
 * back cover, and `k` means the first `k` sheets have been turned.
 */

export function clampPosition(position: number, sheetCount: number): CatalogPosition {
  if (!Number.isFinite(position)) {
    return 0;
  }
  return Math.min(Math.max(Math.round(position), 0), sheetCount);
}

/** A closed book has every sheet flat on one side of the spine. */
export function isBookClosed(position: CatalogPosition, sheetCount: number): boolean {
  return position <= 0 || position >= sheetCount;
}

export function isSheetTurned(sheetIndex: number, position: CatalogPosition): boolean {
  return position > sheetIndex;
}

/** One step of the sequential walk from the displayed position toward the target. */
export function stepTowardPosition(
  displayedPosition: CatalogPosition,
  targetPosition: CatalogPosition,
): CatalogPosition {
  if (displayedPosition === targetPosition) {
    return displayedPosition;
  }
  return displayedPosition + Math.sign(targetPosition - displayedPosition);
}

/**
 * Big jumps flip faster per sheet, so travelling six positions does not feel
 * six times as slow as travelling one.
 */
export function sequentialStepDelayMs(
  displayedPosition: CatalogPosition,
  targetPosition: CatalogPosition,
  nearMs: number,
  farMs: number,
): number {
  return Math.abs(targetPosition - displayedPosition) > 2 ? farMs : nearMs;
}

/** Human label for a position, so every control describes the same domain. */
export function describePosition(position: CatalogPosition, sheetCount: number): string {
  if (position <= 0) {
    return 'بسته، روی جلد';
  }
  if (position >= sheetCount) {
    return 'بسته، جلد پشت';
  }
  return `برگه ${position} از ${sheetCount - 1}`;
}

/**
 * Where a click on a sheet should navigate to: the front of a sheet moves
 * forward past it, the back of an already-turned sheet moves back to it.
 */
export function positionForSheetClick(
  sheetIndex: number,
  displayedPosition: CatalogPosition,
  sheetCount: number,
): CatalogPosition {
  const requested = isSheetTurned(sheetIndex, displayedPosition) ? sheetIndex : sheetIndex + 1;
  return clampPosition(requested, sheetCount);
}
