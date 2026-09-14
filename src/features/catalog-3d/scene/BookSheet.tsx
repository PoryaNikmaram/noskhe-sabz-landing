'use client';

import { useCursor } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { easing } from 'maath';
import { useEffect, useMemo, useRef, useState } from 'react';

import {
  BONE_COUNT,
  FAN_STEP_RAD,
  FOLD_SPAN_START,
  HIGHLIGHT_INTENSITY,
  SPINE_CURVE_SPAN,
  insideCurveStrength,
  outsideCurveStrength,
  type BookMotion,
  type SheetSurface,
} from '../config/book-engine';
import {
  createFoldShares,
  createRestingBoneShares,
  createTurningShares,
  faceSlotsForDirection,
  restingSheetYaw,
  turningPulse,
} from '../lib/page-pose';
import { createPageMaterials, disposePageMaterials } from './page-materials';
import { createSkinnedPage, disposeSkinnedPage } from './page-skeleton';

import type { BufferGeometry, Group, Object3D, Texture } from 'three';
import type { ThreeEvent } from '@react-three/fiber';
import type { BookDirection } from '../types/catalog.types';

type BookSheetProps = {
  sheetIndex: number;
  /** True once this sheet rests on the far side of the spine. */
  turned: boolean;
  /** True while the whole book is shut, where sheets must lie perfectly flat. */
  bookClosed: boolean;
  direction: BookDirection;
  surface: SheetSurface;
  motion: BookMotion;
  geometry: BufferGeometry;
  frontMap: Texture;
  backMap: Texture;
  roughnessMap?: Texture;
  /** Offset along the sheet normal that keeps stacked sheets apart. */
  stackOffset: number;
  onSelect: (sheetIndex: number) => void;
};

export function BookSheet({
  sheetIndex,
  turned,
  bookClosed,
  direction,
  surface,
  motion,
  geometry,
  frontMap,
  backMap,
  roughnessMap,
  stackOffset,
  onSelect,
}: BookSheetProps) {
  const groupRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  /** Curvature distributions depend only on config, so they are built once. */
  const shares = useMemo(
    () => ({
      resting: createRestingBoneShares({
        boneCount: BONE_COUNT,
        insideCurveStrength,
        outsideCurveStrength,
        spineCurveSpan: SPINE_CURVE_SPAN,
        hingeShare: surface.hingeShare,
      }),
      turning: createTurningShares(BONE_COUNT),
      fold: createFoldShares(BONE_COUNT, FOLD_SPAN_START),
    }),
    [surface.hingeShare],
  );

  const materialSet = useMemo(() => {
    const slots = faceSlotsForDirection(frontMap, backMap, direction);
    return createPageMaterials({ ...slots, roughnessMap }, surface);
  }, [frontMap, backMap, roughnessMap, surface, direction]);
  const mesh = useMemo(
    () => createSkinnedPage(geometry, materialSet.materials),
    [geometry, materialSet],
  );

  useEffect(() => () => disposePageMaterials(materialSet), [materialSet]);
  useEffect(() => () => disposeSkinnedPage(mesh), [mesh]);

  /** Frame-loop bookkeeping for the transient turn pulse. */
  const lastTurnedRef = useRef(turned);
  // -Infinity means "no turn has happened", which reads as a finished pulse.
  const turnedAtRef = useRef(Number.NEGATIVE_INFINITY);

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) {
      return;
    }

    if (lastTurnedRef.current !== turned) {
      lastTurnedRef.current = turned;
      turnedAtRef.current = state.clock.elapsedTime;
    }

    const elapsedMs = (state.clock.elapsedTime - turnedAtRef.current) * 1000;
    const pulse = turningPulse(elapsedMs, motion.turningPulseMs);

    const restingYaw = restingSheetYaw({
      sheetIndex,
      turned,
      bookClosed,
      direction,
      fanStepRad: FAN_STEP_RAD,
    });
    // Both transients follow the side the sheet is heading to, and both fade
    // with the pulse, so a resting sheet is only shaped by its resting curve.
    const transientScale = Math.sign(restingYaw) * surface.turnCurveScale * pulse;
    const archTotal = motion.turningCurveStrength * transientScale;
    const foldTotal = motion.foldStrength * transientScale;

    const bones = mesh.skeleton.bones;
    for (let bone = 0; bone < bones.length; bone += 1) {
      // Bone 0 sits exactly at the pivot, so its share is applied to the sheet
      // group instead — same rotation, but it also carries the sheet's position.
      const node: Object3D = bone === 0 ? group : bones[bone];

      let yaw = shares.resting[bone] * restingYaw + shares.turning[bone] * archTotal;
      let fold = shares.fold[bone] * foldTotal;

      if (bookClosed) {
        // A shut book is a flat stack: all rotation collapses onto the binding.
        yaw = bone === 0 ? restingYaw : 0;
        fold = 0;
      }

      easing.dampAngle(node.rotation, 'y', yaw, motion.boneSmoothTime, delta);
      easing.dampAngle(node.rotation, 'x', fold, motion.foldSmoothTime, delta);
    }

    const highlight = hovered ? HIGHLIGHT_INTENSITY : 0;
    for (const face of materialSet.faces) {
      easing.damp(face, 'emissiveIntensity', highlight, motion.highlightSmoothTime, delta);
    }
  });

  function handlePointerOver(event: ThreeEvent<PointerEvent>) {
    event.stopPropagation();
    setHovered(true);
  }

  function handlePointerOut(event: ThreeEvent<PointerEvent>) {
    event.stopPropagation();
    setHovered(false);
  }

  function handleClick(event: ThreeEvent<MouseEvent>) {
    event.stopPropagation();
    setHovered(false);
    onSelect(sheetIndex);
  }

  return (
    <group
      ref={groupRef}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      <primitive object={mesh} position-z={stackOffset} />
    </group>
  );
}
