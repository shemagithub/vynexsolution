import { DecoderText } from '~/components/decoder-text';
import { Divider } from '~/components/divider';
import { Heading } from '~/components/heading';
import { Section } from '~/components/section';
import { Text } from '~/components/text';
import { Transition } from '~/components/transition';
import { useState } from 'react';
import styles from './services-section.module.css';

export function ServicesSection({ id, sectionRef, visible, homeServices = [] }) {
  const [focused, setFocused] = useState(false);
  const titleId = `${id}-title`;

  return (
    <Section
      className={styles.services}
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
          <div className={styles.content}>
            <header className={styles.header}>
              <Divider notchWidth="64px" notchHeight="8px" collapsed={!isVisible} />
              <Heading
                className={styles.title}
                data-visible={isVisible}
                level={3}
                as="h2"
                id={titleId}
              >
                <DecoderText text="Our Services" start={isVisible} delay={300} />
              </Heading>
              <Text className={styles.subtitle} data-visible={isVisible} size="l" as="p">
                End-to-end solutions for web, mobile, IoT, and digital growth.
              </Text>
            </header>
            <div className={styles.grid}>
              {homeServices.map((service, index) => (
                <article
                  key={service.title}
                  className={styles.card}
                  data-visible={isVisible}
                  style={{ transitionDelay: `${300 + index * 100}ms` }}
                >
                  <span className={styles.icon} aria-hidden>
                    {service.icon}
                  </span>
                  <Heading level={4} as="h3">
                    {service.title}
                  </Heading>
                  <Text size="s" as="p">
                    {service.description}
                  </Text>
                </article>
              ))}
            </div>
          </div>
        )}
      </Transition>
    </Section>
  );
}
