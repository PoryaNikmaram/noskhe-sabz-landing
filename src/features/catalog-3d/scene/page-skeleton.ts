import { Bone, Skeleton, SkinnedMesh, Sphere, Vector3 } from 'three';

import { BONE_COUNT, PAGE_HEIGHT, PAGE_WIDTH, SEGMENT_WIDTH } from '../config/book-engine';

import type { BufferGeometry, Material } from 'three';

/**
 * A straight chain of bones from the spine outward: bone 0 sits at the binding
 * and every following bone is parented to the previous one, offset by exactly
 * one segment along X. Because the chain is hierarchical, a small rotation on
 * each bone accumulates into a smooth curve along the sheet.
 */
function createBoneChain(): Bone[] {
  const root = new Bone();
  const bones: Bone[] = [root];
  let parent = root;

  for (let index = 1; index < BONE_COUNT; index += 1) {
    const bone = new Bone();
    bone.position.x = SEGMENT_WIDTH;
    parent.add(bone);
    bones.push(bone);
    parent = bone;
  }

  return bones;
}

/**
 * Binds a page geometry to its own bone chain and returns the SkinnedMesh.
 * Geometry and materials are owned by the caller; the mesh only owns its
 * skeleton.
 */
export function createSkinnedPage(geometry: BufferGeometry, materials: Material[]): SkinnedMesh {
  const bones = createBoneChain();
  const root = bones[0];
  if (!root) {
    throw new Error('Page bone chain is empty.');
  }

  const mesh = new SkinnedMesh(geometry, materials);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.add(root);
  mesh.bind(new Skeleton(bones));

  // Skinning happens on the GPU, so CPU-side bounds never follow the pose:
  // Three.js caches a bounding sphere the first time it culls or raycasts, and
  // a bent sheet leaves it immediately (which silently breaks clicks). One
  // conservative sphere around the spine covers every reachable pose instead.
  mesh.frustumCulled = false;
  mesh.boundingSphere = new Sphere(
    new Vector3(0, 0, 0),
    Math.hypot(PAGE_WIDTH, PAGE_HEIGHT / 2) + 0.1,
  );

  return mesh;
}

export function disposeSkinnedPage(mesh: SkinnedMesh): void {
  mesh.skeleton.dispose();
}
