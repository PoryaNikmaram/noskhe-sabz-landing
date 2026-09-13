import { getSiteUrl } from '@/lib/env';

export const site = {
  name: 'نسخه سبز',
  shortName: 'نسخه سبز',
  description: 'راهکار جامع مدیریت داروخانه',
  url: getSiteUrl(),
  locale: 'fa_IR',
  direction: 'rtl',
} as const;

export type SiteConfig = typeof site;
