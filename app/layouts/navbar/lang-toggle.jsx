import { languages } from '~/data/translations';
import { useLanguage } from '~/components/language-provider/language-provider';
import styles from './lang-toggle.module.css';

export function LangToggle({ isMobile }) {
  const { lang, changeLang } = useLanguage();

  return (
    <div className={styles.toggle} data-mobile={isMobile || undefined}>
      {languages.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          className={styles.button}
          data-active={lang === code || undefined}
          aria-label={`Switch to ${label}`}
          aria-pressed={lang === code}
          onClick={() => changeLang(code)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
