'use client';

import { useFrame, useLoader } from '@react-three/fiber';
import { easing } from 'maath';
import { useEffect, useMemo, useRef } from 'react';

import { PAGE_WIDTH, SHEET_STACK_GAP, sheetSurfaces, type BookMotion } from '../config/book-engine';
import { catalogSheets } from '../config/catalog-sheets';
import { isBookClosed, isSheetTurned } from '../lib/navigation';
import {
  BOOK_BASE_YAW,
  bookFramingOffsetX,
  cumulativeSheetDepths,
  sheetStackOffset,
} from '../lib/page-pose';
import { BookSheet } from './BookSheet';
import { createPageGeometry } from './page-geometry';
import { SvgTextureLoader } from './load-svg-texture';

import type { BufferGeometry, Group, Texture } from 'three';
import type { SheetSurface } from '../config/book-engine';
import type { BookDirection, CatalogSheet } from '../types/catalog.types';

type BookProps = {
  displayedPosition: number;
  direction: BookDirection;
  motion: BookMotion;
  onSelectSheet: (sheetIndex: number) => void;
  onReady: () => void;
};

type SheetSetup = {
  sheet: CatalogSheet;
  surface: SheetSurface;
  geometry: BufferGeometry;
};

function requireTexture(textures: ReadonlyMap<string, Texture>, url: string): Texture {
  const texture = textures.get(url);
  if (!texture) {
    throw new Error(`Catalog texture was not loaded: ${url}`);
  }
  return texture;
}

export function Book({ displayedPosition, direction, motion, onSelectSheet, onReady }: BookProps) {
  const textureUrls = useMemo(() => {
    const urls = new Set<string>();
    for (const sheet of catalogSheets) {
      urls.add(sheet.front);
      urls.add(sheet.back);
      if (sheet.roughnessMap) {
        urls.add(sheet.roughnessMap);
      }
    }
    return Array.from(urls);
  }, []);

  // Suspends until every placeholder SVG is rasterized. `SvgTextureLoader`
  // hands back textures that already have the right colour space, so nothing
  // here has to mutate a hook result.
  const loadedTextures = useLoader(SvgTextureLoader, textureUrls);
  const textureByUrl = useMemo(
    () => new Map(textureUrls.map((url, index) => [url, loadedTextures[index]] as const)),
    [textureUrls, loadedTextures],
  );

  /** Geometry is shared by thickness, so all plain sheets use one buffer. */
  const setups = useMemo<SheetSetup[]>(() => {
    const geometryByDepth = new Map<number, BufferGeometry>();
    return catalogSheets.map((sheet) => {
      const surface = sheetSurfaces[sheet.type];
      let geometry = geometryByDepth.get(surface.depth);
      if (!geometry) {
        geometry = createPageGeometry(surface.depth);
        geometryByDepth.set(surface.depth, geometry);
      }
      return { sheet, surface, geometry };
    });
  }, []);

  useEffect(() => {
    const owned = new Set(setups.map((setup) => setup.geometry));
    return () => {
      for (const geometry of owned) {
        geometry.dispose();
      }
    };
  }, [setups]);

  const cumulativeDepths = useMemo(
    () =>
      cumulativeSheetDepths(
        catalogSheets.map((sheet) => sheetSurfaces[sheet.type].depth),
        SHEET_STACK_GAP,
      ),
    [],
  );

  useEffect(() => {
    onReady();
  }, [onReady]);

  const sheetCount = catalogSheets.length;
  const bookClosed = isBookClosed(displayedPosition, sheetCount);

  const framingRef = useRef<Group>(null);
  const framingOffsetX = bookFramingOffsetX({
    displayedPosition,
    sheetCount,
    direction,
    pageWidth: PAGE_WIDTH,
  });

  useFrame((_, delta) => {
    const framing = framingRef.current;
    if (framing) {
      easing.damp(framing.position, 'x', framingOffsetX, motion.boneSmoothTime, delta);
    }
  });

  return (
    <group ref={framingRef}>
      <group rotation={[0, BOOK_BASE_YAW, 0]}>
        {setups.map(({ sheet, surface, geometry }, sheetIndex) => (
          <BookSheet
            key={sheet.id}
            sheetIndex={sheetIndex}
            turned={isSheetTurned(sheetIndex, displayedPosition)}
            bookClosed={bookClosed}
            direction={direction}
            surface={surface}
            motion={motion}
            geometry={geometry}
            frontMap={requireTexture(textureByUrl, sheet.front)}
            backMap={requireTexture(textureByUrl, sheet.back)}
            roughnessMap={
              sheet.roughnessMap ? requireTexture(textureByUrl, sheet.roughnessMap) : undefined
            }
            stackOffset={sheetStackOffset(
              sheetIndex,
              displayedPosition,
              cumulativeDepths,
              direction,
            )}
            onSelect={onSelectSheet}
          />
        ))}
      </group>
    </group>
  );
}
