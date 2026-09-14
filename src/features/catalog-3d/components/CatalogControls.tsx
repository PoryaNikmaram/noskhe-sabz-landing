'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button/Button';
import { Typography } from '@/components/ui/typography/Typography';
import { describePosition } from '../lib/navigation';

import type { BookDirection, CatalogPosition } from '../types/catalog.types';

type CatalogControlsProps = {
  targetPosition: CatalogPosition;
  sheetCount: number;
  direction: BookDirection;
  onPrevious: () => void;
  onNext: () => void;
  onSelectPosition: (position: CatalogPosition) => void;
};

export function CatalogControls({
  targetPosition,
  sheetCount,
  direction,
  onPrevious,
  onNext,
  onSelectPosition,
}: CatalogControlsProps) {
  // Arrows follow the reading direction of the UI, so "next" points the way a
  // Persian reader expects rather than being hardcoded to one side.
  const ForwardIcon = direction === 'rtl' ? ChevronLeft : ChevronRight;
  const BackwardIcon = direction === 'rtl' ? ChevronRight : ChevronLeft;
  const positions = Array.from({ length: sheetCount + 1 }, (_, index) => index);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button type="button" variant="outline" onClick={onPrevious} disabled={targetPosition <= 0}>
          <BackwardIcon className="size-4" aria-hidden="true" />
          برگه قبل
        </Button>
        <Typography variant="body-sm" className="min-w-36 text-center" aria-live="polite">
          {describePosition(targetPosition, sheetCount)}
        </Typography>
        <Button
          type="button"
          variant="primary"
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
