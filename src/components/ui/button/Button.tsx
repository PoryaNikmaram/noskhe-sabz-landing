import { cn } from '@/lib/cn';

import type { ButtonProps, ButtonSize, ButtonVariant } from './button.types';

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-white hover:bg-primary-hover active:bg-primary-active disabled:bg-brand-300',
  secondary:
    'bg-surface-muted text-foreground hover:bg-brand-50 active:bg-brand-100 disabled:bg-surface-muted disabled:text-foreground-subtle',
  outline:
    'border border-border bg-transparent text-foreground hover:bg-surface-muted active:bg-brand-50 disabled:text-foreground-subtle',
  ghost:
    'bg-transparent text-foreground hover:bg-surface-muted active:bg-brand-50 disabled:text-foreground-subtle',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 gap-1.5 px-3 text-sm',
  md: 'h-10 gap-2 px-4 text-base',
  lg: 'h-12 gap-2.5 px-6 text-lg',
};

const spinnerSizes: Record<ButtonSize, string> = {
  sm: 'size-3.5',
  md: 'size-4',
  lg: 'size-5',
};

function ButtonSpinner({ size }: { size: ButtonSize }) {
  return (
    <svg
      className={cn('animate-spin', spinnerSizes[size])}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={cn(
        'relative inline-flex items-center justify-center rounded-md font-medium transition-colors duration-normal ease-standard',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
        'disabled:pointer-events-none disabled:cursor-not-allowed',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    >
      <span className={cn('inline-flex items-center justify-center', loading && 'invisible')}>
        {children}
      </span>
      {loading ? (
        <span
          className="pointer-events-none absolute inset-0 inline-flex items-center justify-center"
          aria-hidden="true"
        >
          <ButtonSpinner size={size} />
        </span>
      ) : null}
    </button>
  );
}
