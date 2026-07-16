import { DecoderText } from '~/components/decoder-text';
import { Divider } from '~/components/divider';
import { Heading } from '~/components/heading';
import { Section } from '~/components/section';
import { Text } from '~/components/text';
import { Transition } from '~/components/transition';
import { useState } from 'react';
import styles from './testimonials.module.css';

export function Testimonials({ id, sectionRef, visible, testimonials = [] }) {
  const [focused, setFocused] = useState(false);
  const titleId = `${id}-title`;

  return (
    <Section
      className={styles.testimonials}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      as="section"
      id={id}
      ref={sectionRef}
      aria-labelledby={titleId}
      tabIndex={-1}
      data-theme="dark"
      data-invert
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
                <DecoderText text="Client Testimonials" start={isVisible} delay={300} />
              </Heading>
            </header>
            <div className={styles.grid}>
              {testimonials.map((item, index) => (
                <blockquote
                  key={item.name}
                  className={styles.card}
                  data-visible={isVisible}
                  style={{ transitionDelay: `${400 + index * 150}ms` }}
                >
                  <div className={styles.rating} aria-label={`${item.rating} out of 5 stars`}>
                    {'★'.repeat(item.rating)}
                  </div>
                  <Text size="l" as="p" className={styles.quote}>
                    &ldquo;{item.quote}&rdquo;
                  </Text>
                  <footer>
                    <Text size="s" as="cite" className={styles.name}>
                      {item.name}
                    </Text>
                    <Text secondary size="s" as="p">
                      {item.role}
                    </Text>
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        )}
      </Transition>
    </Section>
  );
}
