import { Button } from '~/components/button';
import { DecoderText } from '~/components/decoder-text';
import { Footer } from '~/components/footer';
import { Heading } from '~/components/heading';
import { List, ListItem } from '~/components/list';
import { Section } from '~/components/section';
import { Text } from '~/components/text';
import { pricingPackages } from '~/data/content';
import { baseMeta } from '~/utils/meta';
import config from '~/config.json';
import styles from './pricing.module.css';

export const meta = () => {
  return baseMeta({
    title: 'Pricing',
    description: `Transparent pricing packages from ${config.name} — websites, business systems, and IoT solutions.`,
  });
};

export const Pricing = () => {
  return (
    <article className={styles.pricing}>
      <Section className={styles.header}>
        <Heading level={3} as="h1">
          <DecoderText text="Pricing & Packages" />
        </Heading>
        <Text size="l" as="p" className={styles.subtitle}>
          Flexible packages to fit your budget. Every project is unique — contact us for a
          custom quote.
        </Text>
      </Section>
      <Section className={styles.grid}>
        {pricingPackages.map(pkg => (
          <article key={pkg.name} className={styles.card}>
            <Heading level={4} as="h2">
              {pkg.name}
            </Heading>
            <Text size="l" as="p" className={styles.price}>
              {pkg.price}
            </Text>
            <Text size="s" as="p">
              {pkg.description}
            </Text>
            <List className={styles.features}>
              {pkg.features.map(feature => (
                <ListItem key={feature}>{feature}</ListItem>
              ))}
            </List>
            <Button secondary href="/quote" icon="send" iconHoverShift>
              Get a quote
            </Button>
          </article>
        ))}
      </Section>
      <Footer />
    </article>
  );
};
