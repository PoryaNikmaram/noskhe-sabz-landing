import { cn } from '@/lib/cn';

import type { HTMLAttributes, ReactNode } from 'react';

export type ContainerSize = 'narrow' | 'default' | 'wide';

export type ContainerProps = HTMLAttributes<HTMLDivElement> & {
  size?: ContainerSize;
  children: ReactNode;
};

const sizeStyles: Record<ContainerSize, string> = {
  narrow: 'max-w-[var(--container-narrow)]',
  default: 'max-w-[var(--container-default)]',
  wide: 'max-w-[var(--container-wide)]',
};

export function Container({ size = 'default', className, children, ...props }: ContainerProps) {
  return (
    <div
      className={cn('mx-auto w-full min-w-0 px-5 md:px-8 lg:px-10', sizeStyles[size], className)}
      {...props}
    >
      {children}
    </div>
  );
}
