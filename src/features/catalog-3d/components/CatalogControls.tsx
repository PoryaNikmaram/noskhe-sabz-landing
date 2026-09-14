'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button/Button';
import { Typography } from '@/components/ui/typography/Typography';
import { cn } from '@/lib/cn';
import { describePosition } from '../lib/navigation';

import type { BookDirection, CatalogPosition, CatalogVariant } from '../types/catalog.types';

type CatalogControlsProps = {
  targetPosition: CatalogPosition;
  sheetCount: number;
  direction: BookDirection;
  variant?: CatalogVariant;
  onPrevious: () => void;
  onNext: () => void;
  onSelectPosition: (position: CatalogPosition) => void;
};

const heroIconButtonClassName = cn(
  'inline-flex size-9 shrink-0 items-center justify-center rounded-full',
  'border border-white/30 bg-white/12 text-white backdrop-blur-sm',
  'transition-colors duration-normal ease-standard',
  'hover:border-white/45 hover:bg-white/22',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70',
  'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-35',
);

export function CatalogControls({
  targetPosition,
  sheetCount,
  direction,
  variant = 'lab',
  onPrevious,
  onNext,
  onSelectPosition,
}: CatalogControlsProps) {
  // Arrows follow the reading direction of the UI, so "next" points the way a
  // Persian reader expects rather than being hardcoded to one side.
  const ForwardIcon = direction === 'rtl' ? ChevronLeft : ChevronRight;
  const BackwardIcon = direction === 'rtl' ? ChevronRight : ChevronLeft;
  const isHero = variant === 'hero';
  const buttonSize = isHero ? 'sm' : 'md';
  const positions = Array.from({ length: sheetCount + 1 }, (_, index) => index);

  if (isHero) {
    return (
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          className={heroIconButtonClassName}
          onClick={onPrevious}
          disabled={targetPosition <= 0}
          aria-label="برگه قبل"
        >
          <BackwardIcon className="size-4" aria-hidden="true" />
        </button>
        <Typography
          variant="caption"
          className="min-w-24 text-center text-white/55"
          aria-live="polite"
        >
          {describePosition(targetPosition, sheetCount)}
        </Typography>
        <button
          type="button"
          className={heroIconButtonClassName}
          onClick={onNext}
          disabled={targetPosition >= sheetCount}
          aria-label="برگه بعد"
        >
          <ForwardIcon className="size-4" aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          type="button"
          variant="outline"
          size={buttonSize}
          onClick={onPrevious}
          disabled={targetPosition <= 0}
        >
          <BackwardIcon className="size-4" aria-hidden="true" />
          برگه قبل
        </Button>
        <Typography variant="body-sm" className="min-w-36 text-center" aria-live="polite">
          {describePosition(targetPosition, sheetCount)}
        </Typography>
        <Button
          type="button"
          variant="primary"
          size={buttonSize}
          onClick={onNext}
          disabled={targetPosition >= sheetCount}
        >
          برگه بعد
          <ForwardIcon className="size-4" aria-hidden="true" />
        </Button>
      </div>

      <div
        className="flex flex-wrap items-center justify-center gap-2"
        role="group"
        aria-label="پرش به موقعیت"
      >
        {positions.map((position) => (
          <Button
            key={position}
            type="button"
            size="sm"
            variant={position === targetPosition ? 'secondary' : 'ghost'}
            aria-pressed={position === targetPosition}
            onClick={() => onSelectPosition(position)}
          >
            {position}
          </Button>
        ))}
      </div>
    </div>
  );
}
