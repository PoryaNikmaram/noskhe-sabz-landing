'use client';

export function Lighting() {
  return (
    <>
      <ambientLight intensity={0.55} />
      <hemisphereLight args={['#f4f7f7', '#7a8f8d', 0.35]} />
      <directionalLight
        position={[2.2, 3.8, 2.6]}
        intensity={1.35}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.00025}
        shadow-camera-left={-3}
        shadow-camera-right={3}
        shadow-camera-top={3}
        shadow-camera-bottom={-3}
        shadow-camera-near={0.5}
        shadow-camera-far={12}
      />
      <directionalLight position={[-2.4, 1.4, 1.6]} intensity={0.35} />
    </>
  );
}
