'use client';

import Image from 'next/image';

import { Button } from '@/components/ui/button/Button';
import { Typography } from '@/components/ui/typography/Typography';
import { catalogSheets } from '../config/catalog-sheets';
import { describePosition } from '../lib/navigation';

import type { CatalogPosition, CatalogSheet } from '../types/catalog.types';

export type CatalogFallbackReason = 'webgl' | 'scene';

type CatalogFallbackProps = {
  position: CatalogPosition;
  reason?: CatalogFallbackReason;
  onPrevious: () => void;
  onNext: () => void;
};

const fallbackMessages: Record<CatalogFallbackReason, string> = {
  webgl: 'نمایش سه‌بعدی در این مرورگر در دسترس نیست. می‌توانید برگه‌ها را به‌صورت ایستا مرور کنید.',
  scene: 'بارگذاری صحنه سه‌بعدی ناموفق بود. می‌توانید برگه‌ها را به‌صورت ایستا مرور کنید.',
};

/** The face that would be facing the reader at this navigation position. */
function visibleFace(
  position: CatalogPosition,
  sheets: readonly CatalogSheet[],
): { src: string; alt: string } | null {
  const lastSheet = sheets[sheets.length - 1];
  if (!lastSheet) {
    return null;
  }
  if (position >= sheets.length) {
    return { src: lastSheet.back, alt: lastSheet.title };
  }
  const sheet = sheets[Math.max(0, position)];
  return { src: sheet.front, alt: sheet.title };
}

export function CatalogFallback({
  position,
  reason = 'webgl',
  onPrevious,
  onNext,
}: CatalogFallbackProps) {
  const sheetCount = catalogSheets.length;
  const face = visibleFace(position, catalogSheets);

  if (!face) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-card">
        <Image
          src={face.src}
          alt={face.alt}
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
        <Button type="button" variant="outline" onClick={onPrevious} disabled={position <= 0}>
          برگه قبل
        </Button>
        <Typography variant="body-sm" className="min-w-36 text-center" aria-live="polite">
          {describePosition(position, sheetCount)}
        </Typography>
        <Button type="button" variant="primary" onClick={onNext} disabled={position >= sheetCount}>
          برگه بعد
        </Button>
      </div>
    </div>
  );
}
