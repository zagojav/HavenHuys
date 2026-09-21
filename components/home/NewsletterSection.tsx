import { getTranslations } from 'next-intl/server';
import { Reveal } from '@/components/ui/Reveal';
import { NewsletterForm } from '@/components/NewsletterForm';

export async function NewsletterSection() {
  const t = await getTranslations('home.newsletter');

  return (
    <section className="shell pb-20 sm:pb-28">
      <Reveal className="bg-surface rounded-3xl px-6 py-14 text-center sm:px-12 sm:py-20">
        <h2 className="font-display text-3xl sm:text-4xl">{t('title')}</h2>
        <p className="text-text-secondary mx-auto mt-3 max-w-md text-sm leading-relaxed">
          {t('body')}
        </p>

        <div className="mx-auto mt-8 max-w-md text-left">
          <NewsletterForm />
        </div>
      </Reveal>
    </section>
  );
}
