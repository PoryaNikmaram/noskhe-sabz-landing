'use client';

import { Button } from '@/components/ui/button/Button';
import { Typography } from '@/components/ui/typography/Typography';
import { catalogPages } from '../config/catalog-pages';

type CatalogControlsProps = {
  turnedCount: number;
  isTurning: boolean;
  onPrevious: () => void;
  onNext: () => void;
};

export function CatalogControls({
  turnedCount,
  isTurning,
  onPrevious,
  onNext,
}: CatalogControlsProps) {
  const currentSheet = Math.min(turnedCount + 1, catalogPages.length);
  const canPrevious = !isTurning && turnedCount > 0;
  const canNext = !isTurning && turnedCount < catalogPages.length;

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Button type="button" variant="outline" onClick={onPrevious} disabled={!canPrevious}>
        برگه قبل
      </Button>
      <Typography variant="body-sm" className="min-w-28 text-center" aria-live="polite">
        برگه {currentSheet} از {catalogPages.length}
      </Typography>
      <Button type="button" variant="primary" onClick={onNext} disabled={!canNext}>
        برگه بعد
      </Button>
    </div>
  );
}
