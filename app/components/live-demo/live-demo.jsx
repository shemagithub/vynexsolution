import { Button } from '~/components/button';
import { Icon } from '~/components/icon';
import { Link } from '~/components/link';
import { Text } from '~/components/text';
import { Link as RouterLink } from '@remix-run/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './live-demo.module.css';

export function LiveDemoViewer({ project, onExit }) {
  const [fullscreen, setFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [blocked, setBlocked] = useState(false);
  const containerRef = useRef();
  const iframeRef = useRef();

  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      await containerRef.current?.requestFullscreen();
      setFullscreen(true);
    } else {
      await document.exitFullscreen();
      setFullscreen(false);
    }
  }, []);

  useEffect(() => {
    function handleFullscreenChange() {
      setFullscreen(!!document.fullscreenElement);
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const iframeDoc = iframeRef.current?.contentDocument;
        if (!iframeDoc && loading) {
          // iframe may still be loading or blocked — keep loading state
        }
      } catch {
        // cross-origin — expected, site loaded
        setLoading(false);
      }
    }, 8000);

    return () => clearTimeout(timer);
  }, [loading]);

  function handleIframeLoad() {
    setLoading(false);
    setBlocked(false);
  }

  function handleIframeError() {
    setLoading(false);
    setBlocked(true);
  }

  const domain = new URL(project.liveLink).hostname.replace('www.', '');

  return (
    <div
      className={styles.viewer}
      ref={containerRef}
      data-fullscreen={fullscreen || undefined}
    >
      <header className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <RouterLink to={`/projects/${project.slug}`} className={styles.back}>
            <Icon icon="arrow-left" />
            <span>Back</span>
          </RouterLink>
          <Text size="s" className={styles.brand}>
            {project.title}
          </Text>
        </div>
        <div className={styles.toolbarRight}>
          <button
            type="button"
            className={styles.toolBtn}
            aria-label={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            onClick={toggleFullscreen}
          >
            {fullscreen ? '⤡' : '⛶'}
          </button>
          <Button secondary href={project.liveLink} icon="link">
            Visit site
          </Button>
        </div>
      </header>

      <div className={styles.workspace}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <HeadingBlock title={project.title} domain={domain} />
          </div>
          <Text size="s" as="p" className={styles.sidebarDesc}>
            {project.description}
          </Text>
          <div className={styles.meta}>
            <MetaRow label="Category" value={project.category.toUpperCase()} />
            <MetaRow label="Live URL" value={domain} href={project.liveLink} />
          </div>
          <div className={styles.layers}>
            <Text size="s" className={styles.layersLabel}>
              Site sections
            </Text>
            <ul className={styles.layerList}>
              {['Home', 'Services', 'About', 'Contact'].map(section => (
                <li key={section} className={styles.layerItem}>
                  <span className={styles.layerDot} aria-hidden />
                  <span>{section}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.tech}>
            <Text size="s" className={styles.layersLabel}>
              Technologies
            </Text>
            <div className={styles.tags}>
              {project.technologies.map(tech => (
                <span key={tech} className={styles.tag}>
                  {tech}
                </span>
              ))}
            </div>
          </div>
          {onExit && (
            <button type="button" className={styles.exitDemo} onClick={onExit}>
              Exit live demo
            </button>
          )}
        </aside>

        <div className={styles.stage}>
          <div className={styles.gridOverlay} aria-hidden />
          {loading && (
            <div className={styles.loader}>
              <Text size="s">Loading {domain}…</Text>
            </div>
          )}
          {blocked && (
            <div className={styles.fallback}>
              <Text size="l" as="p">
                This site cannot be embedded in a preview frame.
              </Text>
              <Text size="s" as="p">
                Open it directly in your browser to explore the full experience.
              </Text>
              <Button href={project.liveLink} icon="link">
                Open {domain}
              </Button>
            </div>
          )}
          <iframe
            ref={iframeRef}
            className={styles.frame}
            src={project.liveLink}
            title={`Live demo of ${project.title}`}
            referrerPolicy="no-referrer"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            hidden={blocked}
          />
        </div>
      </div>
    </div>
  );
}

function HeadingBlock({ title, domain }) {
  return (
    <>
      <Text size="s" secondary className={styles.domain}>
        {domain}
      </Text>
      <Text size="l" as="p" className={styles.sidebarTitle}>
        {title}
      </Text>
    </>
  );
}

function MetaRow({ label, value, href }) {
  return (
    <div className={styles.metaRow}>
      <Text size="s" secondary>
        {label}
      </Text>
      {href ? (
        <Link href={href} className={styles.metaValue}>
          {value}
        </Link>
      ) : (
        <Text size="s">{value}</Text>
      )}
    </div>
  );
}
