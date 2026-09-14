'use client';

import { OrbitControls, PerspectiveCamera } from '@react-three/drei';

import {
  CAMERA_FAR,
  CAMERA_FOV,
  CAMERA_NEAR,
  CAMERA_POSITION,
  CAMERA_TARGET,
  ENABLE_ORBIT_CONTROLS,
} from '../config/catalog-scene';

/**
 * A fixed presentation camera, not a free viewer: the book is scaled to fit the
 * viewport (see `CatalogScene`), so the camera itself never has to move.
 */
export function CameraRig() {
  return (
    <>
      <PerspectiveCamera
        makeDefault
        fov={CAMERA_FOV}
        near={CAMERA_NEAR}
        far={CAMERA_FAR}
        position={CAMERA_POSITION}
        onUpdate={(camera) => camera.lookAt(...CAMERA_TARGET)}
      />
      {ENABLE_ORBIT_CONTROLS ? <OrbitControls enableDamping={false} /> : null}
    </>
  );
}
