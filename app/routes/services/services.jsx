import usesBackgroundPlaceholder from '~/assets/uses-background-placeholder.jpg';
import usesBackground from '~/assets/uses-background.mp4';
import { Button } from '~/components/button';
import { Footer } from '~/components/footer';
import { Heading } from '~/components/heading';
import { List, ListItem } from '~/components/list';
import { Text } from '~/components/text';
import {
  ProjectBackground,
  ProjectContainer,
  ProjectHeader,
  ProjectSection,
  ProjectSectionContent,
  ProjectSectionHeading,
  ProjectSectionText,
  ProjectTextRow,
} from '~/layouts/project';
import { baseMeta } from '~/utils/meta';
import config from '~/config.json';
import { useLoaderData } from '@remix-run/react';
import { loadServicesPageData } from '~/utils/page-loaders';
import styles from './services.module.css';

export async function clientLoader() {
  return loadServicesPageData();
}

clientLoader.hydrate = true;

export const meta = () => {
  return baseMeta({
    title: 'Services',
    description: `${config.name} offers software development, mobile apps, IoT systems, and digital services.`,
  });
};

export const Services = () => {
  const { serviceCategories = [], homeServices = [] } = useLoaderData();
  const hasCategories = serviceCategories.length > 0;
  const hasServices = homeServices.length > 0;

  return (
    <>
      <ProjectContainer className={styles.services}>
        <ProjectBackground
          src={usesBackground}
          placeholder={usesBackgroundPlaceholder}
          opacity={0.7}
        />
        <ProjectHeader
          title="Our Services"
          description="From web and mobile development to IoT systems and digital marketing — we deliver end-to-end solutions tailored to your business."
          linkLabel="Request a quote"
          url="/quote"
        />

        {hasServices && (
          <ProjectSection padding="none" className={styles.section}>
            <ProjectSectionContent width="xl">
              <div className={styles.grid}>
                {homeServices.map(service => (
                  <article key={service.id} className={styles.card}>
                    <span className={styles.icon} aria-hidden>
                      {service.icon}
                    </span>
                    <Heading level={4} as="h2" className={styles.cardTitle}>
                      {service.title}
                    </Heading>
                    {service.description ? (
                      <Text size="s" as="p" className={styles.cardText}>
                        {service.description}
                      </Text>
                    ) : null}
                  </article>
                ))}
              </div>
            </ProjectSectionContent>
          </ProjectSection>
        )}

        {hasCategories &&
          serviceCategories.map(category => (
            <ProjectSection key={category.id} padding="none" className={styles.section}>
              <ProjectSectionContent>
                <ProjectTextRow width="m">
                  <ProjectSectionHeading>{category.title}</ProjectSectionHeading>
                  <ProjectSectionText as="div">
                    <List>
                      {category.items.map(item => (
                        <ListItem key={item}>{item}</ListItem>
                      ))}
                    </List>
                  </ProjectSectionText>
                </ProjectTextRow>
              </ProjectSectionContent>
            </ProjectSection>
          ))}

        {!hasServices && !hasCategories && (
          <ProjectSection padding="none" className={styles.section}>
            <ProjectSectionContent>
              <ProjectTextRow width="m">
                <Text size="l" as="p">
                  Services will appear here once published.
                </Text>
              </ProjectTextRow>
            </ProjectSectionContent>
          </ProjectSection>
        )}

        <ProjectSection padding="none" className={styles.section}>
          <ProjectSectionContent>
            <ProjectTextRow width="m">
              <Button href="/quote" icon="send" iconHoverShift>
                Get a quote
              </Button>
            </ProjectTextRow>
          </ProjectSectionContent>
        </ProjectSection>
      </ProjectContainer>
      <Footer />
    </>
  );
};
