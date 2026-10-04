import { Heading } from '~/components/heading';
import { Section } from '~/components/section';
import { useTheme } from '~/components/theme-provider';
import { tokens } from '~/components/theme-provider/theme';
import { Transition } from '~/components/transition';
import { VisuallyHidden } from '~/components/visually-hidden';
import { Link as RouterLink } from '@remix-run/react';
import { useInterval, usePrevious, useScrollToHash } from '~/hooks';
import { Suspense, lazy, useEffect, useState } from 'react';
import { cssProps } from '~/utils/style';
import { useSiteConfig } from '~/components/site-config-provider';
import styles from './intro.module.css';

const SPHERE_QUERY = '(min-width: 1041px) and (prefers-reduced-motion: no-preference)';

const DisplacementSphere = lazy(() =>
  import('./displacement-sphere').then(module => ({ default: module.DisplacementSphere }))
);

export function Intro({ id, sectionRef, scrollIndicatorHidden, ...rest }) {
  const { theme } = useTheme();
  const siteConfig = useSiteConfig();
  const [compact, setCompact] = useState(true);
  const { name, role, disciplines } = siteConfig;
  const [disciplineIndex, setDisciplineIndex] = useState(0);
  const prevTheme = usePrevious(theme);
  const introLabel = [disciplines.slice(0, -1).join(', '), disciplines.slice(-1)[0]].join(
    ', and '
  );
  const currentDiscipline = disciplines.find((item, index) => index === disciplineIndex);
  const titleId = `${id}-title`;
  const scrollToHash = useScrollToHash();
  const [showSphere, setShowSphere] = useState(false);

  useEffect(() => {
    const compactQuery = window.matchMedia('(max-width: 1040px)');
    const sphereQuery = window.matchMedia(SPHERE_QUERY);
    const updateCompact = () => setCompact(compactQuery.matches);
    const updateSphere = () => setShowSphere(sphereQuery.matches);
    updateCompact();
    updateSphere();
    compactQuery.addEventListener('change', updateCompact);
    sphereQuery.addEventListener('change', updateSphere);
    return () => {
      compactQuery.removeEventListener('change', updateCompact);
      sphereQuery.removeEventListener('change', updateSphere);
    };
  }, []);

  useInterval(
    () => {
      const index = (disciplineIndex + 1) % disciplines.length;
      setDisciplineIndex(index);
    },
    compact ? null : 5000,
    theme
  );

  useEffect(() => {
    if (prevTheme && prevTheme !== theme) {
      setDisciplineIndex(0);
    }
  }, [theme, prevTheme]);

  const handleScrollClick = event => {
    event.preventDefault();
    scrollToHash(event.currentTarget.href);
  };

  return (
    <Section
      className={styles.intro}
      as="section"
      ref={sectionRef}
      id={id}
      aria-labelledby={titleId}
      tabIndex={-1}
      {...rest}
    >
      <Transition in key={theme} timeout={compact ? 400 : 3000}>
        {({ visible, status }) => (
          <>
            {showSphere && (
              <Suspense>
                <DisplacementSphere />
              </Suspense>
            )}
            <header className={styles.text}>
              <h1 className={styles.name} data-visible={visible} id={titleId}>
                {name}
              </h1>
              {compact ? (
                <Heading level={3} as="h2" className={styles.title}>
                  <span className={styles.staticTitle}>
                    {role} {introLabel}
                  </span>
                </Heading>
              ) : (
                <Heading level={0} as="h2" className={styles.title}>
                  <VisuallyHidden className={styles.label}>
                    {`${role} + ${introLabel}`}
                  </VisuallyHidden>
                  <span aria-hidden className={styles.row}>
                    <span
                      className={styles.word}
                      data-status={status}
                      style={cssProps({ delay: tokens.base.durationXS })}
                    >
                      {role}
                    </span>
                    <span className={styles.line} data-status={status} />
                  </span>
                  <div className={styles.row}>
                    {disciplines.map(item => (
                      <Transition
                        unmount
                        in={item === currentDiscipline}
                        timeout={{ enter: 3000, exit: 2000 }}
                        key={item}
                      >
                        {({ status, nodeRef }) => (
                          <span
                            aria-hidden
                            ref={nodeRef}
                            className={styles.word}
                            data-plus={true}
                            data-status={status}
                            style={cssProps({ delay: tokens.base.durationL })}
                          >
                            {item}
                          </span>
                        )}
                      </Transition>
                    ))}
                  </div>
                </Heading>
              )}
            </header>
            <RouterLink
              to="/#services"
              className={styles.scrollIndicator}
              data-status={status}
              data-hidden={scrollIndicatorHidden}
              onClick={handleScrollClick}
            >
              <VisuallyHidden>Scroll to services</VisuallyHidden>
            </RouterLink>
            <RouterLink
              to="/#services"
              className={styles.mobileScrollIndicator}
              data-status={status}
              data-hidden={scrollIndicatorHidden}
              onClick={handleScrollClick}
            >
              <VisuallyHidden>Scroll to services</VisuallyHidden>
              <svg
                aria-hidden
                stroke="currentColor"
                width="43"
                height="15"
                viewBox="0 0 43 15"
              >
                <path d="M1 1l20.5 12L42 1" strokeWidth="2" fill="none" />
              </svg>
            </RouterLink>
          </>
        )}
      </Transition>
    </Section>
  );
}
