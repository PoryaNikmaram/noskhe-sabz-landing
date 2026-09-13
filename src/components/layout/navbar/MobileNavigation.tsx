'use client';

import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useId, useState } from 'react';

import { Button } from '@/components/ui/button/Button';
import { cn } from '@/lib/cn';

import {
  navActionClassName,
  navLinkClassName,
  navPrimaryClassName,
  navSecondaryClassName,
} from './nav-styles';

import type { MobileNavigationProps } from './navbar.types';

export function MobileNavigation({ items, primaryCta, secondaryAction }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  function closeMenu() {
    setIsOpen(false);
  }

  return (
    <div className="lg:hidden">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        aria-expanded={isOpen}
        aria-controls={menuId}
        aria-label={isOpen ? 'بستن منو' : 'باز کردن منو'}
        onClick={() => setIsOpen((open) => !open)}
        className="size-10 px-0"
      >
        {isOpen ? (
          <X aria-hidden="true" className="size-5" />
        ) : (
          <Menu aria-hidden="true" className="size-5" />
        )}
      </Button>

      <div
        id={menuId}
        hidden={!isOpen}
        className="absolute inset-x-0 top-full z-40 border-b border-border bg-background shadow-soft"
      >
        <nav aria-label="ناوبری موبایل" className="flex flex-col gap-1 px-5 py-4 md:px-8">
          {items.map((item) => (
            <Link key={item.href} href={item.href} className={navLinkClassName} onClick={closeMenu}>
              {item.label}
            </Link>
          ))}

          <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
            <Link
              href={secondaryAction.href}
              className={cn(navActionClassName, navSecondaryClassName, 'w-full')}
              onClick={closeMenu}
            >
              {secondaryAction.label}
            </Link>
            <Link
              href={primaryCta.href}
              className={cn(navActionClassName, navPrimaryClassName, 'w-full')}
              onClick={closeMenu}
            >
              {primaryCta.label}
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
}
