import { cn } from '@/lib/cn';

import type { HTMLAttributes } from 'react';

export type LogoVariant = 'full' | 'mark';

export type LogoProps = HTMLAttributes<HTMLDivElement> & {
  variant?: LogoVariant;
};

function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn('inline-block size-8 shrink-0 rounded-md bg-brand-500', className)}
      aria-hidden="true"
    />
  );
}

function LogoFull({ className }: { className?: string }) {
  return (
    <span className={cn('text-xl font-bold tracking-tight text-foreground', className)}>
      نسخه سبز
    </span>
  );
}

export function Logo({ variant = 'full', className, ...props }: LogoProps) {
  return (
    <div
      className={cn('inline-flex items-center gap-2', className)}
      aria-label="نسخه سبز"
      {...props}
    >
      {variant === 'mark' ? (
        <LogoMark />
      ) : (
        <>
          <LogoMark />
          <LogoFull />
        </>
      )}
    </div>
  );
}
