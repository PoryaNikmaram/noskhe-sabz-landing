'use client';

import { SCENE_BACKGROUND } from '../config/catalog-scene';

/**
 * Deliberately small light rig: soft fill, one shadow-casting key light with a
 * tight 1024² shadow frustum sized to the book, and a weak rim light to keep
 * the turning sheet readable. No environment map, no post-processing.
 */
export function Lighting() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <hemisphereLight args={[SCENE_BACKGROUND, '#7a8f8d', 0.35]} />
      <directionalLight
        position={[2.4, 3.6, 3.2]}
        intensity={1.25}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
        shadow-camera-left={-2.4}
        shadow-camera-right={2.4}
        shadow-camera-top={2.4}
        shadow-camera-bottom={-2.4}
        shadow-camera-near={0.5}
        shadow-camera-far={12}
      />
      <directionalLight position={[-2.6, 1.2, 1.8]} intensity={0.55} />
    </>
  );
}
