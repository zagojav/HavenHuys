'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { Check, Undo2 } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';

export interface CancellationRequest {
  orderNumber: string;
  email: string;
  /** ISO timestamp — the withdrawal period is counted from this. */
  requestedAt: string;
}

/**
 * The one place a cancellation leaves the browser.
 *
 * There is no mail service wired up yet, so this composes the message and the
 * delay stands in for the request, the same way ContactForm and NewsletterForm
 * do. When Resend or Formspree is connected, POST `body` from here and throw on
 * failure — the caller already surfaces a thrown error to the customer, and
 * everything the email needs is in `request`.
 */
async function sendCancellation(request: CancellationRequest): Promise<void> {
  const body = [
    `Order number: ${request.orderNumber}`,
    `Email: ${request.email}`,
    `Requested at: ${request.requestedAt}`,
  ].join('\n');

  await new Promise((resolve) => setTimeout(resolve, 750));

  if (process.env.NODE_ENV !== 'production') {
    console.info(`[haven-huis] cancellation captured, not sent:\n${body}`);
  }
}

export function CancelOrderForm() {
  const t = useTranslations('cancelOrder');
  const { notify } = useToast();
  const [sent, setSent] = useState(false);

  const schema = z.object({
    orderNumber: z
      .string()
      .trim()
      .min(4, { message: t('errors.orderNumberMin') }),
    email: z.email({ message: t('errors.emailInvalid') }),
    confirm: z
      .boolean()
      .refine((value) => value === true, { message: t('errors.confirmRequired') }),
  });

  type Values = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: { orderNumber: '', email: '', confirm: false },
  });

  async function onSubmit(values: Values) {
    await sendCancellation({
      orderNumber: values.orderNumber,
      email: values.email,
      requestedAt: new Date().toISOString(),
    });

    setSent(true);
    notify(t('form.successToast'));
    reset();
  }

  if (sent) {
    return (
      <div className="bg-surface rounded-2xl px-6 py-12 text-center">
        <span className="bg-success text-bg inline-flex size-12 items-center justify-center rounded-full">
          <Check className="size-5" strokeWidth={2.5} />
        </span>
        <p className="text-text-primary mx-auto mt-5 max-w-sm text-[0.9375rem] leading-relaxed">
          {t('form.success')}
        </p>
        <Button
          variant="secondary"
          size="md"
          className="mt-7"
          onClick={() => setSent(false)}
        >
          {t('form.again')}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="orderNumber"
          label={t('form.orderNumber')}
          placeholder={t('form.orderNumberPlaceholder')}
          hint={t('form.orderNumberHelp')}
          autoComplete="off"
          error={errors.orderNumber?.message}
          {...register('orderNumber')}
        />

        <Field
          id="email"
          type="email"
          label={t('form.email')}
          placeholder={t('form.emailPlaceholder')}
          hint={t('form.emailHelp')}
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
      </div>

      <div>
        <label
          htmlFor="confirm"
          className="border-border bg-bg hover:border-text-secondary/40 flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3.5 transition-colors duration-200"
        >
          <input
            id="confirm"
            type="checkbox"
            aria-invalid={errors.confirm ? 'true' : 'false'}
            aria-describedby={errors.confirm ? 'confirm-error' : undefined}
            className="accent-accent-hover mt-0.5 size-4 shrink-0 cursor-pointer"
            {...register('confirm')}
          />
          <span className="text-text-primary text-sm leading-relaxed">
            {t('form.confirm')}
          </span>
        </label>
        {errors.confirm && (
          <p id="confirm-error" role="alert" className="text-error mt-2 text-xs">
            {errors.confirm.message}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4 pt-1">
        <Button type="submit" variant="primary" size="lg" disabled={isSubmitting}>
          {isSubmitting ? (
            t('form.sending')
          ) : (
            <>
              {t('form.submit')}
              <Undo2 className="size-4" strokeWidth={1.8} />
            </>
          )}
        </Button>

        <p className="text-text-secondary text-xs">{t('note')}</p>
      </div>
    </form>
  );
}

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  hint?: string;
  error?: string;
}

/**
 * react-hook-form's `register` spreads a ref plus change handlers, so this has
 * to forward everything it is given straight onto the input.
 */
function Field({ id, label, hint, error, ...rest }: FieldProps) {
  // The hint gives way to the error, so it is only described when it renders —
  // otherwise aria-describedby points at an element that is not on the page.
  const showHint = Boolean(hint) && !error;
  const hintId = showHint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={[errorId, hintId].filter(Boolean).join(' ') || undefined}
        className="border-border bg-bg placeholder:text-text-secondary/60 hover:border-text-secondary/40 focus:border-accent aria-invalid:border-error h-12 w-full rounded-xl border px-4 text-sm transition-colors duration-200 outline-none"
        {...rest}
      />
      {error && (
        <p id={errorId} role="alert" className="text-error mt-2 text-xs">
          {error}
        </p>
      )}
      {showHint && (
        <p id={hintId} className="text-text-secondary mt-2 text-xs">
          {hint}
        </p>
      )}
    </div>
  );
}
