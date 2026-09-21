import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'dark';
export type ButtonSize = 'sm' | 'md' | 'lg';

const base =
  'relative inline-flex items-center justify-center gap-2 rounded-full font-medium ' +
  'whitespace-nowrap transition-[transform,box-shadow,background-color,border-color,color] ' +
  'duration-200 ease-soft select-none ' +
  'disabled:pointer-events-none disabled:opacity-45 disabled:shadow-none disabled:translate-y-0 ' +
  'aria-disabled:pointer-events-none aria-disabled:opacity-45';

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-accent-hover text-bg shadow-[0_1px_2px_rgb(43_38_34/0.10)] ' +
    'hover:bg-accent-deep hover:-translate-y-0.5 hover:shadow-lift ' +
    'active:translate-y-0 active:shadow-press',
  secondary:
    'border border-border bg-transparent text-text-primary ' +
    'hover:border-accent hover:text-accent-hover hover:-translate-y-0.5 hover:shadow-lift ' +
    'active:translate-y-0 active:shadow-press',
  ghost:
    'bg-transparent text-text-secondary hover:bg-surface hover:text-text-primary ' +
    'active:scale-[0.98]',
  dark:
    'bg-charcoal text-bg hover:bg-text-primary hover:-translate-y-0.5 hover:shadow-lift ' +
    'active:translate-y-0 active:shadow-press',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-[0.8125rem]',
  md: 'h-11 px-6 text-sm',
  lg: 'h-13 px-8 text-[0.9375rem]',
};

export function buttonClasses(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  className = '',
): string {
  return [base, variants[variant], sizes[size], className].filter(Boolean).join(' ');
}

type ButtonProps<T extends ElementType> = {
  as?: T;
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'children' | 'className'>;

/**
 * Shared button surface. Renders a `<button>` by default; pass `as={Link}` to
 * keep the same visual treatment on navigation.
 */
export function Button<T extends ElementType = 'button'>({
  as,
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...rest
}: ButtonProps<T>) {
  const Component = (as ?? 'button') as ElementType;

  return (
    <Component className={buttonClasses(variant, size, className)} {...rest}>
      {children}
    </Component>
  );
}
