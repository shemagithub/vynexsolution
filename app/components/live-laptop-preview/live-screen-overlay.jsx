import { Button } from '~/components/button';
import { Text } from '~/components/text';
import { classes } from '~/utils/style';
import { useHydrated } from '~/hooks/useHydrated';
import { useEffect, useRef, useState } from 'react';
import styles from './live-screen-overlay.module.css';

const IFRAME_WIDTH = 1440;
const IFRAME_HEIGHT = 900;

export function LiveScreenOverlay({
  liveUrl,
  previewImage,
  title,
  visible,
  className,
}) {
  const [status, setStatus] = useState('loading');
  const [iframeActive, setIframeActive] = useState(false);
  const [interactive, setInteractive] = useState(false);
  const screenRef = useRef(null);
  const iframeRef = useRef(null);
  const mountedRef = useRef(true);
  const [scale, setScale] = useState(1);
  const isHydrated = useHydrated();

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
    if (!screenRef.current) return;

    const updateScale = () => {
      if (!screenRef.current) return;
      const { width, height } = screenRef.current.getBoundingClientRect();
      setScale(Math.min(width / IFRAME_WIDTH, height / IFRAME_HEIGHT));
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(screenRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    if (!liveUrl) {
      if (mountedRef.current) {
        setStatus(previewImage ? 'fallback' : 'empty');
      }
      return;
    }

    setIframeActive(true);
    if (mountedRef.current) setStatus('loading');

    const timer = window.setTimeout(() => {
      if (!mountedRef.current) return;
      setStatus(current => (current === 'loading' ? 'fallback' : current));
    }, 6000);

    return () => window.clearTimeout(timer);
  }, [liveUrl, previewImage, isHydrated]);

  useEffect(() => {
    if ((status === 'fallback' || status === 'empty') && iframeRef.current) {
      iframeRef.current.src = 'about:blank';
    }
  }, [status]);

  function handleLoad() {
    if (!mountedRef.current) return;
    setStatus('ready');
  }

  function handleError() {
    if (!mountedRef.current) return;
    if (iframeRef.current) {
      iframeRef.current.src = 'about:blank';
    }
    setStatus('fallback');
  }

  const showIframe = isHydrated && liveUrl && (status === 'loading' || status === 'ready');
  const showFallbackImage = previewImage && (status === 'fallback' || !liveUrl);

  return (
    <div
      className={classes(styles.overlay, className)}
      data-visible={visible || undefined}
      ref={screenRef}
      data-interactive={interactive || undefined}
    >
      {isHydrated && iframeActive && liveUrl && (
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
            tabIndex={interactive ? 0 : -1}
          />
        </div>
      )}

      {status === 'loading' && showIframe && (
        <div className={styles.state}>
          <Text size="s">Loading live preview…</Text>
        </div>
      )}

      {showFallbackImage && (
        <img className={styles.fallbackImage} src={previewImage} alt={`${title} preview`} />
      )}

      {(status === 'fallback' || status === 'ready') && liveUrl && !interactive && (
        <button
          type="button"
          className={styles.interactBtn}
          onClick={() => setInteractive(true)}
        >
          Interact
        </button>
      )}

      {status === 'fallback' && liveUrl && !previewImage && (
        <div className={styles.state}>
          <Text size="s" as="p">
            Preview unavailable
          </Text>
          <Button secondary href={liveUrl} icon="link">
            Open site
          </Button>
        </div>
      )}
    </div>
  );
}
