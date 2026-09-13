'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';

import { CANVAS_DPR, SCENE_BACKGROUND } from '../config/catalog-scene';
import { CatalogScene } from './CatalogScene';

import type { TurnDirection } from '../types/catalog.types';

type CatalogCanvasProps = {
  turnedCount: number;
  pendingTurn: TurnDirection | null;
  reducedMotion: boolean;
  turnDurationMs: number;
  onTurnSettled: (nextCount: number) => void;
  onRequestTurn: (direction: TurnDirection) => void;
};

export function CatalogCanvas({
  turnedCount,
  pendingTurn,
  reducedMotion,
  turnDurationMs,
  onTurnSettled,
  onRequestTurn,
}: CatalogCanvasProps) {
  return (
    <Canvas
      className="h-full w-full"
      dpr={CANVAS_DPR}
      shadows
      camera={{ position: [0, 0.52, 2.85], fov: 38, near: 0.1, far: 40 }}
      gl={{ antialias: true, alpha: false, powerPreference: 'default' }}
    >
      <color attach="background" args={[SCENE_BACKGROUND]} />
      <Suspense fallback={null}>
        <CatalogScene
          turnedCount={turnedCount}
          pendingTurn={pendingTurn}
          reducedMotion={reducedMotion}
          turnDurationMs={turnDurationMs}
          onTurnSettled={onTurnSettled}
          onRequestTurn={onRequestTurn}
        />
      </Suspense>
    </Canvas>
  );
}
