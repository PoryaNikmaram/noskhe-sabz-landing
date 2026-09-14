export type SkinBinding = {
  /** Four bone indices per vertex, as required by Three.js `skinIndex`. */
  skinIndices: Uint16Array;
  /** Matching four weights per vertex, as required by Three.js `skinWeight`. */
  skinWeights: Float32Array;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Binds every vertex of a page to the two bones that surround it along X.
 *
 * The bone chain runs from the spine (`x = 0`, bone 0) to the outer edge
 * (`x = pageWidth`, last bone), one bone per segment boundary. For a vertex at
 * `x`, `x / segmentWidth` is its position measured in segments: the integer
 * part is the bone just inside it, and the fractional part is how far it has
 * travelled toward the next bone.
 *
 * Giving that vertex `1 - fraction` of the inner bone and `fraction` of the
 * outer one means the vertex follows the inner bone at a segment boundary and
 * blends linearly in between. Because neighbouring vertices share bones with
 * gradually shifting weights, a rotation applied to the chain reads as one
 * continuous curve instead of visible facets. Three.js supports four
 * influences per vertex; the unused two are pinned to bone 0 with weight 0.
 */
export function createSkinBinding(
  xPositions: ArrayLike<number>,
  segmentWidth: number,
  boneCount: number,
): SkinBinding {
  const vertexCount = xPositions.length;
  const skinIndices = new Uint16Array(vertexCount * 4);
  const skinWeights = new Float32Array(vertexCount * 4);
  // The outermost vertex must still address a valid pair, so the inner bone of
  // any vertex never exceeds the second-to-last bone.
  const maxInnerBone = Math.max(0, boneCount - 2);

  for (let vertex = 0; vertex < vertexCount; vertex += 1) {
    const positionInSegments = xPositions[vertex] / segmentWidth;
    const innerBone = clamp(Math.floor(positionInSegments), 0, maxInnerBone);
    const blend = clamp(positionInSegments - innerBone, 0, 1);
    const offset = vertex * 4;

    skinIndices[offset] = innerBone;
    skinIndices[offset + 1] = innerBone + 1;
    skinWeights[offset] = 1 - blend;
    skinWeights[offset + 1] = blend;
  }

  return { skinIndices, skinWeights };
}
