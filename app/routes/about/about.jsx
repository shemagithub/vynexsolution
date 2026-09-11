import usesBackgroundPlaceholder from '~/assets/uses-background-placeholder.jpg';
import usesBackground from '~/assets/uses-background.mp4';
import { Footer } from '~/components/footer';
import { Link } from '~/components/link';
import { List, ListItem } from '~/components/list';
import { Table, TableBody, TableCell, TableHeadCell, TableRow } from '~/components/table';
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
import { pageMeta, baseMeta } from '~/utils/meta';
import { json } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { loadAboutPageData } from '~/utils/page-loaders';
import styles from './about.module.css';

export async function clientLoader() {
  return loadAboutPageData();
}

export const meta = ({ data }) => {
  const page = pageMeta('/about');
  if (!data?.page?.headerTitle && !data?.page?.headerDescription) {
    return page;
  }

  return baseMeta({
    title: data?.page?.headerTitle || 'About Us — Systems Design & Engineering',
    description:
      data?.page?.headerDescription ||
      'Learn about Vynex Solutions — website development, systems design, mobile apps, and smart systems in Rwanda.',
    pathname: '/about',
    keywords: [
      'systems design company',
      'web development agency Rwanda',
      'software engineers Kigali',
      'about Vynex Solutions',
    ],
  });
};

export const About = () => {
  const { page, team, technologies, values, siteConfig } = useLoaderData();
  return (
    <>
      <ProjectContainer className={styles.about}>
        <ProjectBackground
          src={usesBackground}
          placeholder={usesBackgroundPlaceholder}
          opacity={0.7}
        />
        <ProjectHeader title={page.headerTitle} description={page.headerDescription} />
        <ProjectSection padding="none" className={styles.section}>
          <ProjectSectionContent>
            <ProjectTextRow width="m">
              <ProjectSectionHeading>Our Story</ProjectSectionHeading>
              <ProjectSectionText as="div">
                <p>{page.story}</p>
              </ProjectSectionText>
            </ProjectTextRow>
          </ProjectSectionContent>
        </ProjectSection>
        <ProjectSection padding="none" className={styles.section}>
          <ProjectSectionContent>
            <ProjectTextRow width="m">
              <ProjectSectionHeading>Mission & Vision</ProjectSectionHeading>
              <ProjectSectionText as="div">
                <List>
                  <ListItem>
                    <strong>Mission:</strong> {page.mission}
                  </ListItem>
                  <ListItem>
                    <strong>Vision:</strong> {page.vision}
                  </ListItem>
                </List>
              </ProjectSectionText>
            </ProjectTextRow>
          </ProjectSectionContent>
        </ProjectSection>
        <ProjectSection padding="none" className={styles.section}>
          <ProjectSectionContent>
            <ProjectTextRow width="m">
              <ProjectSectionHeading>Our Team</ProjectSectionHeading>
              <ProjectSectionText as="div">
                <List>
                  {team.map(member => (
                    <ListItem key={member.name}>
                      <strong>{member.name}</strong> — {member.role}. {member.bio}
                    </ListItem>
                  ))}
                </List>
              </ProjectSectionText>
            </ProjectTextRow>
          </ProjectSectionContent>
        </ProjectSection>
        <ProjectSection padding="none" className={styles.section}>
          <ProjectSectionContent>
            <ProjectTextRow width="m">
              <ProjectSectionHeading>Our Values</ProjectSectionHeading>
              <ProjectSectionText as="div">
                <List>
                  {values.map(value => (
                    <ListItem key={value.title}>
                      <strong>{value.title}</strong> — {value.description}
                    </ListItem>
                  ))}
                </List>
              </ProjectSectionText>
            </ProjectTextRow>
          </ProjectSectionContent>
        </ProjectSection>
        <ProjectSection padding="none" className={styles.section}>
          <ProjectSectionContent>
            <ProjectTextRow stretch width="m">
              <ProjectSectionHeading>Technologies We Use</ProjectSectionHeading>
              <Table>
                <TableBody>
                  {technologies.map((tech, index) => (
                    <TableRow key={tech}>
                      <TableHeadCell>{String(index + 1).padStart(2, '0')}</TableHeadCell>
                      <TableCell>{tech}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ProjectTextRow>
          </ProjectSectionContent>
        </ProjectSection>
        <ProjectSection padding="none" className={styles.section}>
          <ProjectSectionContent>
            <ProjectTextRow width="m">
              <ProjectSectionHeading>Location</ProjectSectionHeading>
              <ProjectSectionText as="div">
                <p>
                  {siteConfig.location} —{' '}
                  <Link href="/contact">Get in touch</Link> to discuss your next project.
                </p>
              </ProjectSectionText>
            </ProjectTextRow>
          </ProjectSectionContent>
        </ProjectSection>
      </ProjectContainer>
      <Footer />
    </>
  );
};
