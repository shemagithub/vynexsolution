import { Footer } from '~/components/footer';
import { baseMeta } from '~/utils/meta';
import { Intro } from './intro';
import { Profile } from './profile';
import { ProjectSummary } from './project-summary';
import { ServicesSection } from './services-section';
import { Testimonials } from './testimonials';
import { CtaSection } from './cta-section';
import { useEffect, useRef, useState } from 'react';
import { json } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { loadHomePageData, refreshFromApi } from '~/utils/page-loaders';
import config from '~/config.json';
import styles from './home.module.css';

export async function clientLoader() {
  return loadHomePageData();
}

clientLoader.hydrate = true;

export const meta = () => {
  return baseMeta({
    title: 'Web, Mobile, IoT & Smart Systems',
    description: `${config.name} — a tech agency in Kigali, Rwanda building web apps, mobile applications, IoT systems, and digital solutions.`,
  });
};

export const links = () => [];

export const Home = () => {
  const { homeServices, testimonials: testimonialItems, featuredProjects, homeAbout } = useLoaderData();
  const [visibleSectionIds, setVisibleSectionIds] = useState(() => new Set());
  const [scrollIndicatorHidden, setScrollIndicatorHidden] = useState(false);
  const intro = useRef();
  const services = useRef();
  const projectOne = useRef();
  const projectTwo = useRef();
  const projectThree = useRef();
  const testimonials = useRef();
  const details = useRef();
  const cta = useRef();
  const projectRefs = [projectOne, projectTwo, projectThree];

  useEffect(() => {
    const sectionRefs = [
      intro,
      services,
      ...projectRefs.slice(0, featuredProjects.length),
      testimonials,
      details,
      cta,
    ];

    const sectionObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting || !entry.target.id) return;
          sectionObserver.unobserve(entry.target);
          setVisibleSectionIds(prev => {
            if (prev.has(entry.target.id)) return prev;
            const next = new Set(prev);
            next.add(entry.target.id);
            return next;
          });
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 }
    );

    const indicatorObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry) setScrollIndicatorHidden(!entry.isIntersecting);
      },
      { rootMargin: '-100% 0px 0px 0px' }
    );

    sectionRefs.forEach(ref => {
      const element = ref.current;
      if (element instanceof Element && element.id) {
        sectionObserver.observe(element);
      }
    });

    if (intro.current instanceof Element) {
      indicatorObserver.observe(intro.current);
    }

    return () => {
      sectionObserver.disconnect();
      indicatorObserver.disconnect();
    };
  }, [featuredProjects.length]);

  return (
    <div className={styles.home}>
      <Intro
        id="intro"
        sectionRef={intro}
        scrollIndicatorHidden={scrollIndicatorHidden}
      />
      <ServicesSection
        id="services"
        sectionRef={services}
        visible={visibleSectionIds.has('services')}
        homeServices={homeServices}
      />
      {featuredProjects.map((project, index) => (
        <ProjectSummary
          key={project.slug}
          id={`project-${index + 1}`}
          sectionRef={projectRefs[index]}
          visible={visibleSectionIds.has(`project-${index + 1}`)}
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
        sectionRef={testimonials}
        visible={visibleSectionIds.has('testimonials')}
        testimonials={testimonialItems}
      />
      <Profile
        sectionRef={details}
        visible={visibleSectionIds.has('details')}
        id="details"
        home={homeAbout}
      />
      <CtaSection
        id="cta"
        sectionRef={cta}
        visible={visibleSectionIds.has('cta')}
      />
      <Footer />
    </div>
  );
};
