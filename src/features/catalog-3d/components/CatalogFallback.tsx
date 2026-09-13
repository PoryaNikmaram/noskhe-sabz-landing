'use client';

import Image from 'next/image';

import { Button } from '@/components/ui/button/Button';
import { Typography } from '@/components/ui/typography/Typography';
import { catalogPages } from '../config/catalog-pages';

export type CatalogFallbackReason = 'webgl' | 'scene';

type CatalogFallbackProps = {
  turnedCount: number;
  reason?: CatalogFallbackReason;
  onPrevious: () => void;
  onNext: () => void;
};

const fallbackMessages: Record<CatalogFallbackReason, string> = {
  webgl: 'نمایش سه‌بعدی در این مرورگر در دسترس نیست. می‌توانید برگه‌ها را به‌صورت ایستا مرور کنید.',
  scene: 'بارگذاری صحنه سه‌بعدی ناموفق بود. می‌توانید برگه‌ها را به‌صورت ایستا مرور کنید.',
};

export function CatalogFallback({
  turnedCount,
  reason = 'webgl',
  onPrevious,
  onNext,
}: CatalogFallbackProps) {
  const sheetIndex = Math.min(turnedCount, catalogPages.length - 1);
  const page = catalogPages[sheetIndex];
  const canPrevious = turnedCount > 0;
  const canNext = turnedCount < catalogPages.length - 1;

  if (!page) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-card">
        <Image
          src={page.front}
          alt={page.title}
          width={512}
          height={720}
          unoptimized
          className="mx-auto h-auto w-full max-w-sm bg-surface-muted"
        />
      </div>
      <Typography variant="body-sm" className="text-center text-foreground-muted">
        {fallbackMessages[reason]}
      </Typography>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button type="button" variant="outline" onClick={onPrevious} disabled={!canPrevious}>
          برگه قبل
        </Button>
        <Typography variant="body-sm" className="min-w-28 text-center" aria-live="polite">
          برگه {sheetIndex + 1} از {catalogPages.length}
        </Typography>
        <Button type="button" variant="primary" onClick={onNext} disabled={!canNext}>
          برگه بعد
        </Button>
      </div>
    </div>
  );
}
