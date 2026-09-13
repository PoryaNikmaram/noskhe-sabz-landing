'use client';

import { useFrame, useLoader } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';

import { catalogPages } from '../config/catalog-pages';
import {
  BOARD_COLOR,
  CURL_STRENGTH,
  PAGE_HEIGHT,
  PAGE_WIDTH,
  REDUCED_MOTION_CURL,
  SHEET_THICKNESS,
  SPINE_COLOR,
} from '../config/catalog-scene';
import { BookPage, type PageTurnState } from './BookPage';
import { easeInOutCubic } from './deform-page';
import { SvgTextureLoader } from './load-svg-texture';

import type { Texture } from 'three';
import type { TurnDirection } from '../types/catalog.types';

type BookProps = {
  turnedCount: number;
  pendingTurn: TurnDirection | null;
  reducedMotion: boolean;
  turnDurationMs: number;
  onTurnSettled: (nextCount: number) => void;
  onRequestTurn: (direction: TurnDirection) => void;
};

/**
 * `turnedCount` sheets already rest on the left of the spine; the rest rest on
 * the right. Each sheet's Z offset makes the two stacks look physically piled.
 */
function stackOffsetForSheet(sheetIndex: number, turnedCount: number): number {
  if (sheetIndex >= turnedCount) {
    return -(sheetIndex - turnedCount) * SHEET_THICKNESS;
  }
  return -(turnedCount - 1 - sheetIndex) * SHEET_THICKNESS;
}

function sheetTexture(textures: readonly Texture[], index: number): Texture {
  const texture = textures[index];
  if (!texture) {
    throw new Error(`Catalog texture at index ${index} is missing.`);
  }
  return texture;
}

export function Book({
  turnedCount,
  pendingTurn,
  reducedMotion,
  turnDurationMs,
  onTurnSettled,
  onRequestTurn,
}: BookProps) {
  const textureUrls = useMemo(() => catalogPages.flatMap((page) => [page.front, page.back]), []);
  const textures = useLoader(SvgTextureLoader, textureUrls) as Texture[];

  const turnState = useRef<PageTurnState>({ sheetIndex: -1, progress: 0 });
  const animation = useRef({
    active: false,
    start: 0,
    end: 0,
    elapsed: 0,
    duration: 0.7,
    direction: 'next' as TurnDirection,
  });

  useEffect(() => {
    if (!pendingTurn) {
      return;
    }

    const sheetIndex = pendingTurn === 'next' ? turnedCount : turnedCount - 1;
    animation.current = {
      active: true,
      start: pendingTurn === 'next' ? 0 : 1,
      end: pendingTurn === 'next' ? 1 : 0,
      elapsed: 0,
      duration: turnDurationMs / 1000,
      direction: pendingTurn,
    };
    turnState.current.sheetIndex = sheetIndex;
    turnState.current.progress = animation.current.start;
  }, [pendingTurn, turnedCount, turnDurationMs]);

  useFrame((_, delta) => {
    const current = animation.current;
    if (!current.active) {
      return;
    }

    current.elapsed += delta;
    const t = Math.min(1, current.elapsed / current.duration);
    turnState.current.progress = current.start + (current.end - current.start) * easeInOutCubic(t);

    if (t >= 1) {
      current.active = false;
      const settledCount = current.direction === 'next' ? turnedCount + 1 : turnedCount - 1;
      turnState.current.sheetIndex = -1;
      turnState.current.progress = current.end;
      onTurnSettled(settledCount);
    }
  });

  const curlStrength = reducedMotion ? REDUCED_MOTION_CURL : CURL_STRENGTH;
  const spineDepth = catalogPages.length * SHEET_THICKNESS + 0.03;

  return (
    <group>
      <mesh position={[0, 0, -spineDepth / 2]} castShadow>
        <boxGeometry args={[0.04, PAGE_HEIGHT, spineDepth]} />
        <meshStandardMaterial color={SPINE_COLOR} roughness={0.7} metalness={0} />
      </mesh>

      {catalogPages.map((page, sheetIndex) => {
        const interactive =
          pendingTurn === null && (sheetIndex === turnedCount || sheetIndex === turnedCount - 1);

        return (
          <BookPage
            key={page.id}
            sheetIndex={sheetIndex}
            turnedCount={turnedCount}
            turnState={turnState}
            frontMap={sheetTexture(textures, sheetIndex * 2)}
            backMap={sheetTexture(textures, sheetIndex * 2 + 1)}
            curlStrength={curlStrength}
            stackOffset={stackOffsetForSheet(sheetIndex, turnedCount)}
            interactive={interactive}
            onPageClick={(clickedIndex) => {
              if (clickedIndex === turnedCount) {
                onRequestTurn('next');
              } else if (clickedIndex === turnedCount - 1) {
                onRequestTurn('prev');
              }
            }}
          />
        );
      })}

      <mesh position={[PAGE_WIDTH / 2, -PAGE_HEIGHT / 2 - 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <boxGeometry args={[PAGE_WIDTH + 0.04, spineDepth + 0.06, 0.03]} />
        <meshStandardMaterial color={BOARD_COLOR} roughness={0.8} metalness={0} />
      </mesh>
    </group>
  );
}
