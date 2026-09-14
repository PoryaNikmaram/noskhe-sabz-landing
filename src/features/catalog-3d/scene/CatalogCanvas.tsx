'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';

import {
  CAMERA_FAR,
  CAMERA_FOV,
  CAMERA_NEAR,
  CAMERA_POSITION,
  CANVAS_DPR,
  SCENE_BACKGROUND,
} from '../config/catalog-scene';
import { CatalogScene } from './CatalogScene';

import type { BookDirection, CatalogVariant } from '../types/catalog.types';

type CatalogCanvasProps = {
  displayedPosition: number;
  direction: BookDirection;
  reducedMotion: boolean;
  variant?: CatalogVariant;
  onSelectSheet: (sheetIndex: number) => void;
  onReady: () => void;
};

export function CatalogCanvas({
  displayedPosition,
  direction,
  reducedMotion,
  variant = 'lab',
  onSelectSheet,
  onReady,
}: CatalogCanvasProps) {
  const transparent = variant === 'hero';

  return (
    <Canvas
      className="h-full w-full"
      dpr={CANVAS_DPR}
      // Percentage-closer filtering: the soft variant was removed in three r186.
      shadows="percentage"
      camera={{
        position: CAMERA_POSITION,
        fov: CAMERA_FOV,
        near: CAMERA_NEAR,
        far: CAMERA_FAR,
      }}
      gl={{ antialias: true, alpha: transparent, powerPreference: 'default' }}
    >
      {/* The Hero presentation has no scene backdrop: the book must sit
          directly inside the page's own CSS atmosphere, not an opaque
          WebGL rectangle. */}
      {transparent ? null : <color attach="background" args={[SCENE_BACKGROUND]} />}
      <Suspense fallback={null}>
        <CatalogScene
          displayedPosition={displayedPosition}
          direction={direction}
          reducedMotion={reducedMotion}
          onSelectSheet={onSelectSheet}
          onReady={onReady}
        />
      </Suspense>
    </Canvas>
  );
}
