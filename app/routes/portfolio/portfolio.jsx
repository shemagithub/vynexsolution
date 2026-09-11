import { Button } from '~/components/button';
import { DecoderText } from '~/components/decoder-text';
import { Divider } from '~/components/divider';
import { Footer } from '~/components/footer';
import { Heading } from '~/components/heading';
import { Section } from '~/components/section';
import {
  SegmentedControl,
  SegmentedControlOption,
} from '~/components/segmented-control';
import { Text } from '~/components/text';
import { pageMeta } from '~/utils/meta';
import { Link as RouterLink, useLoaderData } from '@remix-run/react';
import { json } from '@remix-run/cloudflare';
import { loadPortfolioPageData } from '~/utils/page-loaders';
import { useState } from 'react';
import styles from './portfolio.module.css';

export async function clientLoader() {
  return loadPortfolioPageData();
}

export const meta = () => pageMeta('/portfolio');

export const Portfolio = () => {
  const { projects, filterCategories } = useLoaderData();
  const [filterIndex, setFilterIndex] = useState(0);
  const activeFilter = filterCategories[filterIndex].value;

  const filtered =
    activeFilter === 'all'
      ? projects
      : projects.filter(p => p.category === activeFilter);

  return (
    <article className={styles.portfolio}>
      <Section className={styles.header}>
        <Heading level={3} as="h1">
          <DecoderText text="Our Portfolio" />
        </Heading>
        <Text size="l" as="p" className={styles.subtitle}>
          Website development, systems design, mobile apps, and IoT projects — visit live sites or
          explore interactive demos.
        </Text>
        <SegmentedControl
          className={styles.filter}
          currentIndex={filterIndex}
          onChange={setFilterIndex}
          label="Filter projects by category"
        >
          {filterCategories.map(cat => (
            <SegmentedControlOption key={cat.value}>{cat.label}</SegmentedControlOption>
          ))}
        </SegmentedControl>
      </Section>
      <Section className={styles.list}>
        <div className={styles.grid} key={activeFilter}>
          {filtered.map((project, index) => (
            <article
              key={project.id}
              id={project.id}
              className={styles.card}
              style={{ transitionDelay: `${index * 80}ms` }}
            >
              <div aria-hidden className={styles.meta}>
                <Divider notchWidth="48px" notchHeight="6px" />
                <Text size="s" className={styles.category}>
                  {project.category.toUpperCase()}
                </Text>
              </div>
              <Heading level={4} as="h2">
                {project.title}
              </Heading>
              <Text size="s" as="p" className={styles.problem}>
                <strong>Problem:</strong> {project.problem}
              </Text>
              <Text size="s" as="p">
                {project.description}
              </Text>
              <Text size="s" as="p" className={styles.tech}>
                {project.technologies.join(' · ')}
              </Text>
              <div className={styles.links}>
                <Button
                  secondary
                  iconHoverShift
                  href={`/projects/${project.slug}`}
                  icon="arrow-right"
                  iconEnd
                >
                  View project
                </Button>
                <Button href={project.liveLink} icon="link">
                  Visit site
                </Button>
                <RouterLink
                  to={`/projects/${project.slug}?view=demo`}
                  className={styles.demoLink}
                >
                  Live demo
                </RouterLink>
              </div>
            </article>
          ))}
        </div>
      </Section>
      <Footer />
    </article>
  );
};
