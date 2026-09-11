import { useEffect, useState } from 'react';
import { Heading } from '~/components/heading';
import { Text } from '~/components/text';
import { Button } from '~/components/button';
import { Icon } from '~/components/icon';
import { VisuallyHidden } from '~/components/visually-hidden';
import { Link, NavLink, Outlet, useLocation } from '@remix-run/react';
import { Form } from '@remix-run/react';
import styles from './admin.module.css';

const SIDEBAR_STORAGE_KEY = 'admin-sidebar-expanded';

const navItems = [
  { label: 'Dashboard', to: '/admin', icon: 'home' },
  { label: 'Projects', to: '/admin/projects', icon: 'folder' },
  { label: 'Services', to: '/admin/services', icon: 'link' },
  { label: 'Blog', to: '/admin/articles', icon: 'document' },
  { label: 'Testimonials', to: '/admin/testimonials', icon: 'star' },
  { label: 'Pricing', to: '/admin/pricing', icon: 'tag' },
  { label: 'About Us', to: '/admin/about', icon: 'info' },
  { label: 'Mail', to: '/admin/mail', icon: 'mail' },
  { label: 'Contacts', to: '/admin/contacts', icon: 'users' },
  { label: 'Quotes', to: '/admin/quotes', icon: 'document' },
  { label: 'Quote options', to: '/admin/quote-options', icon: 'settings' },
  { label: 'Settings', to: '/admin/settings', icon: 'settings' },
];

function readSidebarExpanded() {
  if (typeof window === 'undefined') return true;
  const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
  return stored !== 'false';
}

export function AdminLayout({ user }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const location = useLocation();
  const isFullWidth = location.pathname.startsWith('/admin/mail');

  useEffect(() => {
    setSidebarExpanded(readSidebarExpanded());
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  function toggleSidebar() {
    setSidebarExpanded(current => {
      const next = !current;
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      return next;
    });
  }

  return (
    <div
      className={styles.admin}
      data-menu-open={menuOpen || undefined}
      data-sidebar-collapsed={sidebarExpanded ? undefined : true}
    >
      {menuOpen && (
        <button
          type="button"
          className={styles.backdrop}
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside
        id="admin-sidebar"
        className={styles.sidebar}
        data-collapsed={sidebarExpanded ? undefined : true}
      >
        <div className={styles.sidebarHeader}>
          <Link to="/" className={styles.brand} onClick={() => setMenuOpen(false)}>
            <span className={styles.brandMark} aria-hidden="true">
              V
            </span>
            <span className={styles.brandText}>VYNEX ADMIN</span>
          </Link>

          <button
            type="button"
            className={styles.sidebarToggle}
            aria-expanded={sidebarExpanded}
            aria-label={sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
            onClick={toggleSidebar}
          >
            <Icon icon={sidebarExpanded ? 'chevron-left' : 'chevron-right'} />
          </button>

          <button
            type="button"
            className={styles.sidebarClose}
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          >
            <Icon icon="close" />
          </button>
        </div>

        <nav className={styles.nav} aria-label="Admin navigation">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin'}
              className={styles.navLink}
              title={sidebarExpanded ? undefined : item.label}
              onClick={() => setMenuOpen(false)}
            >
              <Icon icon={item.icon} className={styles.navIcon} size={20} />
              <span className={styles.navLabel}>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <Form method="post" action="/admin/logout" className={styles.logout}>
          <Button
            secondary
            type="submit"
            icon="logout"
            iconOnly={!sidebarExpanded}
            aria-label="Sign out"
            className={styles.logoutButton}
          >
            {sidebarExpanded ? 'Sign out' : null}
          </Button>
        </Form>
      </aside>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <div className={styles.topbarStart}>
            <button
              type="button"
              className={styles.menuButton}
              aria-expanded={menuOpen}
              aria-controls="admin-sidebar"
              onClick={() => setMenuOpen(open => !open)}
            >
              <Icon icon={menuOpen ? 'close' : 'menu'} />
              <VisuallyHidden>{menuOpen ? 'Close menu' : 'Open menu'}</VisuallyHidden>
            </button>
            <Heading level={4} as="h1" className={styles.topbarTitle}>
              Admin Portal
            </Heading>
          </div>
          <Text secondary size="s" className={styles.user}>
            {user?.name || user?.email}
          </Text>
        </header>
        <div className={`${styles.content} ${isFullWidth ? styles.contentFull : ''}`}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
