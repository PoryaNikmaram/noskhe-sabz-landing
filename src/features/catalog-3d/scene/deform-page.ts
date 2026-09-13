/**
 * Deforms a page's vertex positions in place, from a saved rest pose.
 *
 * `progress` goes from 0 (flat, resting on the right of the spine) to 1
 * (flat, resting on the left of the spine). Vertices are rotated around the
 * spine (the Y axis at x = 0), while a curl offset along Z bends the sheet
 * instead of letting it spin like a rigid door.
 *
 * The curl is shaped by two factors:
 * - `fold` peaks at the midpoint of the turn (sin(progress * π)) so the page
 *   is flat at both ends and most curved mid-turn, like real paper.
 * - `curlProfile` peaks near the spine and fades to ~0 at the outer edge, so
 *   the bend is strongest close to where the page is "attached".
 */
export function deformPagePositions(
  restPositions: Float32Array,
  targetPositions: Float32Array,
  pageWidth: number,
  progress: number,
  curlStrength: number,
): void {
  const angle = progress * Math.PI;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const fold = Math.sin(progress * Math.PI);

  for (let i = 0; i < restPositions.length; i += 3) {
    const restX = restPositions[i];
    const restY = restPositions[i + 1];
    const xNorm = restX / pageWidth;

    // Cubic-ish falloff: 0 at the spine and at the outer edge, peak in the inner third.
    const curlProfile = xNorm * (1 - xNorm) * (1 - xNorm) * 6.75;
    const curlZ = curlProfile * fold * curlStrength * pageWidth;

    targetPositions[i] = cos * restX - sin * curlZ;
    targetPositions[i + 1] = restY;
    targetPositions[i + 2] = sin * restX + cos * curlZ;
  }
}

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
