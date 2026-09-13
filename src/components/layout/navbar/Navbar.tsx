import Link from 'next/link';

import { Container } from '@/components/layout/Container';
import { Logo } from '@/components/shared/Logo';
import { mainNav, primaryCta, secondaryAction } from '@/config/navigation';
import { routes } from '@/config/routes';

import { DesktopNavigation } from './DesktopNavigation';
import { MobileNavigation } from './MobileNavigation';

export function Navbar() {
  return (
    <header className="relative sticky top-0 z-50 border-b border-border bg-background">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link
          href={routes.home}
          className="rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <Logo />
        </Link>

        <DesktopNavigation
          items={mainNav}
          primaryCta={primaryCta}
          secondaryAction={secondaryAction}
        />
        <MobileNavigation
          items={mainNav}
          primaryCta={primaryCta}
          secondaryAction={secondaryAction}
        />
      </Container>
    </header>
  );
}
