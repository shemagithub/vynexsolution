import { Link } from '~/components/link';
import { Text } from '~/components/text';
import { useLanguage } from '~/components/language-provider/language-provider';
import { classes } from '~/utils/style';
import config from '~/config.json';
import styles from './footer.module.css';

export const Footer = ({ className }) => {
  const { t } = useLanguage();

  return (
    <footer className={classes(styles.footer, className)}>
      <Text size="s" align="center">
        <span className={styles.date}>
          {`© ${new Date().getFullYear()} ${config.name}.`}
        </span>
        <Link secondary className={styles.link} href="/about">
          {t.footer.crafted}
        </Link>
      </Text>
    </footer>
  );
};
