'use client';

import { useThree } from '@react-three/fiber';

import { PAGE_HEIGHT } from '../config/catalog-scene';
import { Book } from './Book';
import { CameraRig } from './CameraRig';
import { Lighting } from './Lighting';

import type { TurnDirection } from '../types/catalog.types';

type CatalogSceneProps = {
  turnedCount: number;
  pendingTurn: TurnDirection | null;
  reducedMotion: boolean;
  turnDurationMs: number;
  onTurnSettled: (nextCount: number) => void;
  onRequestTurn: (direction: TurnDirection) => void;
};

export function CatalogScene({
  turnedCount,
  pendingTurn,
  reducedMotion,
  turnDurationMs,
  onTurnSettled,
  onRequestTurn,
}: CatalogSceneProps) {
  const { size } = useThree();
  const compact = size.width < 768;
  const rotation: [number, number, number] = compact ? [-0.22, 0.28, 0] : [-0.3, 0.42, 0];
  const scale = compact ? 0.82 : 1;

  return (
    <>
      <CameraRig />
      <Lighting />
      <group rotation={rotation} scale={scale} position={[0, compact ? -0.05 : -0.08, 0]}>
        <Book
          turnedCount={turnedCount}
          pendingTurn={pendingTurn}
          reducedMotion={reducedMotion}
          turnDurationMs={turnDurationMs}
          onTurnSettled={onTurnSettled}
          onRequestTurn={onRequestTurn}
        />
      </group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -PAGE_HEIGHT / 2 - 0.18, 0]}
        receiveShadow
      >
        <planeGeometry args={[8, 8]} />
        <shadowMaterial transparent opacity={0.16} />
      </mesh>
    </>
  );
}
