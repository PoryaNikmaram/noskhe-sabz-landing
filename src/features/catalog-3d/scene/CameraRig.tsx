'use client';

import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { useThree } from '@react-three/fiber';

import { ENABLE_ORBIT_CONTROLS } from '../config/catalog-scene';

export function CameraRig() {
  const size = useThree((state) => state.size);
  const compact = size.width < 768;

  return (
    <>
      <PerspectiveCamera
        makeDefault
        fov={38}
        near={0.1}
        far={40}
        position={[0, compact ? 0.42 : 0.52, compact ? 3.6 : 2.85]}
        onUpdate={(camera) => camera.lookAt(0, 0.05, 0)}
      />
      {ENABLE_ORBIT_CONTROLS ? <OrbitControls enableDamping={false} /> : null}
    </>
  );
}
