import type { Metadata } from 'next';

import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { Typography } from '@/components/ui/typography/Typography';
import { Catalog3D } from '@/features/catalog-3d/components/Catalog3D';

export const metadata: Metadata = {
  title: 'آزمایش کاتالوگ سه‌بعدی',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ThreeDLabPage() {
  return (
    <main className="min-w-0">
      <Section spacing="sm">
        <Container size="default">
          <Typography variant="h1">آزمایش کاتالوگ سه‌بعدی</Typography>
          <Typography variant="body" className="mt-3 max-w-2xl text-foreground-muted">
            این صفحه یک نمونهٔ فنی داخلی است و بخشی از سایت بازاریابی نیست. هدف آن ارزیابی ورق‌زدن
            تعاملی یک کتاب سه‌بعدی برای مراحل بعدی توسعه است.
          </Typography>
          <div className="mt-8">
            <Catalog3D />
          </div>
        </Container>
      </Section>
    </main>
  );
}
