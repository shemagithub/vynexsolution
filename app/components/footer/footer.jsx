import { Link } from '~/components/link';
import { Text } from '~/components/text';
import { useLanguage } from '~/components/language-provider/language-provider';
import { useSiteConfig } from '~/components/site-config-provider';
import { classes } from '~/utils/style';
import styles from './footer.module.css';

export const Footer = ({ className }) => {
  const { t } = useLanguage();
  const { name } = useSiteConfig();

  return (
    <footer className={classes(styles.footer, className)}>
      <Text size="s" align="center">
        <span className={styles.date}>
          {`© ${new Date().getFullYear()} ${name}.`}
        </span>
        <Link secondary className={styles.link} href="/about">
          {t.footer.crafted}
        </Link>
      </Text>
    </footer>
  );
};
