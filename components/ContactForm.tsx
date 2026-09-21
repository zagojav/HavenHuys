'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { Check, Send } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';

export function ContactForm() {
  const t = useTranslations('contact');
  const { notify } = useToast();
  const [sent, setSent] = useState(false);

  const schema = z.object({
    name: z
      .string()
      .trim()
      .min(2, { message: t('errors.nameMin') }),
    email: z.email({ message: t('errors.emailInvalid') }),
    subject: z
      .string()
      .trim()
      .min(3, { message: t('errors.subjectMin') }),
    message: z
      .string()
      .trim()
      .min(20, { message: t('errors.messageMin') })
      .max(1000, { message: t('errors.messageMax') }),
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
  });

  // Validation only — there is no mail service wired up, so nothing is sent.
  async function onSubmit() {
    await new Promise((resolve) => setTimeout(resolve, 750));
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
          {t('form.submit')}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="name"
          label={t('form.name')}
          placeholder={t('form.namePlaceholder')}
          autoComplete="name"
          error={errors.name?.message}
          {...register('name')}
        />

        <Field
          id="email"
          type="email"
          label={t('form.email')}
          placeholder={t('form.emailPlaceholder')}
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
      </div>

      <Field
        id="subject"
        label={t('form.subject')}
        placeholder={t('form.subjectPlaceholder')}
        error={errors.subject?.message}
        {...register('subject')}
      />

      <div>
        <label htmlFor="message" className="mb-2 block text-sm font-medium">
          {t('form.message')}
        </label>
        <textarea
          id="message"
          rows={6}
          placeholder={t('form.messagePlaceholder')}
          aria-invalid={errors.message ? 'true' : 'false'}
          aria-describedby={errors.message ? 'message-error' : undefined}
          className="border-border bg-bg placeholder:text-text-secondary/60 hover:border-text-secondary/40 focus:border-accent aria-invalid:border-error w-full resize-y rounded-xl border px-4 py-3 text-sm transition-colors duration-200 outline-none"
          {...register('message')}
        />
        {errors.message && (
          <p id="message-error" role="alert" className="text-error mt-2 text-xs">
            {errors.message.message}
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
              <Send className="size-4" strokeWidth={1.8} />
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
  error?: string;
}

/**
 * react-hook-form's `register` spreads a ref plus change handlers, so this has
 * to forward everything it is given straight onto the input.
 */
function Field({ id, label, error, ...rest }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${id}-error` : undefined}
        className="border-border bg-bg placeholder:text-text-secondary/60 hover:border-text-secondary/40 focus:border-accent aria-invalid:border-error h-12 w-full rounded-xl border px-4 text-sm transition-colors duration-200 outline-none"
        {...rest}
      />
      {error && (
        <p id={`${id}-error`} role="alert" className="text-error mt-2 text-xs">
          {error}
        </p>
      )}
    </div>
  );
}
