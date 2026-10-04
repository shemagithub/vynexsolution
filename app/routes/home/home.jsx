import { Footer } from '~/components/footer';
import { pageMeta } from '~/utils/meta';
import { Intro } from './intro';
import { Profile } from './profile';
import { ProjectSummary } from './project-summary';
import { ServicesSection } from './services-section';
import { Testimonials } from './testimonials';
import { CtaSection } from './cta-section';
import { useEffect, useRef, useState } from 'react';
import { useLoaderData } from '@remix-run/react';
import { loadHomePageData, loadHomePageDataStatic } from '~/utils/page-loaders';
import styles from './home.module.css';

export async function clientLoader() {
  return loadHomePageDataStatic();
}

export const meta = () => pageMeta('/');

export const links = () => [];

export const Home = () => {
  const initial = useLoaderData();
  const [page, setPage] = useState(initial);
  const { homeServices, testimonials: testimonialItems, featuredProjects, homeAbout } = page;
  const [scrollIndicatorHidden, setScrollIndicatorHidden] = useState(false);
  const intro = useRef();

  useEffect(() => {
    setPage(initial);
  }, [initial]);

  useEffect(() => {
    let cancelled = false;
    loadHomePageData()
      .then(next => {
        if (!cancelled && next?._source === 'api') {
          setPage(next);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const introEl = intro.current;
    if (!(introEl instanceof Element)) return;

    const indicatorObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry) setScrollIndicatorHidden(!entry.isIntersecting);
      },
      { rootMargin: '-100% 0px 0px 0px' }
    );

    indicatorObserver.observe(introEl);
    return () => indicatorObserver.disconnect();
  }, []);

  return (
    <div className={styles.home}>
      <Intro
        id="intro"
        sectionRef={intro}
        scrollIndicatorHidden={scrollIndicatorHidden}
      />
      <ServicesSection
        id="services"
        visible
        homeServices={homeServices}
      />
      {featuredProjects.map((project, index) => (
        <ProjectSummary
          key={project.slug}
          id={`project-${index + 1}`}
          visible
          index={index + 1}
          alternate={index % 2 === 1}
          title={project.title}
          description={project.problem || project.description}
          buttonText="View project"
          buttonLink={`/projects/${project.slug}`}
          model={{
            type: 'laptop',
            alt: project.title,
            liveUrl: project.liveLink,
            previewImage: project.previewImage || '',
          }}
        />
      ))}
      <Testimonials
        id="testimonials"
        visible
        testimonials={testimonialItems}
      />
      <Profile
        visible
        id="details"
        home={homeAbout}
      />
      <CtaSection
        id="cta"
        visible
      />
      <Footer />
    </div>
  );
};
