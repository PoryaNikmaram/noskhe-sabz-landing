import { MeshStandardMaterial } from 'three';

import { HIGHLIGHT_COLOR, type SheetSurface } from '../config/book-engine';

import type { Texture } from 'three';

export type PageTextures = {
  /** Artwork for the +z face; which sheet side that is depends on the binding. */
  positiveZ: Texture;
  negativeZ: Texture;
  roughnessMap?: Texture;
};

export type PageMaterialSet = {
  /** BoxGeometry group order: +x, -x, +y, -y, +z, -z. */
  materials: MeshStandardMaterial[];
  /** The two printed faces, kept separately for the hover highlight. */
  faces: readonly [MeshStandardMaterial, MeshStandardMaterial];
};

function createEdgeMaterial(surface: SheetSurface): MeshStandardMaterial {
  return new MeshStandardMaterial({
    color: surface.edgeColor,
    roughness: 0.9,
    metalness: 0,
  });
}

function createFaceMaterial(
  map: Texture,
  surface: SheetSurface,
  roughnessMap: Texture | undefined,
): MeshStandardMaterial {
  return new MeshStandardMaterial({
    color: '#ffffff',
    map,
    roughness: surface.roughness,
    roughnessMap: roughnessMap ?? null,
    metalness: 0,
    // Emissive stays at zero until a pointer hovers the sheet.
    emissive: HIGHLIGHT_COLOR,
    emissiveIntensity: 0,
  });
}

/**
 * A box needs one material per face group. Four of them are the extruded paper
 * edges; the remaining two carry the printed artwork. Covers get the same
 * structure with a stiffer, less matte surface from their `SheetSurface`.
 */
export function createPageMaterials(
  textures: PageTextures,
  surface: SheetSurface,
): PageMaterialSet {
  const positiveZ = createFaceMaterial(textures.positiveZ, surface, textures.roughnessMap);
  const negativeZ = createFaceMaterial(textures.negativeZ, surface, textures.roughnessMap);

  return {
    materials: [
      createEdgeMaterial(surface),
      createEdgeMaterial(surface),
      createEdgeMaterial(surface),
      createEdgeMaterial(surface),
      positiveZ,
      negativeZ,
    ],
    faces: [positiveZ, negativeZ],
  };
}

/**
 * Materials are created per sheet, so they must be released with the sheet.
 * Textures are *not* disposed here: they are owned by the R3F loader cache and
 * shared between sheets.
 */
export function disposePageMaterials(set: PageMaterialSet): void {
  for (const material of set.materials) {
    material.dispose();
  }
}
