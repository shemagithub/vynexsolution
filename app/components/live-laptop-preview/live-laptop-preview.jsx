import { Button } from '~/components/button';
import { Text } from '~/components/text';
import { useHydrated } from '~/hooks/useHydrated';
import { useEffect, useRef, useState } from 'react';
import styles from './live-laptop-preview.module.css';

const IFRAME_WIDTH = 1440;
const IFRAME_HEIGHT = 900;
const LIVE_EMBED_QUERY = '(min-width: 1041px) and (prefers-reduced-motion: no-preference)';

function getHostname(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function useAllowLiveEmbed() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(LIVE_EMBED_QUERY);
    const update = () => setAllowed(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  return allowed;
}

export function LiveLaptopPreview({ liveUrl, previewImage, title, visible, onReady }) {
  const [status, setStatus] = useState('loading');
  const [iframeActive, setIframeActive] = useState(false);
  const viewportRef = useRef(null);
  const iframeRef = useRef(null);
  const onReadyRef = useRef(onReady);
  const mountedRef = useRef(true);
  const [scale, setScale] = useState(1);
  const isHydrated = useHydrated();
  const allowLiveEmbed = useAllowLiveEmbed();
  const hostname = liveUrl ? getHostname(liveUrl) : '';

  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (iframeRef.current) {
        iframeRef.current.src = 'about:blank';
      }
    };
  }, []);

  useEffect(() => {
    if (!viewportRef.current) return;

    const updateScale = () => {
      if (!viewportRef.current) return;
      const { width, height } = viewportRef.current.getBoundingClientRect();
      setScale(Math.min(width / IFRAME_WIDTH, height / IFRAME_HEIGHT));
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(viewportRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || !isHydrated) return;

    if (!liveUrl || !allowLiveEmbed) {
      if (mountedRef.current) {
        setStatus(previewImage ? 'fallback' : liveUrl ? 'fallback' : 'empty');
        onReadyRef.current?.();
      }
      return;
    }

    setIframeActive(true);
    if (mountedRef.current) setStatus('loading');

    const timer = window.setTimeout(() => {
      if (!mountedRef.current) return;
      setStatus(current => {
        if (current !== 'loading') return current;
        onReadyRef.current?.();
        return 'fallback';
      });
    }, 4500);

    return () => window.clearTimeout(timer);
  }, [liveUrl, previewImage, visible, isHydrated, allowLiveEmbed]);

  useEffect(() => {
    if ((status === 'fallback' || status === 'empty') && iframeRef.current) {
      iframeRef.current.src = 'about:blank';
    }
  }, [status]);

  function handleLoad() {
    if (!mountedRef.current) return;
    setStatus('ready');
    onReadyRef.current?.();
  }

  function handleError() {
    if (!mountedRef.current) return;
    if (iframeRef.current) {
      iframeRef.current.src = 'about:blank';
    }
    setStatus('fallback');
    onReadyRef.current?.();
  }

  const isLive = status === 'ready';
  const canEmbed = allowLiveEmbed && isHydrated;
  const showIframe = canEmbed && visible && liveUrl && (status === 'loading' || status === 'ready');
  const showFallbackImage = previewImage && (status === 'fallback' || !liveUrl || !allowLiveEmbed);
  const showEmptyState = !liveUrl && !previewImage;
  const showChrome = isLive || showIframe;

  return (
    <div className={styles.laptop} data-visible={visible || undefined}>
      <div className={styles.lid}>
        <div className={styles.camera} aria-hidden />
        <div
          className={styles.screen}
          data-loading={status === 'loading' || undefined}
          data-ready={isLive || showFallbackImage || undefined}
          data-live={isLive || undefined}
        >
          {showChrome && liveUrl && (
            <div className={styles.chrome}>
              <div className={styles.dots} aria-hidden>
                <span />
                <span />
                <span />
              </div>
              <span className={styles.url}>{hostname}</span>
              {isLive && (
                <span className={styles.liveBadge}>
                  <span className={styles.liveDot} aria-hidden />
                  Live
                </span>
              )}
            </div>
          )}

          <div className={styles.viewport} ref={viewportRef}>
            {canEmbed && iframeActive && liveUrl && (
              <div
                className={styles.frameWrap}
                hidden={!showIframe}
                style={{
                  width: IFRAME_WIDTH,
                  height: IFRAME_HEIGHT,
                  transform: `scale(${scale})`,
                }}
              >
                <iframe
                  ref={iframeRef}
                  className={styles.frame}
                  src={liveUrl}
                  title={`Live preview of ${title}`}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onLoad={handleLoad}
                  onError={handleError}
                />
              </div>
            )}

            {showFallbackImage && (
              <img
                className={styles.fallbackImage}
                src={previewImage}
                alt={`${title} preview`}
                loading="lazy"
                decoding="async"
              />
            )}

            {showEmptyState && (
              <div className={styles.state}>
                <Text size="s">Add a live URL or preview image for this project.</Text>
              </div>
            )}

            {status === 'fallback' && liveUrl && !previewImage && (
              <div className={styles.state}>
                <Text size="s" as="p">
                  {allowLiveEmbed
                    ? 'This site cannot be embedded here.'
                    : 'Open the live site to explore this project.'}
                </Text>
                <Button secondary href={liveUrl} icon="link">
                  Open live site
                </Button>
              </div>
            )}
          </div>

          {status === 'loading' && showIframe && (
            <div className={styles.state}>
              <span className={styles.loader} aria-hidden />
              <Text size="s">Starting live demo…</Text>
            </div>
          )}
        </div>
      </div>
      <div className={styles.base} aria-hidden />
      <div className={styles.glow} aria-hidden />
    </div>
  );
}
