'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { ArrowRight, Check } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface NewsletterFormProps {
  /** `light` sits on the cream page, `dark` on the charcoal footer. */
  tone?: 'light' | 'dark';
}

export function NewsletterForm({ tone = 'light' }: NewsletterFormProps) {
  const t = useTranslations('home.newsletter');
  const { notify } = useToast();
  const [done, setDone] = useState(false);

  const schema = z.object({
    email: z.email({ message: t('invalid') }),
  });

  type Values = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    mode: 'onSubmit',
  });

  // No backend yet: the delay stands in for the request so the pending state
  // is visible, and nothing leaves the browser.
  async function onSubmit() {
    await new Promise((resolve) => setTimeout(resolve, 650));
    setDone(true);
    notify(t('success'));
    reset();
    setTimeout(() => setDone(false), 4000);
  }

  const dark = tone === 'dark';

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="w-full">
      <div
        className={
          'focus-within:border-accent flex items-center gap-2 rounded-full border p-1.5 transition-colors duration-200 ' +
          (dark ? 'border-bg/25 bg-bg/5' : 'border-border bg-bg')
        }
      >
        <label htmlFor={`newsletter-${tone}`} className="sr-only">
          {t('placeholder')}
        </label>

        <input
          id={`newsletter-${tone}`}
          type="email"
          autoComplete="email"
          placeholder={t('placeholder')}
          aria-invalid={errors.email ? 'true' : 'false'}
          aria-describedby={errors.email ? `newsletter-${tone}-error` : undefined}
          className={
            'placeholder:text-text-secondary/70 min-w-0 flex-1 bg-transparent px-4 py-2 text-sm outline-none ' +
            (dark ? 'text-bg placeholder:text-bg/45' : 'text-text-primary')
          }
          {...register('email')}
        />

        <button
          type="submit"
          disabled={isSubmitting || done}
          aria-label={t('cta')}
          className={
            'ease-soft inline-flex size-9 shrink-0 items-center justify-center rounded-full transition-all duration-200 disabled:opacity-60 ' +
            (done
              ? 'bg-success text-bg'
              : 'bg-accent-hover text-bg hover:bg-accent-deep hover:shadow-lift active:scale-95')
          }
        >
          {done ? (
            <Check className="size-4" strokeWidth={2.5} />
          ) : (
            <ArrowRight
              className={
                'size-4 transition-transform duration-200 ' +
                (isSubmitting ? 'translate-x-0.5 animate-pulse' : '')
              }
            />
          )}
        </button>
      </div>

      {errors.email && (
        <p
          id={`newsletter-${tone}-error`}
          role="alert"
          className={'mt-2 px-4 text-xs ' + (dark ? 'text-bg/80' : 'text-error')}
        >
          {errors.email.message}
        </p>
      )}

      <p
        className={'mt-2.5 px-4 text-xs ' + (dark ? 'text-bg/50' : 'text-text-secondary')}
      >
        {t('legal')}
      </p>
    </form>
  );
}
