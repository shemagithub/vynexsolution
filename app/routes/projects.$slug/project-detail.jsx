import { Button } from '~/components/button';
import { Footer } from '~/components/footer';
import { LiveDemoViewer } from '~/components/live-demo';
import { Link } from '~/components/link';
import { Text } from '~/components/text';
import {
  ProjectContainer,
  ProjectHeader,
  ProjectSection,
  ProjectSectionContent,
  ProjectSectionHeading,
  ProjectSectionText,
  ProjectTextRow,
} from '~/layouts/project';
import { getProjectBySlug as fetchProject } from '~/utils/api';
import { getApiUrl } from '~/utils/api-url';
import { resolveProjectMedia } from '~/utils/media-url';
import { baseMeta } from '~/utils/meta';
import { Link as RouterLink, useLoaderData, useSearchParams } from '@remix-run/react';
import { json } from '@remix-run/cloudflare';
import styles from './project-detail.module.css';

export async function clientLoader({ params }) {
  const project = await fetchProject(params.slug);

  if (!project) {
    throw new Response('Project not found', { status: 404 });
  }

  return { project: resolveProjectMedia(project, getApiUrl()) };
}

export const meta = ({ data, params }) => {
  if (!data?.project) {
    return baseMeta({
      title: 'Project not found',
      description: 'This project could not be found.',
      pathname: '/portfolio',
      robots: 'noindex, follow',
    });
  }

  return baseMeta({
    title: data.project.title,
    description: data.project.description,
    prefix: 'Projects',
    pathname: params?.slug ? `/projects/${params.slug}` : '/portfolio',
    keywords: [
      'website development',
      'web development',
      'systems design',
      data.project.category,
      ...(data.project.technologies || []).slice(0, 6),
      data.project.title,
    ],
  });
};

export const ProjectDetail = () => {
  const { project } = useLoaderData();
  const [searchParams, setSearchParams] = useSearchParams();
  const isDemo = searchParams.get('view') === 'demo';

  function openDemo() {
    setSearchParams({ view: 'demo' });
  }

  function closeDemo() {
    setSearchParams({});
  }

  if (isDemo) {
    return <LiveDemoViewer project={project} onExit={closeDemo} />;
  }

  const domain = new URL(project.liveLink).hostname.replace('www.', '');

  return (
    <>
      <ProjectContainer className={styles.project}>
        <ProjectHeader
          title={project.title}
          description={project.description}
          linkLabel="Visit site"
          url={project.liveLink}
          roles={project.roles}
        />
        <ProjectSection padding="none" className={styles.actions}>
          <ProjectSectionContent>
            <div className={styles.buttons}>
              <Button href={project.liveLink} icon="link" iconHoverShift>
                Visit site
              </Button>
              <Button secondary onClick={openDemo} icon="play">
                Live demo
              </Button>
              <RouterLink to="/portfolio" className={styles.backLink}>
                ← Back to portfolio
              </RouterLink>
            </div>
          </ProjectSectionContent>
        </ProjectSection>
        <ProjectSection padding="none" className={styles.section}>
          <ProjectSectionContent>
            <ProjectTextRow width="m">
              <ProjectSectionHeading>Problem</ProjectSectionHeading>
              <ProjectSectionText as="p">{project.problem}</ProjectSectionText>
            </ProjectTextRow>
          </ProjectSectionContent>
        </ProjectSection>
        <ProjectSection padding="none" className={styles.section}>
          <ProjectSectionContent>
            <ProjectTextRow width="m">
              <ProjectSectionHeading>Solution</ProjectSectionHeading>
              <ProjectSectionText as="p">{project.description}</ProjectSectionText>
            </ProjectTextRow>
          </ProjectSectionContent>
        </ProjectSection>
        <ProjectSection padding="none" className={styles.section}>
          <ProjectSectionContent>
            <ProjectTextRow width="m">
              <ProjectSectionHeading>Technologies</ProjectSectionHeading>
              <ProjectSectionText as="div">
                <div className={styles.tags}>
                  {project.technologies.map(tech => (
                    <span key={tech} className={styles.tag}>
                      {tech}
                    </span>
                  ))}
                </div>
              </ProjectSectionText>
            </ProjectTextRow>
          </ProjectSectionContent>
        </ProjectSection>
        <ProjectSection padding="none" className={styles.section}>
          <ProjectSectionContent>
            <ProjectTextRow width="m">
              <ProjectSectionHeading>Live preview</ProjectSectionHeading>
              <ProjectSectionText as="p">
                Explore the deployed site at{' '}
                <Link href={project.liveLink}>{domain}</Link>, or open the interactive
                demo viewer with fullscreen mode.
              </ProjectSectionText>
              <div className={styles.previewCard}>
                <div className={styles.previewGrid} aria-hidden />
                <div className={styles.previewContent}>
                  <Text size="l" as="p">
                    {project.title}
                  </Text>
                  <Text size="s" secondary as="p">
                    {domain}
                  </Text>
                  <div className={styles.previewActions}>
                    <Button secondary href={project.liveLink} icon="link">
                      Visit site
                    </Button>
                    <Button onClick={openDemo} icon="play">
                      Live demo
                    </Button>
                  </div>
                </div>
              </div>
            </ProjectTextRow>
          </ProjectSectionContent>
        </ProjectSection>
      </ProjectContainer>
      <Footer />
    </>
  );
};
