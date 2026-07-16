import { useRouteLoaderData } from '@remix-run/react';
import { Monogram } from '~/components/monogram';
import { useTheme } from '~/components/theme-provider';
import { resolveMediaUrl } from '~/utils/media-url';
import { classes } from '~/utils/style';
import styles from './site-logo.module.css';

export function SiteLogo({ logoLight, logoDark, className, highlight = true, apiUrl, ...props }) {
  const { theme } = useTheme();
  const rootData = useRouteLoaderData('root');
  const resolvedApiUrl = apiUrl || rootData?.apiUrl;
  const lightSrc = resolveMediaUrl(logoLight, resolvedApiUrl);
  const darkSrc = resolveMediaUrl(logoDark, resolvedApiUrl);

  // Light mode uses the dark logo; dark mode uses the light logo.
  const src = theme === 'dark' ? lightSrc || darkSrc : darkSrc || lightSrc;

  if (src) {
    return (
      <span className={classes(styles.wrapper, className)} {...props}>
        <img src={src} alt="" aria-hidden className={styles.logo} />
      </span>
    );
  }

  return <Monogram highlight={highlight} className={className} {...props} />;
}
