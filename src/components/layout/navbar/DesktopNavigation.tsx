import Link from 'next/link';

import { cn } from '@/lib/cn';

import {
  navActionClassName,
  navLinkClassName,
  navPrimaryClassName,
  navSecondaryClassName,
} from './nav-styles';

import type { DesktopNavigationProps } from './navbar.types';

export function DesktopNavigation({ items, primaryCta, secondaryAction }: DesktopNavigationProps) {
  return (
    <div className="hidden min-w-0 flex-1 items-center justify-between gap-4 lg:flex">
      <nav aria-label="ناوبری اصلی" className="flex min-w-0 items-center gap-1">
        {items.map((item) => (
          <Link key={item.href} href={item.href} className={navLinkClassName}>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="flex shrink-0 items-center gap-2">
        <Link href={secondaryAction.href} className={cn(navActionClassName, navSecondaryClassName)}>
          {secondaryAction.label}
        </Link>
        <Link href={primaryCta.href} className={cn(navActionClassName, navPrimaryClassName)}>
          {primaryCta.label}
        </Link>
      </div>
    </div>
  );
}
