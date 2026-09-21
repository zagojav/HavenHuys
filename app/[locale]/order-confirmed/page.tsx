import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ArrowRight, Clock, PackageCheck } from 'lucide-react';
import type Stripe from 'stripe';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { Reveal } from '@/components/ui/Reveal';
import { buttonClasses } from '@/components/ui/Button';
import { ClearBagOnMount } from '@/components/ClearBagOnMount';
import { formatPrice } from '@/lib/format';
import { DELIVERY_DAYS } from '@/lib/shipping';
import { stripe } from '@/lib/stripe';

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ session_id?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'orderConfirmed' });

  return {
    title: t('title'),
    description: t('metaDescription'),
    robots: { index: false, follow: false },
  };
}

export default async function OrderConfirmedPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  const { session_id: sessionId } = await searchParams;
  const t = await getTranslations('orderConfirmed');

  const session = sessionId ? await retrieveSession(sessionId) : null;

  // The webhook is what actually ships the order. This page only reports what
  // Stripe already knows, so a customer who never reaches it loses nothing.
  const paid = session?.payment_status === 'paid';
  const awaitingPayment = session?.payment_status === 'unpaid';

  return (
    <div className="shell pt-12 pb-8 sm:pt-16">
      {session && <ClearBagOnMount />}

      <Reveal as="header" className="max-w-2xl">
        <span className="bg-surface text-accent inline-flex size-14 items-center justify-center rounded-full">
          {awaitingPayment ? (
            <Clock className="size-6" strokeWidth={1.4} />
          ) : (
            <PackageCheck className="size-6" strokeWidth={1.4} />
          )}
        </span>

        <h1 className="font-display mt-6 text-4xl leading-tight sm:text-5xl">
          {awaitingPayment ? t('pending.title') : t('title')}
        </h1>

        <p className="text-text-secondary mt-4 text-[0.9375rem] leading-relaxed">
          {awaitingPayment
            ? t('pending.body')
            : session?.customer_details?.email
              ? t('body', { email: session.customer_details.email })
              : t('bodyNoEmail')}
        </p>
      </Reveal>

      {session && (
        <Reveal className="mt-10 max-w-md">
          <dl className="divide-border border-border divide-y border-y">
            {paid && session.amount_total !== null && (
              <Row
                label={t('totalLabel')}
                value={formatPrice(session.amount_total, locale as Locale)}
              />
            )}
            <Row
              label={t('deliveryLabel')}
              value={t('deliveryValue', {
                min: DELIVERY_DAYS.min,
                max: DELIVERY_DAYS.max,
              })}
            />
            <Row label={t('reference')} value={session.id} />
          </dl>
        </Reveal>
      )}

      <Reveal className="mt-12">
        <Link href="/products" className={buttonClasses('primary', 'lg')}>
          {t('cta')}
          <ArrowRight className="size-4" />
        </Link>

        <p className="text-text-secondary mt-6 text-sm">
          {t('help')}{' '}
          <Link href="/contact" className="link-underline text-accent-hover">
            {t('helpLink')}
          </Link>
        </p>
      </Reveal>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 py-3.5">
      <dt className="text-text-primary text-sm">{label}</dt>
      <dd className="text-text-secondary text-sm break-all">{value}</dd>
    </div>
  );
}

/**
 * A failed lookup is not an error the customer needs to see: the payment has
 * already happened, and the confirmation stands on its own without the detail
 * rows.
 */
async function retrieveSession(id: string): Promise<Stripe.Checkout.Session | null> {
  try {
    return await stripe().checkout.sessions.retrieve(id);
  } catch (error) {
    console.error(`[order-confirmed] could not retrieve ${id}`, error);
    return null;
  }
}
