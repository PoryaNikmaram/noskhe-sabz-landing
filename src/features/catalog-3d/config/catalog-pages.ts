import type { CatalogPage } from '../types/catalog.types';

/**
 * Each entry is one physical sheet with two printed faces.
 * Content here is placeholder-only; the 3D renderer does not know or care
 * about the meaning of these images, only their file paths.
 */
export const catalogPages: readonly CatalogPage[] = [
  {
    id: 'cover',
    title: 'جلد',
    front: '/catalog-spike/cover.svg',
    back: '/catalog-spike/inside-cover.svg',
  },
  {
    id: 'prescription',
    title: 'نسخه الکترونیک',
    front: '/catalog-spike/prescription.svg',
    back: '/catalog-spike/inventory.svg',
  },
  {
    id: 'insurance',
    title: 'بیمه و مالی',
    front: '/catalog-spike/insurance.svg',
    back: '/catalog-spike/reports.svg',
  },
  {
    id: 'support',
    title: 'پشتیبانی',
    front: '/catalog-spike/support.svg',
    back: '/catalog-spike/inside-cover.svg',
  },
  {
    id: 'back-cover',
    title: 'جلد پشت',
    front: '/catalog-spike/inside-cover.svg',
    back: '/catalog-spike/back-cover.svg',
  },
];
