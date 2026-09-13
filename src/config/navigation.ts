import { routes } from '@/config/routes';

export type NavItem = {
  label: string;
  href: string;
};

export const mainNav: readonly NavItem[] = [
  { label: 'امکانات', href: routes.features },
  { label: 'تعرفه‌ها', href: routes.pricing },
  { label: 'وبلاگ', href: routes.blog },
  { label: 'درباره ما', href: routes.about },
  { label: 'تماس با ما', href: routes.contact },
];

export const footerNav: readonly NavItem[] = [
  { label: 'امکانات', href: routes.features },
  { label: 'تعرفه‌ها', href: routes.pricing },
  { label: 'درباره ما', href: routes.about },
  { label: 'وبلاگ', href: routes.blog },
  { label: 'تماس', href: routes.contact },
];

export const primaryCta: NavItem = {
  label: 'درخواست دمو',
  href: routes.demo,
};

export const secondaryAction: NavItem = {
  label: 'ورود',
  href: routes.login,
};

// Legal pages are not published yet. Keep routes in routes.ts and omit links until those pages exist.
export const legalNav: readonly NavItem[] = [];
