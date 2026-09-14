import { BoxGeometry, Float32BufferAttribute, Uint16BufferAttribute } from 'three';

import {
  BONE_COUNT,
  PAGE_HEIGHT,
  PAGE_SEGMENTS_X,
  PAGE_SEGMENTS_Y,
  PAGE_WIDTH,
  SEGMENT_WIDTH,
} from '../config/book-engine';
import { createSkinBinding } from '../lib/skinning';

/**
 * One sheet of paper as a segmented, skinnable box.
 *
 * A box rather than a plane, because a real sheet needs thickness: visible
 * edges, separate front/back material slots, and a closed book that looks like
 * a stack instead of a set of infinitely thin cards.
 *
 * The geometry is translated so its local origin sits at the spine — `x = 0` is
 * the binding, `+x` the outer edge — which is also the frame the bone chain and
 * all bend math are expressed in.
 */
export function createPageGeometry(depth: number): BoxGeometry {
  const geometry = new BoxGeometry(
    PAGE_WIDTH,
    PAGE_HEIGHT,
    depth,
    PAGE_SEGMENTS_X,
    PAGE_SEGMENTS_Y,
  );
  geometry.translate(PAGE_WIDTH / 2, 0, 0);

  const position = geometry.getAttribute('position');
  const xPositions = new Float32Array(position.count);
  for (let vertex = 0; vertex < position.count; vertex += 1) {
    xPositions[vertex] = position.getX(vertex);
  }

  const { skinIndices, skinWeights } = createSkinBinding(xPositions, SEGMENT_WIDTH, BONE_COUNT);
  geometry.setAttribute('skinIndex', new Uint16BufferAttribute(skinIndices, 4));
  geometry.setAttribute('skinWeight', new Float32BufferAttribute(skinWeights, 4));

  return geometry;
}
