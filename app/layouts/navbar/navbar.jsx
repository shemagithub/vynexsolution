import { Icon } from '~/components/icon';
import { SiteLogo } from '~/components/site-logo';
import { useTheme } from '~/components/theme-provider';
import { tokens } from '~/components/theme-provider/theme';
import { Transition } from '~/components/transition';
import { useScrollToHash } from '~/hooks';
import { Link as RouterLink, useLocation } from '@remix-run/react';
import { useEffect, useRef, useState } from 'react';
import { cssProps, msToNum, numToMs } from '~/utils/style';
import { NavToggle } from './nav-toggle';
import { ThemeToggle } from './theme-toggle';
import themeToggleStyles from './theme-toggle.module.css';
import { LangToggle } from './lang-toggle';
import { useLanguage } from '~/components/language-provider/language-provider';
import { navLinks, getSocialLinks } from './nav-data';
import config from '~/config.json';
import styles from './navbar.module.css';

export const Navbar = ({ siteConfig = config }) => {
  const [current, setCurrent] = useState();
  const [menuOpen, setMenuOpen] = useState(false);
  const [target, setTarget] = useState();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const location = useLocation();
  const headerRef = useRef();
  const scrollToHash = useScrollToHash();

  useEffect(() => {
    // Prevent ssr mismatch by storing this in state
    setCurrent(`${location.pathname}${location.hash}`);
  }, [location]);

  // Handle smooth scroll nav items
  useEffect(() => {
    if (!target || location.pathname !== '/') return;
    setCurrent(`${location.pathname}${target}`);
    scrollToHash(target, () => setTarget(null));
  }, [location.pathname, scrollToHash, target]);

  // Handle swapping the theme when intersecting with inverse themed elements
  useEffect(() => {
    const navItems = document.querySelectorAll('[data-navbar-item]');
    const inverseTheme = theme === 'dark' ? 'light' : 'dark';
    const { innerHeight } = window;

    let inverseMeasurements = [];
    let navItemMeasurements = [];

    const isOverlap = (rect1, rect2, scrollY) => {
      return !(rect1.bottom - scrollY < rect2.top || rect1.top - scrollY > rect2.bottom);
    };

    const resetNavTheme = () => {
      for (const measurement of navItemMeasurements) {
        measurement.element.dataset.theme = '';
      }
    };

    const handleInversion = () => {
      const invertedElements = document.querySelectorAll(
        `[data-theme='${inverseTheme}'][data-invert]`
      );

      if (!invertedElements) return;

      inverseMeasurements = Array.from(invertedElements).map(item => ({
        element: item,
        top: item.offsetTop,
        bottom: item.offsetTop + item.offsetHeight,
      }));

      const { scrollY } = window;

      resetNavTheme();

      for (const inverseMeasurement of inverseMeasurements) {
        if (
          inverseMeasurement.top - scrollY > innerHeight ||
          inverseMeasurement.bottom - scrollY < 0
        ) {
          continue;
        }

        for (const measurement of navItemMeasurements) {
          if (isOverlap(inverseMeasurement, measurement, scrollY)) {
            measurement.element.dataset.theme = inverseTheme;
          } else {
            measurement.element.dataset.theme = '';
          }
        }
      }
    };

    // Currently only the light theme has dark full-width elements
    if (theme === 'light') {
      navItemMeasurements = Array.from(navItems).map(item => {
        const rect = item.getBoundingClientRect();

        return {
          element: item,
          top: rect.top,
          bottom: rect.bottom,
        };
      });

      document.addEventListener('scroll', handleInversion);
      handleInversion();
    }

    return () => {
      document.removeEventListener('scroll', handleInversion);
      resetNavTheme();
    };
  }, [theme, location.key]);

  // Check if a nav item should be active
  const getCurrent = (url = '') => {
    const nonTrailing = current?.endsWith('/') ? current?.slice(0, -1) : current;

    if (url === nonTrailing) {
      return 'page';
    }

    return '';
  };

  // Store the current hash to scroll to
  const handleNavItemClick = event => {
    const hash = event.currentTarget.href.split('#')[1];
    setTarget(null);

    if (hash && location.pathname === '/') {
      setTarget(`#${hash}`);
      event.preventDefault();
    }
  };

  const handleMobileNavClick = event => {
    handleNavItemClick(event);
    if (menuOpen) setMenuOpen(false);
  };

  const handleMenuToggle = event => {
    event.stopPropagation();
    setMenuOpen(open => !open);
  };

  useEffect(() => {
    if (!menuOpen) {
      document.body.style.removeProperty('overflow');
      return undefined;
    }

    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.removeProperty('overflow');
    };
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.hash]);

  return (
    <header className={styles.navbar} ref={headerRef}>
      <RouterLink
        unstable_viewTransition
        prefetch="intent"
        to={location.pathname === '/' ? '/#intro' : '/'}
        data-navbar-item
        className={styles.logo}
        aria-label={`${siteConfig.name || config.name}, ${siteConfig.role || config.role}`}
        onClick={handleMobileNavClick}
      >
        <SiteLogo
          highlight
          logoLight={siteConfig.logoLight}
          logoDark={siteConfig.logoDark}
        />
        <span className={styles.brandName}>{siteConfig.name || config.name}</span>
      </RouterLink>
      <div className={styles.mobileHeaderActions}>
        <ThemeToggle
          className={`${themeToggleStyles.mobileThemeToggle} ${styles.mobileAction}`}
        />
        <NavToggle
          className={styles.mobileAction}
          menuOpen={menuOpen}
          onClick={handleMenuToggle}
        />
      </div>
      <nav className={styles.nav}>
        <div className={styles.navList}>
          {navLinks.map(({ label, pathname, key }) => (
            <RouterLink
              unstable_viewTransition
              prefetch="intent"
              to={pathname}
              key={label}
              data-navbar-item
              className={styles.navLink}
              aria-current={getCurrent(pathname)}
              onClick={handleNavItemClick}
            >
              {t.nav[key] || label}
            </RouterLink>
          ))}
        </div>
        <NavbarIcons desktop siteConfig={siteConfig} />
        <LangToggle />
      </nav>
      <Transition unmount in={menuOpen} timeout={msToNum(tokens.base.durationL)}>
        {({ visible, nodeRef }) => (
          <nav className={styles.mobileNav} data-visible={visible} ref={nodeRef}>
            {navLinks.map(({ label, pathname, key }, index) => (
              <RouterLink
                unstable_viewTransition
                prefetch="intent"
                to={pathname}
                key={label}
                className={styles.mobileNavLink}
                data-visible={visible}
                aria-current={getCurrent(pathname)}
                onClick={handleMobileNavClick}
                style={cssProps({
                  transitionDelay: numToMs(
                    Number(msToNum(tokens.base.durationS)) + index * 50
                  ),
                })}
              >
                {t.nav[key] || label}
              </RouterLink>
            ))}
            <NavbarIcons siteConfig={siteConfig} />
            <LangToggle isMobile />
          </nav>
        )}
      </Transition>
      <ThemeToggle className={themeToggleStyles.desktopThemeToggle} data-navbar-item />
    </header>
  );
};

const NavbarIcons = ({ desktop, siteConfig = config }) => {
  const links = getSocialLinks(siteConfig);

  return (
  <div className={styles.navIcons}>
    {links.map(({ label, url, icon }) => (
      <a
        key={label}
        data-navbar-item={desktop || undefined}
        className={styles.navIconLink}
        aria-label={label}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Icon className={styles.navIcon} icon={icon} />
      </a>
    ))}
  </div>
  );
};
