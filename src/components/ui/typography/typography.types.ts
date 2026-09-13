import type { HTMLAttributes, ReactNode } from 'react';

export type TypographyVariant =
  'display' | 'h1' | 'h2' | 'h3' | 'h4' | 'body-lg' | 'body' | 'body-sm' | 'caption';

/**
 * Restricted to plain HTML tags (rather than the generic `ElementType`) so this
 * type does not collide with the global JSX namespace once React Three Fiber
 * augments `JSX.IntrinsicElements` with Three.js elements elsewhere in the app.
 */
export type TypographyElement =
  'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div' | 'label';

export type TypographyProps = {
  variant?: TypographyVariant;
  as?: TypographyElement;
  children: ReactNode;
  className?: string;
} & HTMLAttributes<HTMLElement>;
