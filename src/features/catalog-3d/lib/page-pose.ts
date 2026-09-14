import type { BookDirection } from '../types/catalog.types';

/**
 * Everything that decides where a sheet sits and how it bends, as plain
 * numbers. No Three.js and no React here, so the hard parts of the engine can
 * be reasoned about (and later unit-tested) on their own.
 *
 * Frame of reference: a sheet's local +X runs from the spine to its outer
 * edge, and it rotates around Y (the spine). The book group carries a fixed
 * `BOOK_BASE_YAW`, so a sheet yaw of `+90°` rests to the right, `-90°` rests to
 * the left, and passing through `0` sweeps the sheet toward the viewer.
 */
export const BOOK_BASE_YAW = -Math.PI / 2;

/**
 * All direction-sensitive signs in the engine derive from this one value.
 *
 * `+1` is a left-bound book: the binding sits on the left, sheets rest to the
 * right of the spine and turn right-to-left. `-1` mirrors it into a right-bound
 * Persian book: binding on the right, sheets rest to the left and turn
 * left-to-right.
 */
export function directionSign(direction: BookDirection): 1 | -1 {
  return direction === 'rtl' ? -1 : 1;
}

/**
 * Which printed face goes on which side of the sheet.
 *
 * Mirroring a book is not a rotation, so the artwork has to swap sides too: in
 * a right-bound book the face a reader sees before turning a sheet is on the
 * far side of the paper compared to a left-bound one. Assigning the slots by
 * direction keeps the content order correct (cover, inside cover, first page …)
 * for both bindings without touching the geometry or the bend math.
 */
export function faceSlotsForDirection<T>(
  front: T,
  back: T,
  direction: BookDirection,
): { positiveZ: T; negativeZ: T } {
  return direction === 'rtl'
    ? { positiveZ: back, negativeZ: front }
    : { positiveZ: front, negativeZ: back };
}

type RestingYawInput = {
  sheetIndex: number;
  turned: boolean;
  bookClosed: boolean;
  direction: BookDirection;
  fanStepRad: number;
};

/**
 * Resting yaw of a whole sheet: `±90°` around the spine, mirrored by reading
 * direction. While the book is open, each sheet adds a small index-based offset
 * so stacked sheets fan instead of resting in exactly the same plane.
 */
export function restingSheetYaw({
  sheetIndex,
  turned,
  bookClosed,
  direction,
  fanStepRad,
}: RestingYawInput): number {
  const sign = directionSign(direction);
  const resting = (turned ? -1 : 1) * sign * (Math.PI / 2);
  if (bookClosed) {
    return resting;
  }
  return resting + sign * sheetIndex * fanStepRad;
}

type FramingInput = {
  displayedPosition: number;
  sheetCount: number;
  direction: BookDirection;
  pageWidth: number;
};

/**
 * Horizontal offset that keeps the *visible* book centred in frame. A closed
 * book only occupies one side of the spine, so it is shifted by half a page;
 * an open book is already symmetric and needs no offset.
 */
export function bookFramingOffsetX({
  displayedPosition,
  sheetCount,
  direction,
  pageWidth,
}: FramingInput): number {
  const sign = directionSign(direction);
  if (displayedPosition <= 0) {
    return -sign * (pageWidth / 2);
  }
  if (displayedPosition >= sheetCount) {
    return sign * (pageWidth / 2);
  }
  return 0;
}

function normalized(weights: Float64Array): Float64Array {
  let total = 0;
  for (let index = 0; index < weights.length; index += 1) {
    total += weights[index];
  }
  if (total <= 0) {
    return weights;
  }
  for (let index = 0; index < weights.length; index += 1) {
    weights[index] /= total;
  }
  return weights;
}

type RestingSharesInput = {
  boneCount: number;
  insideCurveStrength: number;
  outsideCurveStrength: number;
  /** Fraction of the sheet, from the spine, covered by the inside curve. */
  spineCurveSpan: number;
  /** 0 = flexible paper, 1 = rigid board hinged at the binding. */
  hingeShare: number;
};

/**
 * Splits the resting yaw across the bone chain. Bone rotations accumulate down
 * the hierarchy, so these shares sum to exactly 1: the outer edge of a resting
 * sheet reaches its target angle, no more and no less.
 *
 * Two profiles are blended:
 *
 * - *inside curve* — a quarter-cosine that is strongest at the spine and dies
 *   out at `spineCurveSpan`. This is the bend where paper leaves the binding.
 * - *outside curve* — a gentle hump over the remaining part of the sheet, so
 *   the outer half keeps curving slightly instead of reading as a flat board.
 *
 * `hingeShare` then moves part of the rotation onto the very first joint, which
 * is what makes a cover behave like a stiff board rather than paper.
 */
export function createRestingBoneShares({
  boneCount,
  insideCurveStrength,
  outsideCurveStrength,
  spineCurveSpan,
  hingeShare,
}: RestingSharesInput): Float64Array {
  const shares = new Float64Array(boneCount);
  const lastBone = Math.max(1, boneCount - 1);

  for (let bone = 0; bone < boneCount; bone += 1) {
    const alongSheet = bone / lastBone;
    const inside = Math.cos((Math.PI / 2) * Math.min(1, alongSheet / spineCurveSpan));
    const outside =
      alongSheet <= spineCurveSpan
        ? 0
        : Math.sin((Math.PI * (alongSheet - spineCurveSpan)) / (1 - spineCurveSpan));
    shares[bone] = insideCurveStrength * inside + outsideCurveStrength * outside;
  }

  normalized(shares);

  if (hingeShare > 0) {
    for (let bone = 0; bone < boneCount; bone += 1) {
      const flexible = (1 - hingeShare) * shares[bone];
      shares[bone] = bone === 0 ? hingeShare + flexible : flexible;
    }
  }

  return shares;
}

/**
 * Distribution of the transient turning arch: zero at the spine and at the
 * outer edge, strongest across the middle of the sheet. Normalised, so the
 * configured strength reads directly as "radians of extra arch at mid-turn".
 */
export function createTurningShares(boneCount: number): Float64Array {
  const shares = new Float64Array(boneCount);
  const lastBone = Math.max(1, boneCount - 1);
  for (let bone = 0; bone < boneCount; bone += 1) {
    shares[bone] = Math.sin(Math.PI * (bone / lastBone));
  }
  return normalized(shares);
}

/**
 * Distribution of the secondary fold. It only acts past `spanStart`, so the
 * spine region stays clean and only the outer part of the sheet twists.
 */
export function createFoldShares(boneCount: number, spanStart: number): Float64Array {
  const shares = new Float64Array(boneCount);
  const lastBone = Math.max(1, boneCount - 1);
  for (let bone = 0; bone < boneCount; bone += 1) {
    const alongSheet = bone / lastBone;
    shares[bone] =
      alongSheet < spanStart ? 0 : Math.sin((Math.PI * (alongSheet - spanStart)) / (1 - spanStart));
  }
  return normalized(shares);
}

/**
 * Normalised turn pulse: 0 when a sheet starts moving, 1 at mid-turn, back to
 * 0 once `durationMs` has passed. Drives both the turning arch and the fold.
 */
export function turningPulse(elapsedMs: number, durationMs: number): number {
  if (durationMs <= 0) {
    return 0;
  }
  const progress = Math.min(1, Math.max(0, elapsedMs / durationMs));
  return Math.sin(Math.PI * progress);
}

/**
 * Running total of sheet thickness, one entry per navigation position, used to
 * place each sheet in its stack. Index `p` is the height of the stack once `p`
 * sheets have been passed.
 */
export function cumulativeSheetDepths(depths: readonly number[], gap: number): Float64Array {
  const totals = new Float64Array(depths.length + 1);
  for (let index = 0; index < depths.length; index += 1) {
    totals[index + 1] = totals[index] + depths[index] + gap;
  }
  return totals;
}

/**
 * Offset of a sheet along its own normal, so both stacks pile away from the
 * camera: sheets deeper in the untouched stack sink behind the top one, and
 * turned sheets pile back up in the order they were turned. One expression
 * covers both sides because a turned sheet has been flipped over, and the
 * direction sign accounts for the mirrored binding.
 */
export function sheetStackOffset(
  sheetIndex: number,
  displayedPosition: number,
  cumulativeDepths: Float64Array,
  direction: BookDirection,
): number {
  const fromTop = cumulativeDepths[displayedPosition] - cumulativeDepths[sheetIndex];
  return directionSign(direction) * fromTop;
}
