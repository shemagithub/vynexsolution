import usesBackgroundPlaceholder from '~/assets/uses-background-placeholder.jpg';
import usesBackground from '~/assets/uses-background.mp4';
import { Button } from '~/components/button';
import { Footer } from '~/components/footer';
import { List, ListItem } from '~/components/list';
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
import { serviceCategories } from '~/data/content';
import { baseMeta } from '~/utils/meta';
import config from '~/config.json';
import styles from './services.module.css';

export const meta = () => {
  return baseMeta({
    title: 'Services',
    description: `${config.name} offers software development, mobile apps, IoT systems, and digital services.`,
  });
};

export const Services = () => {
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
        {serviceCategories.map(category => (
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
