import Link from 'next/link';

import { Container } from '@/components/layout/Container';
import { Logo } from '@/components/shared/Logo';
import { Typography } from '@/components/ui/typography/Typography';
import { footerNav, legalNav } from '@/config/navigation';
import { routes } from '@/config/routes';
import { site } from '@/config/site';

const linkClassName =
  'rounded-sm text-sm text-foreground-muted transition-colors duration-normal ease-standard hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface-muted">
      <Container>
        <div className="grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-3 lg:py-16">
          <div className="max-w-sm space-y-4">
            <Link
              href={routes.home}
              className="inline-flex rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <Logo />
            </Link>
            <Typography variant="body-sm" className="text-foreground-muted">
              {site.description}
            </Typography>
          </div>

          <nav aria-label="پیوندهای پاورقی" className="space-y-3">
            <Typography variant="h4">پیوندها</Typography>
            <ul className="space-y-2">
              {footerNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={linkClassName}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="space-y-3">
            <Typography variant="h4">پشتیبانی و فروش</Typography>
            <Typography variant="body-sm" className="text-foreground-muted">
              راه‌های ارتباطی به‌زودی از همین صفحه اعلام می‌شود.
            </Typography>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-border py-6 sm:flex-row sm:items-center sm:justify-between">
          <Typography variant="caption">
            © {year} {site.name}
          </Typography>
          {legalNav.length > 0 ? (
            <nav aria-label="پیوندهای حقوقی">
              <ul className="flex flex-wrap gap-4">
                {legalNav.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className={linkClassName}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}
        </div>
      </Container>
    </footer>
  );
}
