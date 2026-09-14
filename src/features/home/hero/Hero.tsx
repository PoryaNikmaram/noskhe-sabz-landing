import Link from 'next/link';

import { Container } from '@/components/layout/Container';
import { Typography } from '@/components/ui/typography/Typography';
import { routes } from '@/config/routes';
import { site } from '@/config/site';
import { Catalog3D } from '@/features/catalog-3d/components/Catalog3D';
import { cn } from '@/lib/cn';

import { HeroWaveBackground } from './HeroWaveBackground';

import styles from './Hero.module.css';

export function Hero() {
  return (
    <section className={cn(styles.hero, 'relative')}>
      <HeroWaveBackground />
      <Container size="wide" className={styles.grid}>
        <div className={styles.content}>
          <Typography variant="body-sm" as="span" className={styles.eyebrow}>
            {site.name}
          </Typography>
          <Typography variant="display" className={cn(styles.headline, 'mt-4')}>
            راهکار جامع مدیریت داروخانه
          </Typography>
          <Typography variant="body-lg" className="mt-5 max-w-md text-foreground-muted">
            ثبت نسخه، پذیرش بیمه، مدیریت موجودی، فروش و امور روزانه داروخانه؛ یکپارچه در یک سامانه.
          </Typography>
          <div className={styles.ctaRow}>
            <Link href={routes.demo} className={styles.ctaPrimary}>
              درخواست دمو
            </Link>
            <Link href={routes.features} className={styles.ctaSecondary}>
              مشاهده امکانات
            </Link>
          </div>
        </div>

        <div className={styles.stage}>
          <Catalog3D variant="hero" />
        </div>
      </Container>
    </section>
  );
}
