'use client';

import { useThree } from '@react-three/fiber';

import { resolveBookMotion } from '../config/book-engine';
import {
  BOOK_FIT_HEIGHT,
  BOOK_FIT_WIDTH,
  BOOK_SCALE_RANGE,
  BOOK_TILT_X,
  GROUND_OFFSET_Y,
  GROUND_SHADOW_OPACITY,
} from '../config/catalog-scene';
import { Book } from './Book';
import { CameraRig } from './CameraRig';
import { Lighting } from './Lighting';

import type { BookDirection } from '../types/catalog.types';

type CatalogSceneProps = {
  displayedPosition: number;
  direction: BookDirection;
  reducedMotion: boolean;
  onSelectSheet: (sheetIndex: number) => void;
  onReady: () => void;
};

export function CatalogScene({
  displayedPosition,
  direction,
  reducedMotion,
  onSelectSheet,
  onReady,
}: CatalogSceneProps) {
  const viewport = useThree((state) => state.viewport);
  const motion = resolveBookMotion(reducedMotion);

  /**
   * Fit the open book into whatever is actually visible instead of guessing at
   * breakpoints: `viewport` is the world-space size of the frame at z = 0.
   */
  const [minScale, maxScale] = BOOK_SCALE_RANGE;
  const scale = Math.min(
    maxScale,
    Math.max(
      minScale,
      Math.min(viewport.width / BOOK_FIT_WIDTH, viewport.height / BOOK_FIT_HEIGHT),
    ),
  );

  return (
    <>
      <CameraRig />
      <Lighting />
      <group rotation={[BOOK_TILT_X, 0, 0]} scale={scale}>
        <Book
          displayedPosition={displayedPosition}
          direction={direction}
          motion={motion}
          onSelectSheet={onSelectSheet}
          onReady={onReady}
        />
      </group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, GROUND_OFFSET_Y * scale, 0]}
        receiveShadow
      >
        <planeGeometry args={[8, 8]} />
        <shadowMaterial transparent opacity={GROUND_SHADOW_OPACITY} />
      </mesh>
    </>
  );
}
