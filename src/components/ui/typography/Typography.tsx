import { cn } from '@/lib/cn';

import type { TypographyElement, TypographyProps, TypographyVariant } from './typography.types';

const variantStyles: Record<TypographyVariant, string> = {
  display: 'text-4xl leading-snug font-bold tracking-tight md:text-5xl md:leading-snug lg:text-6xl',
  h1: 'text-3xl leading-snug font-semibold tracking-tight md:text-4xl',
  h2: 'text-2xl leading-snug font-semibold tracking-tight md:text-3xl',
  h3: 'text-xl leading-snug font-semibold md:text-2xl',
  h4: 'text-lg leading-snug font-semibold md:text-xl',
  'body-lg': 'text-lg leading-relaxed font-normal',
  body: 'text-base leading-relaxed font-normal',
  'body-sm': 'text-sm leading-relaxed font-normal',
  caption: 'text-xs leading-normal font-normal text-foreground-muted',
};

const defaultElements: Record<TypographyVariant, TypographyElement> = {
  display: 'h1',
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  'body-lg': 'p',
  body: 'p',
  'body-sm': 'p',
  caption: 'span',
};

export function Typography({
  variant = 'body',
  as,
  children,
  className,
  ...props
}: TypographyProps) {
  const Component = as ?? defaultElements[variant];

  return (
    <Component className={cn(variantStyles[variant], className)} {...props}>
      {children}
    </Component>
  );
}
