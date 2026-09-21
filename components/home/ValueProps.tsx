import { getTranslations } from 'next-intl/server';
import { PackageCheck, Sprout, Undo2 } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';

const ITEMS = [
  { key: 'shipping', Icon: PackageCheck },
  { key: 'quality', Icon: Sprout },
  { key: 'returns', Icon: Undo2 },
] as const;

export async function ValueProps() {
  const t = await getTranslations('home.values');

  return (
    <section className="shell py-20 sm:py-24">
      <ul className="grid gap-10 sm:grid-cols-3 sm:gap-8">
        {ITEMS.map(({ key, Icon }, index) => (
          <Reveal as="li" key={key} delay={index * 0.08}>
            <span className="bg-surface text-accent inline-flex size-11 items-center justify-center rounded-full">
              <Icon className="size-5" strokeWidth={1.5} />
            </span>
            <h3 className="font-display mt-5 text-xl">{t(`${key}.title`)}</h3>
            <p className="text-text-secondary mt-2 max-w-xs text-sm leading-relaxed">
              {t(`${key}.body`)}
            </p>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
