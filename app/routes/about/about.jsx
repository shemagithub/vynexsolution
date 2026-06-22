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
import { team, technologies, values } from '~/data/content';
import { baseMeta } from '~/utils/meta';
import config from '~/config.json';
import styles from './about.module.css';

export const meta = () => {
  return baseMeta({
    title: 'About Us',
    description: `Learn about ${config.name} — our mission, team, values, and the technologies we use to build smart systems.`,
  });
};

export const About = () => {
  return (
    <>
      <ProjectContainer className={styles.about}>
        <ProjectBackground
          src={usesBackground}
          placeholder={usesBackgroundPlaceholder}
          opacity={0.7}
        />
        <ProjectHeader
          title="About EMBEDIXe"
          description="We exist to help businesses in Rwanda and beyond leverage technology — from web and mobile apps to IoT and smart automation systems."
        />
        <ProjectSection padding="none" className={styles.section}>
          <ProjectSectionContent>
            <ProjectTextRow width="m">
              <ProjectSectionHeading>Our Story</ProjectSectionHeading>
              <ProjectSectionText as="div">
                <p>
                  EMBEDIXe was founded with a simple belief: every business deserves access
                  to world-class technology. Based in Kigali, Rwanda, we started as a
                  small team passionate about embedded systems and software development.
                  Today, we deliver complete digital solutions — from responsive websites
                  to IoT-powered smart systems.
                </p>
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
                    <strong>Mission:</strong> Empower businesses with innovative, reliable
                    technology solutions that drive growth and efficiency.
                  </ListItem>
                  <ListItem>
                    <strong>Vision:</strong> Become East Africa&apos;s leading tech agency
                    for web, mobile, and IoT solutions.
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
                  {config.location} —{' '}
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
