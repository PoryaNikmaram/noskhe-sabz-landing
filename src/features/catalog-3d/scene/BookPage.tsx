'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { BackSide, PlaneGeometry, type Texture } from 'three';

import { PAGE_HEIGHT, PAGE_SEGMENTS_X, PAGE_SEGMENTS_Y, PAGE_WIDTH } from '../config/catalog-scene';
import { deformPagePositions } from './deform-page';

import type { Group } from 'three';
import type { MutableRefObject } from 'react';

export type PageTurnState = {
  sheetIndex: number;
  progress: number;
};

type BookPageProps = {
  sheetIndex: number;
  turnedCount: number;
  turnState: MutableRefObject<PageTurnState>;
  frontMap: Texture;
  backMap: Texture;
  curlStrength: number;
  stackOffset: number;
  interactive: boolean;
  onPageClick: (sheetIndex: number) => void;
};

function createPageGeometry(): PlaneGeometry {
  const geometry = new PlaneGeometry(PAGE_WIDTH, PAGE_HEIGHT, PAGE_SEGMENTS_X, PAGE_SEGMENTS_Y);
  // Shift so x = 0 is the spine and +x is the outer edge — makes the turn math read naturally.
  geometry.translate(PAGE_WIDTH / 2, 0, 0);
  return geometry;
}

export function BookPage({
  sheetIndex,
  turnedCount,
  turnState,
  frontMap,
  backMap,
  curlStrength,
  stackOffset,
  interactive,
  onPageClick,
}: BookPageProps) {
  const groupRef = useRef<Group>(null);
  const lastProgressRef = useRef(-1);

  // Owned locally by this component; mutated every frame in useFrame below,
  // which is the idiomatic R3F pattern (imperative updates, no re-renders).
  const geometry = useMemo(() => createPageGeometry(), []);
  const restPositions = useMemo(
    () => Float32Array.from(geometry.getAttribute('position').array),
    [geometry],
  );

  useEffect(() => {
    return () => geometry.dispose();
  }, [geometry]);

  useFrame(() => {
    const live = turnState.current;
    const progress =
      live.sheetIndex === sheetIndex ? live.progress : sheetIndex < turnedCount ? 1 : 0;

    if (groupRef.current) {
      const fold = Math.sin(progress * Math.PI);
      groupRef.current.position.z = stackOffset + fold * 0.03;
    }

    if (progress === lastProgressRef.current) {
      return;
    }
    lastProgressRef.current = progress;

    const position = geometry.getAttribute('position');
    const target = position.array;
    if (!(target instanceof Float32Array)) {
      return;
    }

    deformPagePositions(restPositions, target, PAGE_WIDTH, progress, curlStrength);
    position.needsUpdate = true;
    geometry.computeVertexNormals();
  });

  function setCursor(cursor: string) {
    document.body.style.cursor = cursor;
  }

  return (
    <group ref={groupRef} position={[0, 0, stackOffset]}>
      <mesh
        geometry={geometry}
        castShadow
        receiveShadow
        onClick={
          interactive
            ? (event) => {
                event.stopPropagation();
                onPageClick(sheetIndex);
              }
            : undefined
        }
        onPointerOver={
          interactive
            ? (event) => {
                event.stopPropagation();
                setCursor('pointer');
              }
            : undefined
        }
        onPointerOut={interactive ? () => setCursor('auto') : undefined}
      >
        <meshStandardMaterial map={frontMap} roughness={0.88} metalness={0} />
      </mesh>
      <mesh geometry={geometry} castShadow>
        <meshStandardMaterial map={backMap} roughness={0.88} metalness={0} side={BackSide} />
      </mesh>
    </group>
  );
}
