import { Button } from '~/components/button';
import { DecoderText } from '~/components/decoder-text';
import { Heading } from '~/components/heading';
import { Section } from '~/components/section';
import { Text } from '~/components/text';
import { Transition } from '~/components/transition';
import { useLanguage } from '~/components/language-provider/language-provider';
import { useState } from 'react';
import styles from './cta-section.module.css';

export function CtaSection({ id, sectionRef, visible }) {
  const [focused, setFocused] = useState(false);
  const { t } = useLanguage();
  const titleId = `${id}-title`;

  return (
    <Section
      className={styles.cta}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      as="section"
      id={id}
      ref={sectionRef}
      aria-labelledby={titleId}
      tabIndex={-1}
    >
      <Transition in={visible || focused}>
        {({ visible: isVisible }) => (
          <div className={styles.content} data-visible={isVisible}>
            <Heading className={styles.title} level={3} as="h2" id={titleId}>
              <DecoderText text={t.cta.title} start={isVisible} delay={300} />
            </Heading>
            <Text className={styles.description} size="l" as="p">
              {t.cta.description}
            </Text>
            <div className={styles.buttons}>
              <Button href="/quote" icon="send" iconHoverShift>
                {t.cta.quote}
              </Button>
              <Button secondary href="/contact" icon="arrow-right" iconEnd iconHoverShift>
                {t.cta.contact}
              </Button>
            </div>
          </div>
        )}
      </Transition>
    </Section>
  );
}
