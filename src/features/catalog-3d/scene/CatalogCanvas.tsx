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

import type { BookDirection } from '../types/catalog.types';

type CatalogCanvasProps = {
  displayedPosition: number;
  direction: BookDirection;
  reducedMotion: boolean;
  onSelectSheet: (sheetIndex: number) => void;
  onReady: () => void;
};

export function CatalogCanvas({
  displayedPosition,
  direction,
  reducedMotion,
  onSelectSheet,
  onReady,
}: CatalogCanvasProps) {
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
      gl={{ antialias: true, alpha: false, powerPreference: 'default' }}
    >
      <color attach="background" args={[SCENE_BACKGROUND]} />
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
