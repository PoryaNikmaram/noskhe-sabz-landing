import { cn } from '@/lib/cn';

import type { HTMLAttributes, ReactNode } from 'react';

export type SectionSpacing = 'sm' | 'md' | 'lg';

export type SectionProps = HTMLAttributes<HTMLElement> & {
  spacing?: SectionSpacing;
  children: ReactNode;
};

const spacingStyles: Record<SectionSpacing, string> = {
  sm: 'py-12 md:py-16',
  md: 'py-16 md:py-24',
  lg: 'py-20 md:py-32',
};

export function Section({ spacing = 'md', className, children, ...props }: SectionProps) {
  return (
    <section className={cn(spacingStyles[spacing], className)} {...props}>
      {children}
    </section>
  );
}
