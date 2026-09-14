import type { CatalogSheet } from '../types/catalog.types';

/**
 * Content of the spike catalog. Each entry is one physical sheet with two
 * printed faces. The 3D engine only consumes `front`, `back` and `type`;
 * replacing this list with real artwork requires no renderer change.
 */
export const catalogSheets: readonly CatalogSheet[] = [
  {
    id: 'cover',
    title: 'جلد',
    front: '/catalog-spike/cover.svg',
    back: '/catalog-spike/inside-cover.svg',
    type: 'cover',
  },
  {
    id: 'prescription',
    title: 'نسخه الکترونیک',
    front: '/catalog-spike/prescription.svg',
    back: '/catalog-spike/inventory.svg',
    type: 'page',
  },
  {
    id: 'insurance',
    title: 'بیمه و مالی',
    front: '/catalog-spike/insurance.svg',
    back: '/catalog-spike/reports.svg',
    type: 'page',
  },
  {
    id: 'support',
    title: 'پشتیبانی',
    front: '/catalog-spike/support.svg',
    back: '/catalog-spike/inside-cover.svg',
    type: 'page',
  },
  {
    id: 'back-cover',
    title: 'جلد پشت',
    front: '/catalog-spike/inside-cover.svg',
    back: '/catalog-spike/back-cover.svg',
    type: 'back-cover',
  },
];

export const catalogSheetCount = catalogSheets.length;
