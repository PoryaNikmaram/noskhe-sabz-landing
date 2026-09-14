/** Physical turning direction of the book. Persian catalogs read right-to-left. */
export type BookDirection = 'rtl' | 'ltr';

/**
 * A sheet is one physical piece of paper with two printed faces.
 * `type` selects a surface profile (thickness, stiffness, roughness) — the
 * renderer never branches on the sheet index itself.
 */
export type SheetType = 'cover' | 'page' | 'back-cover';

export type CatalogSheet = {
  id: string;
  title: string;
  front: string;
  back: string;
  type: SheetType;
  /** Optional grayscale roughness map, applied to both faces when present. */
  roughnessMap?: string;
};

/**
 * Navigation domain (see `docs/catalog-3d-spike.md`):
 *
 * - `0` — book closed, front cover on top, nothing turned
 * - `k` — the first `k` sheets have been turned
 * - `sheetCount` — book closed on the back cover, everything turned
 *
 * So a book with `n` sheets has `n + 1` valid positions.
 */
export type CatalogPosition = number;

export type NavigationStep = 'next' | 'previous';
