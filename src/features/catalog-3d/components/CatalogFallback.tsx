'use client';

import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button/Button';
import { Typography } from '@/components/ui/typography/Typography';
import { BOOK_DIRECTION } from '../config/book-engine';
import { cn } from '@/lib/cn';
import { catalogSheets } from '../config/catalog-sheets';
import { describePosition } from '../lib/navigation';

import type { CatalogPosition, CatalogSheet, CatalogVariant } from '../types/catalog.types';

export type CatalogFallbackReason = 'webgl' | 'scene';

type CatalogFallbackProps = {
  position: CatalogPosition;
  reason?: CatalogFallbackReason;
  variant?: CatalogVariant;
  onPrevious: () => void;
  onNext: () => void;
};

const heroIconButtonClassName = cn(
  'inline-flex size-9 shrink-0 items-center justify-center rounded-full',
  'border border-white/30 bg-white/12 text-white backdrop-blur-sm',
  'transition-colors duration-normal ease-standard',
  'hover:border-white/45 hover:bg-white/22',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70',
  'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-35',
);

function HeroFallbackControls({
  position,
  sheetCount,
  onPrevious,
  onNext,
}: {
  position: CatalogPosition;
  sheetCount: number;
  onPrevious: () => void;
  onNext: () => void;
}) {
  const direction = BOOK_DIRECTION;
  const ForwardIcon = direction === 'rtl' ? ChevronLeft : ChevronRight;
  const BackwardIcon = direction === 'rtl' ? ChevronRight : ChevronLeft;

  return (
    <div className="flex items-center justify-center gap-3">
      <button
        type="button"
        className={heroIconButtonClassName}
        onClick={onPrevious}
        disabled={position <= 0}
        aria-label="برگه قبل"
      >
        <BackwardIcon className="size-4" aria-hidden="true" />
      </button>
      <Typography
        variant="caption"
        className="min-w-24 text-center text-white/55"
        aria-live="polite"
      >
        {describePosition(position, sheetCount)}
      </Typography>
      <button
        type="button"
        className={heroIconButtonClassName}
        onClick={onNext}
        disabled={position >= sheetCount}
        aria-label="برگه بعد"
      >
        <ForwardIcon className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}

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
  variant = 'lab',
  onPrevious,
  onNext,
}: CatalogFallbackProps) {
  const sheetCount = catalogSheets.length;
  const face = visibleFace(position, catalogSheets);
  const isHero = variant === 'hero';

  if (!face) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div
        className={cn(
          isHero
            ? 'overflow-visible'
            : 'overflow-hidden rounded-lg border border-border bg-surface shadow-card',
        )}
      >
        <Image
          src={face.src}
          alt={face.alt}
          width={512}
          height={720}
          unoptimized
          className={cn(
            'mx-auto h-auto w-full max-w-sm',
            isHero ? 'drop-shadow-xl' : 'bg-surface-muted',
          )}
        />
      </div>
      <Typography
        variant="body-sm"
        className={cn('text-center', isHero ? 'text-white/65' : 'text-foreground-muted')}
      >
        {fallbackMessages[reason]}
      </Typography>
      {isHero ? (
        <HeroFallbackControls
          position={position}
          sheetCount={sheetCount}
          onPrevious={onPrevious}
          onNext={onNext}
        />
      ) : (
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button type="button" variant="outline" onClick={onPrevious} disabled={position <= 0}>
            برگه قبل
          </Button>
          <Typography variant="body-sm" className="min-w-36 text-center" aria-live="polite">
            {describePosition(position, sheetCount)}
          </Typography>
          <Button
            type="button"
            variant="primary"
            onClick={onNext}
            disabled={position >= sheetCount}
          >
            برگه بعد
          </Button>
        </div>
      )}
    </div>
  );
}
