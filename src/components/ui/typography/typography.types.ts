import type { ElementType, HTMLAttributes, ReactNode } from 'react';

export type TypographyVariant =
  'display' | 'h1' | 'h2' | 'h3' | 'h4' | 'body-lg' | 'body' | 'body-sm' | 'caption';

export type TypographyProps = {
  variant?: TypographyVariant;
  as?: ElementType;
  children: ReactNode;
  className?: string;
} & HTMLAttributes<HTMLElement>;
