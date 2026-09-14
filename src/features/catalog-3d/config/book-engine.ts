import type { BookDirection, SheetType } from '../types/catalog.types';

/**
 * Every tunable number of the skinned book engine lives here. Components read
 * from this file instead of embedding magic numbers, so visual QA happens in
 * one place.
 */

/** Sheet size in world units (roughly A-series proportions). */
export const PAGE_WIDTH = 1.28;
export const PAGE_HEIGHT = 1.71;

/**
 * Horizontal segments define how finely a sheet can bend. Vertical segments
 * only exist so the box has a mid-edge loop; sheets do not bend along Y.
 */
export const PAGE_SEGMENTS_X = 30;
export const PAGE_SEGMENTS_Y = 2;

/** One bone per horizontal segment boundary, including both ends. */
export const BONE_COUNT = PAGE_SEGMENTS_X + 1;
export const SEGMENT_WIDTH = PAGE_WIDTH / PAGE_SEGMENTS_X;

/** Persian catalog: front cover on the right, sheets turn right-to-left. */
export const BOOK_DIRECTION: BookDirection = 'rtl';

/**
 * Physical surface of a sheet. `hingeShare` is what makes covers feel stiff:
 * the fraction of the resting rotation that happens at the binding joint
 * instead of being spread as a curve along the sheet.
 */
export type SheetSurface = {
  /** Geometry thickness in world units. */
  depth: number;
  /** 0 = fully flexible paper, 1 = rigid board hinged at the spine. */
  hingeShare: number;
  /** Scales the transient turning arch and fold. */
  turnCurveScale: number;
  roughness: number;
  /** Colour of the four extruded edges of the sheet. */
  edgeColor: string;
};

export const sheetSurfaces: Record<SheetType, SheetSurface> = {
  page: {
    depth: 0.004,
    hingeShare: 0,
    turnCurveScale: 1,
    roughness: 0.88,
    edgeColor: '#efece2',
  },
  cover: {
    depth: 0.015,
    hingeShare: 0.5,
    turnCurveScale: 0.4,
    roughness: 0.42,
    edgeColor: '#00524e',
  },
  'back-cover': {
    depth: 0.015,
    hingeShare: 0.5,
    turnCurveScale: 0.4,
    roughness: 0.42,
    edgeColor: '#00524e',
  },
};

/** Air between stacked sheets so coplanar faces never z-fight. */
export const SHEET_STACK_GAP = 0.0016;

/**
 * Resting curvature. `insideCurveStrength` and `outsideCurveStrength` are
 * relative weights: they are normalised, so a resting sheet always reaches its
 * target angle exactly and only the *distribution* of the bend changes.
 */
export const insideCurveStrength = 0.85;
export const outsideCurveStrength = 0.15;
/** Fraction of the sheet, measured from the spine, covered by the inside curve. */
export const SPINE_CURVE_SPAN = 0.3;
/** Where along the sheet the fold starts to act (0 = spine, 1 = outer edge). */
export const FOLD_SPAN_START = 0.45;

/** Extra resting rotation per sheet index, so an open stack fans slightly. */
export const FAN_STEP_RAD = 0.014;

/** Subtle emissive lift while a sheet is hovered. */
export const HIGHLIGHT_COLOR = '#00afa5';
export const HIGHLIGHT_INTENSITY = 0.12;

export type BookMotion = {
  /** maath smooth-time for bone/group yaw, in seconds. */
  boneSmoothTime: number;
  foldSmoothTime: number;
  highlightSmoothTime: number;
  /** Length of the transient turning pulse after a sheet flips state. */
  turningPulseMs: number;
  /** Radians of extra arch spread across a sheet at mid-turn. */
  turningCurveStrength: number;
  /** Radians of X-axis twist spread across the outer sheet at mid-turn. */
  foldStrength: number;
  /** Delay between sheets while walking through a multi-position jump. */
  sequentialStepNearMs: number;
  sequentialStepFarMs: number;
};

const standardMotion: BookMotion = {
  boneSmoothTime: 0.42,
  foldSmoothTime: 0.3,
  highlightSmoothTime: 0.18,
  turningPulseMs: 520,
  turningCurveStrength: 0.85,
  foldStrength: 0.2,
  sequentialStepNearMs: 190,
  sequentialStepFarMs: 70,
};

/**
 * Reduced motion keeps the book fully navigable: transitions are short and the
 * transient arch/fold nearly disappear, but nothing is disabled.
 */
const reducedMotionSettings: BookMotion = {
  boneSmoothTime: 0.1,
  foldSmoothTime: 0.1,
  highlightSmoothTime: 0.1,
  turningPulseMs: 140,
  turningCurveStrength: 0.2,
  foldStrength: 0.04,
  sequentialStepNearMs: 90,
  sequentialStepFarMs: 40,
};

export function resolveBookMotion(reducedMotion: boolean): BookMotion {
  return reducedMotion ? reducedMotionSettings : standardMotion;
}
